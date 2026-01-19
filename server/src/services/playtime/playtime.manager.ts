import config from "@/config";
import { playtimeRepo } from "@/db";
import { PlaytimeService } from "@/services/playtime";

let playtimeService: PlaytimeService | null = null;

/**
 * Initialize and start the playtime tracking service
 */
export function initializePlaytimeService(): PlaytimeService {
  if (playtimeService) {
    logger.warn("PlaytimeService already initialized");
    return playtimeService;
  }

  logger.info("Initializing PlaytimeService...");

  // Create service instance
  playtimeService = new PlaytimeService({
    serverIp: config.servers.cogs.ip,
    serverPort: config.servers.cogs.port,
    serverId: config.servers.cogs.id,
    pollIntervalMs: 10000,
    statusTimeoutMs: 5000,
    initialDelayMs: 5000,
  });

  // Connect repository to handle database operations
  playtimeRepo.connectToService(playtimeService);

  // Start tracking
  playtimeService.start();

  logger.info(
    `PlaytimeService started for ${config.servers.cogs.ip}:${config.servers.cogs.port}`,
  );

  return playtimeService;
}

/**
 * Get the current playtime service instance
 * @throws Error if service not initialized
 */
export function getPlaytimeService(): PlaytimeService {
  if (!playtimeService) {
    throw new Error(
      "PlaytimeService not initialized. Call initializePlaytimeService() first.",
    );
  }
  return playtimeService;
}

/**
 * Stop the playtime service and clean up
 */
export function shutdownPlaytimeService(): void {
  if (playtimeService) {
    logger.info("Shutting down PlaytimeService...");
    playtimeService.stop();
    playtimeService = null;
  }
}

/**
 * Check if playtime service is initialized
 */
export function isPlaytimeServiceInitialized(): boolean {
  return playtimeService !== null;
}
