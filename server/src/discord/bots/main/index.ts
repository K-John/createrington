import config from "@/config";
import { mainBot } from "./client";
import { loadCommandHandlers } from "./loaders/command-loader";
import { registerInteractionHandler } from "./handlers/interaction-handler";
import { loadEventHandlers } from "./loaders/event-loader";
import { loadButtonHandlers } from "./loaders/button-loader";
import { createDiscordMessageService } from "@/services/discord/messages/message.service";
import { Discord } from "@/discord/constants";

/**
 * Bot initialization IIFE
 *
 * Performs the following startup sequence:
 * 1. Loads all command handlers from the commands directory
 * 2. Registers the interaction handlers to route commands
 * 3. Loads all event handlers from the events directory
 * 4. Authenticates and conencts to Discord gateway
 *
 * If any step fails, logs the error and exits the process
 */
(async () => {
  Discord._setMessageService(createDiscordMessageService(mainBot));
  const commandHandlers = await loadCommandHandlers();
  const buttonHandlers = await loadButtonHandlers();
  registerInteractionHandler(mainBot, commandHandlers, buttonHandlers);
  await loadEventHandlers(mainBot);

  await mainBot.login(config.discord.bots.main.token);
})().catch((error) => {
  logger.error("Failed to initialize:", error);
  process.exit(1);
});

export default mainBot;
