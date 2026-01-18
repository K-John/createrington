import config from "@/config";
import { webBot } from "./client";
import {
  MESSAGE_CACHE_CONFIG,
  MessageCacheService,
} from "@/services/discord/message/cache";

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

  webBot.once("clientReady", async () => {
    logger.info("Discord bot ready");
  });
})().catch((error) => {
  logger.error("Failed to initialize:", error);
  process.exit(1);
});

export default webBot;
