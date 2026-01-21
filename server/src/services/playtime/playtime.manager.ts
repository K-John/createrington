import config from "@/config";
import { playtimeRepo } from "@/db";
import { PlaytimeService } from "@/services/playtime";
import { MessageCacheService } from "@/services/discord/message/cache";
import { MINECRAFT_SERVERS } from "./config"; // ✅ Import the correct config

// Map of serverId -> PlaytimeService instance
const playtimeServices: Map<number, PlaytimeService> = new Map();

/**
 * Initialize and start playtime tracking services for all configured servers
 *
 * New Architecture:
 * - Uses HTTP notifications from Minecraft mod (primary)
 * - Integrates with message cache for server shutdown detection (fallback)
 * - Performs recovery sync on backend restart (fallback)
 * - Supports multiple servers simultaneously
 *
 * @param messageCacheService - Optional message cache service for server status detection
 */
export async function initializePlaytimeService(
  messageCacheService?: MessageCacheService,
): Promise<void> {
  if (playtimeServices.size > 0) {
    logger.warn("PlaytimeServices already initialized");
    return;
  }

  logger.info("Initializing PlaytimeServices (HTTP mode) for all servers...");

  // ✅ Use MINECRAFT_SERVERS instead of config.servers
  const serverConfigs = Object.values(MINECRAFT_SERVERS);

  if (serverConfigs.length === 0) {
    logger.warn("No Minecraft servers configured. Playtime tracking disabled.");
    return;
  }

  logger.info(
    `Found ${serverConfigs.length} server configuration(s) to initialize`,
  );

  // Validate and initialize services
  const initPromises = serverConfigs.map(async (serverConfig) => {
    const serverId = serverConfig.id;

    try {
      // Validate required fields
      if (!serverConfig.ip) {
        throw new Error(`Server ${serverId} missing 'ip' field`);
      }
      if (!serverConfig.port) {
        throw new Error(`Server ${serverId} missing 'port' field`);
      }

      logger.info(
        `Initializing PlaytimeService for server ${serverId} (${serverConfig.name})...`,
      );
      logger.debug(`  IP: ${serverConfig.ip}, Port: ${serverConfig.port}`);

      // Create service instance
      const service = new PlaytimeService({
        serverIp: serverConfig.ip,
        serverPort: serverConfig.port,
        serverId: serverId,
        pollIntervalMs: 10000,
        statusTimeoutMs: 5000,
        initialDelayMs: 5000,
        maxSyncRetries: 3,
      });

      // Connect repository to handle database operations
      playtimeRepo.connectToService(service, serverId);

      // Initialize and perform recovery sync
      await service.initialize();

      // Store service instance
      playtimeServices.set(serverId, service);

      logger.info(`PlaytimeService initialized for server ${serverId}`);
    } catch (error) {
      logger.error(
        `Failed to initialize PlaytimeService for server ${serverId}:`,
        error,
      );
      // Don't throw - allow other servers to initialize
    }
  });

  await Promise.all(initPromises);

  if (playtimeServices.size === 0) {
    logger.error("No PlaytimeServices successfully initialized");
    return;
  }

  // Integrate with message cache service if provided
  if (messageCacheService) {
    setupMessageCacheIntegration(messageCacheService);
  } else {
    logger.warn(
      "PlaytimeServices initialized without message cache integration. " +
        "Server shutdown detection will not be available.",
    );
  }

  logger.info(
    `PlaytimeServices initialization complete for ${playtimeServices.size}/${serverConfigs.length} server(s)`,
  );
}

/**
 * Sets up integration with message cache service
 *
 * Listens for server start/stop events from Discord relay bot
 * and triggers appropriate playtime service actions.
 *
 * @param messageCacheService - Message cache service instance
 *
 * @private
 */
function setupMessageCacheIntegration(
  messageCacheService: MessageCacheService,
): void {
  logger.info("Setting up message cache integration for playtime services...");

  // Handle server shutdown detected from Discord
  messageCacheService.on("serverClosed", (serverId: number) => {
    const service = playtimeServices.get(serverId);
    if (service) {
      logger.info(
        `Server ${serverId} shutdown detected from message cache - ending all sessions`,
      );
      service.handleServerShutdown();
    } else {
      logger.debug(
        `Received serverClosed event for unknown server ${serverId} (not tracked)`,
      );
    }
  });

  // Handle server startup detected from Discord
  messageCacheService.on("serverStarted", (serverId: number) => {
    const service = playtimeServices.get(serverId);
    if (service) {
      logger.info(`Server ${serverId} startup detected from message cache`);
      service.handleServerStartup();
    } else {
      logger.debug(
        `Received serverStarted event for unknown server ${serverId} (not tracked)`,
      );
    }
  });

  logger.info("Message cache integration configured for all servers");
}

/**
 * Get the playtime service instance for a specific server
 *
 * @param serverId - Server ID
 * @returns PlaytimeService instance
 * @throws Error if service not initialized or server not found
 */
export function getPlaytimeService(serverId: number): PlaytimeService {
  const service = playtimeServices.get(serverId);

  if (!service) {
    if (playtimeServices.size === 0) {
      throw new Error(
        `PlaytimeService not initialized. Call initializePlaytimeService() first.`,
      );
    } else {
      throw new Error(
        `PlaytimeService not found for server ${serverId}. ` +
          `Available servers: ${Array.from(playtimeServices.keys()).join(", ")}`,
      );
    }
  }

  return service;
}

/**
 * Get all active playtime service instances
 *
 * @returns Map of serverId to PlaytimeService
 */
export function getAllPlaytimeServices(): Map<number, PlaytimeService> {
  return new Map(playtimeServices);
}

/**
 * Stop all playtime services and clean up
 */
export function shutdownPlaytimeService(): void {
  if (playtimeServices.size === 0) {
    return;
  }

  logger.info(`Shutting down ${playtimeServices.size} PlaytimeService(s)...`);

  for (const [serverId, service] of playtimeServices) {
    logger.info(`Stopping PlaytimeService for server ${serverId}...`);
    service.stop();
  }

  playtimeServices.clear();
  logger.info("All PlaytimeServices shut down");
}

/**
 * Check if playtime services are initialized
 */
export function isPlaytimeServiceInitialized(): boolean {
  return playtimeServices.size > 0;
}

/**
 * Get status of all playtime services
 */
export function getPlaytimeServicesStatus(): Record<number, any> {
  const status: Record<number, any> = {};

  for (const [serverId, service] of playtimeServices) {
    status[serverId] = service.getStatus();
  }

  return status;
}
