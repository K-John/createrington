export interface MinecraftPlayer {
  uuid: string;
  username: string;
}

/**
 * Session metadata collected from mod
 */
export interface SessionMetadata {
  displayName?: string;
  gamemode?: string;
  dimension?: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  health?: number;
  experienceLevel?: number;
  ipAddress?: string;
}

export interface ActiveSession {
  uuid: string;
  username: string;
  serverId: number;
  sessionStart: Date;
  sessionId?: number;
  metadata?: SessionMetadata;
}

export interface SessionEndEvent {
  sessionId: number;
  uuid: string;
  username: string;
  serverId: number;
  sessionStart: Date;
  sessionEnd: Date;
  secondsPlayed: number;
}

export interface SessionStartEvent {
  uuid: string;
  username: string;
  serverId: number;
  sessionStart: Date;
  metadata?: SessionMetadata;
}

export interface PlaytimeServiceConfig {
  serverIp: string;
  serverPort: number;
  serverId: number;
  pollIntervalMs?: number;
  statusTimeoutMs?: number;
  initialDelayMs?: number;
  maxSyncRetries?: number;
}

export interface ServerStatusSnapshot {
  onlinePlayers: MinecraftPlayer[];
  playerCount: number;
  maxPlayers: number;
  timestamp: Date;
}

/**
 * Player join data from PresenceAPI
 */
export interface ModPlayerJoinData {
  uuid: string;
  username: string;
  timestamp?: Date;
  displayName?: string;
  gamemode?: string;
  dimension?: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  health?: number;
  experienceLevel?: number;
  ipAddress?: string;
}

/**
 * Player leave data from PresenceAPI
 */
export interface ModPlayerLeaveData {
  uuid: string;
  username: string;
  timestamp?: Date;
}
