import { env } from "@/config/env/env.config";
import "./logger.global";
import http from "node:http";
import { createApp } from "./app";
import mainBot from "./discord/bots/main";
import webBot from "./discord/bots/web";
import pool from "@/db";
import {
  initializePlaytimeService,
  shutdownPlaytimeService,
  isPlaytimeServiceInitialized,
} from "@/services/playtime/playtime.manager";
import { minecraftRcon } from "./utils/rcon";
import config from "./config";
import { serviceManager } from "./services/service.manager";
import { MESSAGE_CACHE_CONFIG } from "./services/discord/message/cache";

const PORT = env.PORT;

/**
 * Gracefully shuts down the HTTP server and exits the process
 */
async function shutdown(httpServer: http.Server): Promise<void> {
  logger.info("Shutting down...");

  try {
    // Stop playtime service first (ends all active sessions)
    if (isPlaytimeServiceInitialized()) {
      shutdownPlaytimeService();
      await new Promise((resolve) => setTimeout(resolve, 500));
      logger.info("PlaytimeService stopped");
    }

    // Close WebSocket service
    await serviceManager.shutdown();

    await minecraftRcon.shutdown();
    logger.info("RCON connections closed");

    // Destroy main Discord bot
    await mainBot.destroy();
    logger.info("Discord main bot destroyed");

    // Destroy web Discord bot
    await webBot.destroy();
    logger.info("Discord web bot destroyed");

    // Close database connection
    await pool.end();
    logger.info("Database connection closed");

    // Close HTTP server
    httpServer.close(() => {
      logger.info("Server closed. Exiting...");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
}

/**
 * Checks if an error is from PlaytimeService and should be ignored
 */
function isPlaytimeServiceError(error: any): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("socket closed") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("enotfound") ||
    message.includes("connection") ||
    message.includes("minecraft")
  );
}

/**
 * Sets up process event handlers for graceful shutdown and error handling
 */
function setupProcessHandlers(httpServer: http.Server): void {
  process.on("SIGINT", () => shutdown(httpServer));
  process.on("SIGTERM", () => shutdown(httpServer));

  process.on("unhandledRejection", (reason, promise) => {
    if (isPlaytimeServiceError(reason)) {
      logger.debug(
        "Ignoring PlaytimeService connection error in unhandledRejection",
      );
      return;
    }

    logger.error("Unhandled promise rejection:", reason);
    logger.error("Promise:", promise);
    shutdown(httpServer);
  });

  process.on("uncaughtException", (error) => {
    if (isPlaytimeServiceError(error)) {
      logger.debug(
        "Ignoring PlaytimeService connection error in uncaughtException",
      );
      return;
    }

    logger.error("Uncaught exception:", error);
    shutdown(httpServer);
  });
}

/**
 * Initializes and starts the HTTP server with WebSocket support
 */
async function start(): Promise<void> {
  const app = createApp();
  const httpServer = http.createServer(app);

  setupProcessHandlers(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`Server started at http://localhost:${PORT}`);
    logger.info(`WebSocket server ready at ws://localhost:${PORT}`);
  });

  // Wait for web bot to be ready before initializing services
  await new Promise<void>((resolve) => {
    webBot.once("clientReady", () => resolve());
  });

  try {
    // Initialize services WITH message cache integration
    await serviceManager.initialize(httpServer, webBot, MESSAGE_CACHE_CONFIG, {
      cors: {
        origin: config.envMode.isDev
          ? [`http://localhost:${PORT}`, "http://localhost:5173"]
          : [config.meta.links.website],
        credentials: true,
      },
    });

    logger.info("Service manager initialized");

    // NOW initialize PlaytimeService with message cache integration
    const messageCacheService = serviceManager.getMessageCacheService();

    if (messageCacheService) {
      await initializePlaytimeService(messageCacheService);
      logger.info("PlaytimeService initialized with message cache integration");
    } else {
      logger.error(
        "MessageCacheService not available, playtime tracking disabled",
      );
    }

    // Log stats after a delay
    setTimeout(async () => {
      const stats = await serviceManager.getStats();
      logger.info("Service statistics:", stats);
    }, 2000);
  } catch (error) {
    logger.error("Failed to initialize services:", error);
    logger.warn("Server will continue running with limited functionality");
  }
}

start();
