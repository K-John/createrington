import config from "@/config";
import { webBot } from "./client";
import { RotatingStatusService } from "@/services/discord/status";
import {
  SERVER_STATS_CONFIG,
  ServerStatsService,
} from "@/services/discord/stats";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEventHandlers } from "../common/loaders/event-loader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Rotating status service instance
 */
let statusService: RotatingStatusService;

/**
 * Server stats service instance
 */
let serverStatsService: ServerStatsService;

/**
 * Bot initialization IIFE
 *
 * Performs the following startup sequence:
 * 1. Sets up Discord message service
 * 2. Loads all command handlers from the commands directory
 * 3. Loads all button handlers from the buttons directory
 * 4. Registers the interaction handlers to route commands
 * 5. Loads all event handlers from the events directory
 * 6. Authenticates and connects to Discord gateway
 *
 * If any step fails, logs the error and exits the process
 */
(async () => {
  await webBot.login(config.discord.bots.web.token);

  const eventsPath = path.join(__dirname, "events");

  await loadEventHandlers(webBot, eventsPath);

  webBot.once("clientReady", async () => {
    logger.info("Discord bot ready");

    statusService = new RotatingStatusService(webBot, 60000);
    statusService.start();

    serverStatsService = new ServerStatsService(webBot, SERVER_STATS_CONFIG);
    await serverStatsService.start();

    const stats = statusService.getStats();
    logger.info(
      `Rotating status service initialization with ${stats.total} statuses`,
    );
  });
})().catch((error) => {
  logger.error("Failed to initialize:", error);
  process.exit(1);
});

/**
 * Exports the rotating status service for external access
 */
export function getStatusService(): RotatingStatusService {
  if (!statusService) {
    throw new Error("Status service is not initialized");
  }
  return statusService;
}

export default webBot;
