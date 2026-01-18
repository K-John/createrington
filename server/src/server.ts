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
import { WebSocketService } from "./services/websocket";
import config from "./config";
import { serviceManager } from "./services/service.manager";
import { MESSAGE_CACHE_CONFIG } from "./services/discord/message/cache";

const PORT = env.PORT;

/**
 * Gracefully shuts down the HTTP server and exits the process
 *
 * This function attempts to close all connections and stop the server gracefully
 * If successful, exits with code 0; if an error occurs, exits with code 1
 *
 * @param httpServer - The HTTP server instance to shut down
 * @returns Promise resolving when the shutdown is complete
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

  // Check for common Minecraft server connection errors
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
 *
 * Registers handlers for:
 * - SIGINT: Graceful shutdown on Ctrl+C
 * - SIGTERM: Graceful shutdown on termination signal
 * - unhandledRejection: Catches unhandled promise rejections (but ignores PlaytimeService errors)
 * - uncaughtException: Catches uncaught exceptions
 *
 * @param httpServer - The HTTP server instance to manage
 */
function setupProcessHandlers(httpServer: http.Server): void {
  process.on("SIGINT", () => shutdown(httpServer));
  process.on("SIGTERM", () => shutdown(httpServer));

  process.on("unhandledRejection", (reason, promise) => {
    // Ignore PlaytimeService connection errors - they're handled internally
    if (isPlaytimeServiceError(reason)) {
      logger.debug(
        "Ignoring PlaytimeService connection error in unhandledRejection",
      );
      return;
    }

    // For other unhandled rejections, log and shutdown
    logger.error("Unhandled promise rejection:", reason);
    logger.error("Promise:", promise);
    shutdown(httpServer);
  });

  process.on("uncaughtException", (error) => {
    // Ignore PlaytimeService connection errors - they're handled internally
    if (isPlaytimeServiceError(error)) {
      logger.debug(
        "Ignoring PlaytimeService connection error in uncaughtException",
      );
      return;
    }

    // For other uncaught exceptions, log and shutdown
    logger.error("Uncaught exception:", error);
    shutdown(httpServer);
  });
}

/**
 * Initializes and starts the HTTP server with WebSocket support
 *
 * This function:
 * 1. Creates the Express application
 * 2. Creates an HTTP server instance
 * 3. Initializes WebSocket service
 * 4. Sets up process handlers for graceful shutdown
 * 5. Starts listening on the configured PORT
 * 6. Initializes PlaytimeService for Minecraft session tracking
 * 7. Connects WebSocket to MessageCacheService
 */
function start(): void {
  const app = createApp();
  const httpServer = http.createServer(app);

  setupProcessHandlers(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`Server started at http://localhost:${PORT}`);
    logger.info(`WebSocket server ready at ws://localhost:${PORT}`);
  });

  // Initialize PlaytimeService (runs independently of Discord bot)
  // Do this AFTER server starts and process handlers are set up
  try {
    initializePlaytimeService();
    logger.info(
      "PlaytimeService initialized - will poll Minecraft server every 60s",
    );
  } catch (error) {
    logger.error("Failed to initialize PlaytimeService:", error);
    logger.warn("Bot will continue running without playtime tracking");
  }

  // Connect WebSocket to MessageCache once the web bot is ready
  webBot.once("clientReady", async () => {
    try {
      await serviceManager.initialize(
        httpServer,
        webBot,
        MESSAGE_CACHE_CONFIG,
        {
          cors: {
            origin: config.envMode.isDev
              ? [`http://localhost:${PORT}`, "http://localhost:5173"]
              : [config.meta.links.website],
            credentials: true,
          },
        },
      );

      const stats = await serviceManager.getStats();
      logger.info("Service statistics:", stats);
    } catch (error) {
      logger.error("Failed to initialize services:", error);
      logger.warn("Server will continue running with limited functionality");
    }
  });
}

start();
