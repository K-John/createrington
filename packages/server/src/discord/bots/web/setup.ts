import type { Client } from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEventHandlers } from "../common/loaders/event-loader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load event handlers for web bot
 */
export async function setupWebBotHandlers(bot: Client): Promise<void> {
  logger.info("Loading web bot handlers...");

  const eventsPath = path.join(__dirname, "events");
  await loadEventHandlers(bot, eventsPath);

  logger.info("Web bot handlers loaded");
}
