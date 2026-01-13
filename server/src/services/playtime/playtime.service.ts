import EventEmitter from "node:events";
import {
  ActiveSession,
  MinecraftPlayer,
  PlaytimeServiceConfig,
  ServerStatusSnapshot,
  SessionEndEvent,
  SessionStartEvent,
} from "./types";
import { status } from "minecraft-server-util";

export interface PlaytimeServiceEvents {
  sessionStart: (event: SessionStartEvent) => void;
  sessionEnd: (event: SessionEndEvent) => void;
  statusUpdate: (snapshot: ServerStatusSnapshot) => void;
  error: (error: Error) => void;
  serverOffline: () => void;
  serverOnline: () => void;
}

export declare interface PlaytimeService {
  on<K extends keyof PlaytimeServiceEvents>(
    event: K,
    listener: PlaytimeServiceEvents[K]
  ): this;
  emit<K extends keyof PlaytimeServiceEvents>(
    event: K,
    ...args: Parameters<PlaytimeServiceEvents[K]>
  ): boolean;
}

/**
 * Core service for tracking Minecraft player playtime on a single server
 *
 * This service polls a Minecraft server at regular intervals to:
 * - Detect when players join/leave the server
 * - Track active gaming session in memory
 * - Emit events for session lifecycle (start/end/updates)
 * - Provide real-time query methods for session date
 *
 * Architecture:
 * - Uses EventEmitter pattern for loose coupling with consumers
 * - Maintains session state in-memory (Map of UUID -> ActiveSession)
 * - Polls via minecraft-server-util library
 * - Does NOT persist to database
 *
 * Event flow:
 * 1. poll() fetches current server status
 * 2. Compares with in-memory sessions to detect join/leaves
 * 3. Emits sessionStart/sessionEnd events
 * 4. Repository layer listens to event and persists to DB
 *
 * Resilience:
 * - Never crashes on connection errors
 * - Continues polling indefinitely even if server is offline
 * - Ends all sessions after 2 consecutive failed polls
 * - Emits serverOffline/serverOnline events for monitoring
 *
 * Thread Safety:
 * - Not thread-safe (designed for single-threaded Node.js)
 * - All operations are synchronous except poll()
 */
export class PlaytimeService extends EventEmitter {
  private config: Required<PlaytimeServiceConfig>;
  private activeSessions: Map<string, ActiveSession> = new Map();
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;
  private consecutiveFailures = 0;
  private isServerOffline = false;
  private readonly MAX_FAILURES_BEFORE_CLEANUP = 2;

  constructor(config: PlaytimeServiceConfig) {
    super();
    this.config = {
      pollIntervalMs: 30000,
      statusTimeoutMs: 5000,
      initialDelayMs: 5000,
      ...config,
    };
  }

  /**
   * Starts the playtime tracking service
   *
   * Begins polling the Minecraft server at the configured interval
   * If service is already running, logs a warning and returns early
   *
   * Behavior:
   * - Waits initialDelayMs (default 5s) before first poll
   * - Sets up recurring interval for subsequent polls
   * - Sets isRunning flag to prevent duplicate starts
   *
   * @throws Does not throw - errors are emitted via 'error' event
   */
  public start(): void {
    if (this.isRunning) {
      logger.warn(`PlaytimeService is already running`);
      return;
    }

    this.isRunning = true;
    logger.info(
      `Starting PlaytimeService for ${this.config.serverIp}:${this.config.serverPort} (first poll in ${this.config.initialDelayMs}ms)`
    );

    // Wait before first poll to let other services initialize
    setTimeout(() => {
      if (this.isRunning) {
        this.poll();
        this.intervalId = setInterval(
          () => this.poll(),
          this.config.pollIntervalMs
        );
      }
    }, this.config.initialDelayMs);
  }

  /**
   * Stops the playtime tracking service gracefully
   *
   * Cleanup operations:
   * - Clears the polling interval
   * - Ends all active sessions (emits sessionEnd for each)
   * - Clears in-memory session state
   * - Sets isRunning flag to false
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.endAllSessions();

    logger.info("PlaytimeService stopped");
  }

  /**
   * Gets all currently active player sessions
   *
   * Returns a snapshot of all players currently online on the server
   * Each session includes UUID, username, server ID, and session start time
   *
   * @returns Array of active sessions
   */
  public getActiveSessions(): ActiveSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Checks if a specific player is currently online
   *
   * @param uuid - Minecraft player UUID to check
   * @returns True if player has an active session, false otherwise
   */
  public isPlayerOnline(uuid: string): boolean {
    return this.activeSessions.has(uuid);
  }

  /**
   * Retrieves the active session for a specific player
   *
   * @param uuid - Minecraft player UUID
   * @returns ActiveSession object if player is online, undefined otherwise
   */
  public getSession(uuid: string): ActiveSession | undefined {
    return this.activeSessions.get(uuid);
  }

