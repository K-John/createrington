import { playtimeRepo } from "@/db";
import { MINECRAFT_SERVERS } from "./config";
import { PlaytimeService } from "./playtime.service";
import { MessageCacheService } from "../discord/message/cache";

/**
 * Manager service for multiple PlaytimeService instances
 *
 * Handles:
 * - Initializing playtime tracking for all configured servers
 * - Providing access to individual server playtime services
 * - Coordinating shutdown of all services
 */
export class PlaytimeManagerService {
  private playtimeServices: Map<number, PlaytimeService> = new Map();

  /**
   * Initialize playtime services for all configured servers
   * Called by the service container during startup
   *
   * @returns Promise resolving when the service is initialized
   */
  async initialize(): Promise<void> {
    logger.info("Initializing PlaytimeManagerService...");

    const serverConfigs = Object.values(MINECRAFT_SERVERS);

    if (serverConfigs.length === 0) {
      logger.warn(
        "No Minecraft servers configured. Playtime tracking disabled.",
      );
      return;
    }

    logger.info(`Initializing ${serverConfigs.length} playtime service(s)`);

    const initPromises = serverConfigs.map(async (serverConfig) => {
      const serverId = serverConfig.id;

      try {
        if (!serverConfig.ip || !serverConfig.port) {
          throw new Error(`Server ${serverId} missing IP or port`);
        }

        logger.info(
          `Initializing PlaytimeService for server ${serverId} (${serverConfig.name})...`,
        );

        const service = new PlaytimeService({
          serverIp: serverConfig.ip,
          serverPort: serverConfig.port,
          serverId,
          pollIntervalMs: 10000,
          statusTimeoutMs: 5000,
          initialDelayMs: 0,
          maxSyncRetries: 3,
        });

        playtimeRepo.connectToService(service, serverId);

        await service.initialize();

        this.playtimeServices.set(serverId, service);

        logger.info(`PlaytimeService initialized for server ${serverId}`);
      } catch (error) {
        logger.error(
          `Failed to initialize PlaytimeService for server ${serverId}:`,
          error,
        );
      }
    });

    await Promise.all(initPromises);

    if (this.playtimeServices.size === 0) {
      throw new Error("No PlaytimeServices initialized");
    }

    logger.info(
      `PlaytimeManagerService initialized with ${this.playtimeServices.size}/${serverConfigs.length} server(s)`,
    );
  }

  /**
   * Shutdown all playtime services
   * Called by the service container during graceful shutdown
   *
   * @returns Promise resolving when the service is stopped
   */
  async shutdown(): Promise<void> {
    if (this.playtimeServices.size === 0) {
      return;
    }

    logger.info(
      `Shutting down ${this.playtimeServices.size} PlaytimeService(s)...`,
    );

    for (const [serverId, service] of this.playtimeServices) {
      logger.info(`Stopping PlaytimeService for server ${serverId}...`);
      service.stop();
    }

    this.playtimeServices.clear();
    logger.info("All PlaytimeServices shut down");
  }

  /**
   * Get playtime service for a specific server
   */
  getService(serverId: number): PlaytimeService | undefined {
    return this.playtimeServices.get(serverId);
  }

  /**
   * Get all playtime services
   */
  getAllServices(): Map<number, PlaytimeService> {
    return new Map(this.playtimeServices);
  }

  /**
   * Check if services are initialized
   */
  isInitialized(): boolean {
    return this.playtimeServices.size > 0;
  }

  /**
   * Get status of all services
   */
  getStatus(): Record<number, any> {
    const status: Record<number, any> = {};
    for (const [serverId, service] of this.playtimeServices) {
      status[serverId] = service.getStatus();
    }
    return status;
  }

  /**
   * Setup integration with message cache service for server shutdown detection
   */
  setupMessageCacheIntegration(messageCacheService: MessageCacheService): void {
    logger.info(
      "Setting up message cache integration for playtime services...",
    );

    messageCacheService.on("serverClosed", (serverId: number) => {
      const service = this.playtimeServices.get(serverId);
      if (service) {
        logger.info(
          `Server ${serverId} shutdown detected - ending all sessions`,
        );
        service.handleServerShutdown();
      }
    });

    messageCacheService.on("serverStarted", (serverId: number) => {
      const service = this.playtimeServices.get(serverId);
      if (service) {
        logger.info(`Server ${serverId} startup detected`);
        service.handleServerStartup();
      }
    });

    logger.info("Message cache integration configured");
  }
}
