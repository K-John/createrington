import { Client } from "discord.js";
import {
  MessageCacheService,
  MessageCacheServiceConfig,
} from "./discord/message/cache";
import { WebSocketService, WebSocketServiceConfig } from "./websocket";
import { Server as HttpServer } from "node:http";

/**
 * Central service manager for coordinating service initialization
 *
 * This class manages the lifecycle of all services and ensures proper
 * initialization order and dependency management
 *
 * Benefits:
 * - Centralized initialization logic
 * - Clear dependency chain
 * - Easier testing and maintenance
 * - Single source of truth for service state
 */
export class ServiceManager {
  private messageCacheService?: MessageCacheService;
  private webSocketService?: WebSocketService;
  private isInitialized = false;

  /**
   * Initializes all services in the correct order
   *
   * @param httpServer - HTTP server for WebSocket service
   * @param discordClient - Discord bot client
   * @param messageCacheConfig - Configuration for message cache
   * @param webSocketConfig - Configuration for WebSocket service
   */
  async initialize(
    httpServer: HttpServer,
    discordClient: Client,
    messageCacheConfig: MessageCacheServiceConfig,
    webSocketConfig?: WebSocketServiceConfig,
  ): Promise<void> {
    if (this.isInitialized) {
      logger.warn("Service Manager already initialized");
      return;
    }

    logger.info("Initializing services...");

    try {
      logger.info("Initializing MessageCacheService...");
      this.messageCacheService = new MessageCacheService(
        discordClient,
        messageCacheConfig,
      );
      await this.messageCacheService.initialize();

      logger.info("Initializing WebSocketService...");
      this.webSocketService = new WebSocketService(httpServer, webSocketConfig);
      await this.webSocketService.initialize(this.messageCacheService);

      this.isInitialized = true;

      logger.info("All services initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize services:", error);
      throw error;
    }
  }

  /**
   * Shutdown all services gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    logger.info("Shutting down services...");

    try {
      if (this.webSocketService) {
        await this.webSocketService.close();
        logger.info("WebSocketService closed");
      }

      this.isInitialized = false;
      logger.info("All services shut down successfully");
    } catch (error) {
      logger.error("Error during service shutdown:", error);
      throw error;
    }
  }

  /**
   * Get MessageCache Service instance
   */
  getMessageCacheService(): MessageCacheService | undefined {
    return this.messageCacheService;
  }

  /**
   * Get WebSocketService instance
   */
  getWebSocketService(): WebSocketService | undefined {
    return this.webSocketService;
  }

  /**
   * Get innitialization status
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service statistics
   */
  async getStats(): Promise<{
    messageCacheStats: Record<number, any>;
    webSocketStats: any;
  }> {
    const stats = {
      messageCacheStats: this.messageCacheService?.getStats() || {},
      webSocketStats: (await this.webSocketService?.getStatus()) || {},
    };

    return stats;
  }
}

export const serviceManager = new ServiceManager();