  /**
   * Gets the current count of online players
   *
   * @returns Number of players with active sessions
   */
  public getOnlineCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Calculates how long a player has been online in their current session
   *
   * @param uuid - Minecraft player UUID
   * @returns Duration in seconds, or null if player is not online
   */
  public getSessionDuration(uuid: string): number | null {
    const session = this.activeSessions.get(uuid);
    if (!session) {
      return null;
    }

    return Math.floor((Date.now() - session.sessionStart.getTime()) / 1000);
  }

  /**
   * Associates a database session ID with an active in-memory session
   *
   * Called by the repository layer after persisting a session to the database
   * This ID is required for emitting sessionEnd events
   *
   * Why this exists:
   * - Service emits sessionStart event (no DB ID yet)
   * - Repository persists to DB and gets auto-generated session ID
   * - Repository calls this method to link DB ID with in-memory session
   * - When player leaves, sessionEnd event includes the DB session ID
   *
   * @param uuid - Minecraft player UUID
   * @param sessionId - Database-generated session ID
   */
  public setSessionId(uuid: string, sessionId: number): void {
    const session = this.activeSessions.get(uuid);
    if (session) {
      session.sessionId = sessionId;
      logger.debug(`Set sessionId ${sessionId} for player ${uuid}`);
    } else {
      logger.warn(`Cannot set sessionId for ${uuid} - session not found`);
    }
  }

  /**
   * Main polling loop - fetches server status and syncs player sessions
   *
   * Workflow:
   * 1. Fetch current server status (player list)
   * 2. Reset failure counter on success
   * 3. Emit statusUpdate event with snapshot
   * 4. Detect new players (in server but not in activeSessions) -> handlePlayerJoin
   * 5. Update usernames for existing players
   * 6. Detect departed players -> handlePlayerLeave
   * 7. Clean up departed players from activeSession map
   *
   * Error Handling:
   * - Catches all connection errors without crashing
   * - Increments failure counter on each error
   * - After 2 consecutive failures, ends all active sessions
   * - Continues polling indefinitely (never gives up)
   * - Emits serverOffline/serverOnline events
   * - Only logs connection errors at debug level
   *
   * @private Internal method called by internal timer
   */
  private async poll(): Promise<void> {
    try {
      const serverStatus = await this.fetchServerStatus();

      // Reset failure counter on successful poll
      if (this.consecutiveFailures > 0) {
        logger.info("Server connection restored");
        this.consecutiveFailures = 0;

        if (this.isServerOffline) {
          this.isServerOffline = false;
          this.emit("serverOnline");
        }
      }

      const onlinePlayers = serverStatus.onlinePlayers;
      const onlineUuids = new Set(onlinePlayers.map((p) => p.uuid));

      this.emit("statusUpdate", serverStatus);

      // Handle players who joined
      for (const player of onlinePlayers) {
        if (!this.activeSessions.has(player.uuid)) {
          this.handlePlayerJoin(player);
        } else {
          const session = this.activeSessions.get(player.uuid)!;
          if (session.username !== player.username) {
            session.username = player.username;
            logger.debug(
              `Updated username for ${player.uuid}: ${player.username}`
            );
          }
        }
      }

      // Handle players who left
      const playersToRemove: string[] = [];
      for (const [uuid, session] of this.activeSessions) {
        if (!onlineUuids.has(uuid)) {
          playersToRemove.push(uuid);
          this.handlePlayerLeave(session);
        }
      }

      playersToRemove.forEach((uuid) => this.activeSessions.delete(uuid));

      if (onlinePlayers.length > 0) {
        logger.info(
          `Synced ${
            onlinePlayers.length
          } online player(s) @ ${new Date().toISOString()}`
        );
      }
    } catch (error) {
      this.consecutiveFailures++;

      const err = error instanceof Error ? error : new Error(String(error));

      // Only log connection errors at debug level to avoid spam
      if (
        err.message.includes("Socket closed") ||
        err.message.includes("ECONNREFUSED") ||
        err.message.includes("ETIMEDOUT") ||
        err.message.includes("ENOTFOUND")
      ) {
        logger.debug(
          `PlaytimeService poll failed (attempt ${this.consecutiveFailures}/${this.MAX_FAILURES_BEFORE_CLEANUP}): ${err.message}`
        );
      } else {
        // Log unexpected errors at error level
        logger.error("PlaytimeService poll failed with unexpected error:", err);
      }

      this.emit("error", err);

      // After 2 consecutive failures, end all sessions
      if (this.consecutiveFailures >= this.MAX_FAILURES_BEFORE_CLEANUP) {
        if (!this.isServerOffline) {
          logger.warn(
            `Server unreachable for ${this.MAX_FAILURES_BEFORE_CLEANUP} consecutive polls - ending all active sessions`
          );
          this.isServerOffline = true;
          this.emit("serverOffline");
          this.endAllSessions();
        }
      }

      // IMPORTANT: We do NOT stop the service - keep polling
      // Service will resume tracking once server comes back online
    }
  }

