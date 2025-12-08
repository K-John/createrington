import config from "@/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { loadCommandHandlers } from "./loaders/command-loader";
import { registerInteractionHandler } from "./handlers/interaction-handler";
import { loadEventHandlers } from "./loaders/event-loader";

const BOT_TOKEN = config.discord.bots.main.token;

/**
 * Main Discord bot client instance
 *
 * Configured with neccessary intents and partials:
 * - Guilds: Access to guild/server information
 * - GuildMembers: Access to member join/leave events and member data
 * - GuildMessages: Access to message events in guild channels
 * - MessageContent: Access to actual message content (privileged intent)
 * - DirectMessages: Access to direct messages event
 * - Channel partial: Allows handling of uncached DM channels
 */
const mainBot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

/**
 * Ready event handler - fires once bot successfully connects
 *
 * Logs the bot's username and discriminator to confirm successful login
 * Exits early if user object is not properly initialized
 */
mainBot.once("clientReady", async () => {
  if (!mainBot.user) {
    logger.error("User is not initialized");
    return;
  }

  logger.info("Logged in as", mainBot.user.tag);
});

/**
 * Bot initialization IIFE
 *
 * Perofrms the following startup sequence:
 * 1. Loads all command handlers from the commands directory
 * 2. Registers the interaction handlers to route commands
 * 3. Loads all event handlers from the events directory
 * 4. Authenticates and conencts to Discord gateway
 *
 * If any step fails, logs the error and exits the process
 */
(async () => {
  const commandHandlers = await loadCommandHandlers();
  registerInteractionHandler(mainBot, commandHandlers);
  await loadEventHandlers(mainBot);

  await mainBot.login(BOT_TOKEN);
})().catch((error) => {
  logger.error("Failed to initialize:", error);
  process.exit(1);
});

export default mainBot;
