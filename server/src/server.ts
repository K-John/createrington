import { env } from "@/config/env/env.config";
import "./logger.global";
import http from "node:http";
import { createApp } from "./app";
import mainBot from "./discord/bots/main";
import pool from "@/db";
import {
  initializePlaytimeService,
  shutdownPlaytimeService,
  isPlaytimeServiceInitialized,
} from "@/services/playtime/playtime.manager";

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
      logger.info("PlaytimeService stopped");
    }

    // Destroy Discord bot
    await mainBot.destroy();
    logger.info("Discord bot destroyed");

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
        "Ignoring PlaytimeService connection error in unhandledRejection"
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
        "Ignoring PlaytimeService connection error in uncaughtException"
      );
      return;
    }

    // For other uncaught exceptions, log and shutdown
    logger.error("Uncaught exception:", error);
    shutdown(httpServer);
  });
}

/**
 * Initializes and starts the HTTP server
 *
 * This function:
 * 1. Creates the Express application
 * 2. Creates an HTTP server instance
 * 3. Sets up process handlers for graceful shutdown
 * 4. Starts listening on the configured PORT
 * 5. Initializes PlaytimeService for Minecraft session tracking
 */
function start(): void {
  const app = createApp();
  const httpServer = http.createServer(app);

  setupProcessHandlers(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`Server started at http://localhost:${PORT}`);
  });

  // Initialize PlaytimeService (runs independently of Discord bot)
  // Do this AFTER server starts and process handlers are set up
  try {
    initializePlaytimeService();
    logger.info(
      "PlaytimeService initialized - will poll Minecraft server every 60s"
    );
  } catch (error) {
    logger.error("Failed to initialize PlaytimeService:", error);
    logger.warn("Bot will continue running without playtime tracking");
  }
}

start();

logger.info(mainBot);