  /**
   * Fetches current server status via minecraft-server-util library
   *
   * Queries the Minecraft server for:
   * - Online player list (UUID + username)
   * - Current player count
   * - Max player capacity
   *
   * @returns ServerStatusSnapshot with current server state
   * @throws Error if server is unreachable or times out
   *
   * @private Internal helper for poll()
   */
  private async fetchServerStatus(): Promise<ServerStatusSnapshot> {
    const response = await status(
      this.config.serverIp,
      this.config.serverPort,
      {
        timeout: this.config.statusTimeoutMs,
      }
    );

    const onlinePlayers: MinecraftPlayer[] = (
      response.players.sample || []
    ).map((player) => ({
      uuid: player.id,
      username: player.name,
    }));

    return {
      onlinePlayers,
      playerCount: response.players.online,
      maxPlayers: response.players.max,
      timestamp: new Date(),
    };
  }

  /**
   * Handles a player joining the server
   *
   * Creates a new ActiveSession in memory and emits sessionStart event
   * The repository layer listens to this event to persist to database
   *
   * Session State:
   * - sessionId is initially undefined (set later via setSessionId)
   * - sessionStart is set to current timestamp
   *
   * @param player - Player who joined (UUID + username)
   *
   * @private Called internally by poll() when new player detected
   */
  private handlePlayerJoin(player: MinecraftPlayer): void {
    const session: ActiveSession = {
      uuid: player.uuid,
      username: player.username,
      serverId: this.config.serverId,
      sessionStart: new Date(),
    };

    this.activeSessions.set(player.uuid, session);

    const event: SessionStartEvent = {
      uuid: session.uuid,
      username: session.username,
      serverId: session.serverId,
      sessionStart: session.sessionStart,
    };

    this.emit("sessionStart", event);

    logger.debug(`Session started for ${player.username} (${player.uuid})`);
  }

  /**
   * Handles a player leaving the server
   *
   * Calculates session duration and emits sessionEnd event.
   * The repository layer listens to this event to persist final playtime.
   *
   * Important:
   * - Requires sessionId to be set (via setSessionId)
   * - If no sessionId, logs warning and skips emission
   * - This can happen if repository hasn't processed sessionStart yet
   *
   * Session Duration:
   * - Calculated as: (sessionEnd - sessionStart) in seconds
   * - Floor division ensures integer seconds
   *
   * @param session - Active session for player who left
   *
   * @private Called internally by poll() when player departure detected
   */
  private handlePlayerLeave(session: ActiveSession): void {
    const now = new Date();
    const secondsPlayed = Math.floor(
      (now.getTime() - session.sessionStart.getTime()) / 1000
    );

    if (!session.sessionId) {
      logger.warn(
        `Cannot emit sessionEnd for ${session.username} - no sessionId set. ` +
          `This may happen if the repository hasn't processed the sessionStart event yet.`
      );
      return;
    }

    const event: SessionEndEvent = {
      sessionId: session.sessionId,
      uuid: session.uuid,
      username: session.username,
      serverId: session.serverId,
      sessionStart: session.sessionStart,
      sessionEnd: now,
      secondsPlayed,
    };

    this.emit("sessionEnd", event);

    logger.debug(
      `Session ended for ${session.username} (${session.uuid}) - ${secondsPlayed}s played`
    );
  }

  /**
   * Gracefully ends all active sessions
   *
   * Called during service shutdown or when server becomes unreachable
   * to ensure all sessions are properly closed and persisted.
   *
   * Behavior:
   * - Calls handlePlayerLeave for each active session
   * - Emits sessionEnd events for each player
   * - Clears activeSessions map
   *
   * @private Called by stop() method and after consecutive poll failures
   */
  private endAllSessions(): void {
    if (this.activeSessions.size === 0) {
      return;
    }

    logger.info(`Ending ${this.activeSessions.size} active session(s)`);

    for (const session of this.activeSessions.values()) {
      this.handlePlayerLeave(session);
    }
    this.activeSessions.clear();
  }

  /**
   * Gets current service status and configuration
   *
   * Useful for:
   * - Health checks
   * - Debugging
   * - Admin dashboards
   * - Monitoring
   *
   * @returns Object containing runtime status and config
   */
  public getStatus(): {
    isRunning: boolean;
    activeSessions: number;
    consecutiveFailures: number;
    isServerOffline: boolean;
    config: PlaytimeServiceConfig;
  } {
    return {
      isRunning: this.isRunning,
      activeSessions: this.activeSessions.size,
      consecutiveFailures: this.consecutiveFailures,
      isServerOffline: this.isServerOffline,
      config: this.config,
    };
  }

  /**
   * Checks if the service is currently running
   *
   * Simple boolean check for service state.
   * Useful for conditional logic and status checks.
   *
   * @returns true if service is actively polling, false otherwise
   */
  public isServiceRunning(): boolean {
    return this.isRunning;
  }
}
