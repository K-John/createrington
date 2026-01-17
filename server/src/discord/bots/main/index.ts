import config from "@/config";
import { mainBot } from "./client";
import { loadCommandHandlers } from "./loaders/command-loader";
import { registerInteractionHandler } from "./handlers/interaction-handler";
import { loadEventHandlers } from "./loaders/event-loader";
import { loadButtonHandlers } from "./loaders/button-loader";
import { createDiscordMessageService } from "@/services/discord/message/message.service";
import { Discord } from "@/discord/constants";
import { TicketService } from "@/services/discord/tickets";
import { startLeaderboardScheduler } from "@/services/discord/leaderboard";
import {
  DailyRoleScheduler,
  RealtimeRoleHandler,
} from "@/services/discord/role";
import { getPlaytimeService } from "@/services/playtime";

let realtimeRoleHandler: RealtimeRoleHandler;
let dailyRoleScheduler: DailyRoleScheduler;

/**
 * Ticket service instance
 * Initialized immediately with the bot client
 */
export const ticketService = new TicketService(mainBot);

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
  Discord._setMessageService(createDiscordMessageService(mainBot));

  const commandHandlers = await loadCommandHandlers();
  const buttonHandlers = await loadButtonHandlers();

  registerInteractionHandler(mainBot, commandHandlers, buttonHandlers);

  await loadEventHandlers(mainBot);

  await mainBot.login(config.discord.bots.main.token);

  mainBot.once("clientReady", () => {
    logger.info("Discord bot ready and ticket service initialized");

    startLeaderboardScheduler();

    const playtimeService = getPlaytimeService();
    realtimeRoleHandler = new RealtimeRoleHandler(mainBot, playtimeService);

    dailyRoleScheduler = new DailyRoleScheduler(mainBot);
    dailyRoleScheduler.start();
    dailyRoleScheduler.triggerManualCheck();
  });
})().catch((error) => {
  logger.error("Failed to initialize:", error);
  process.exit(1);
});

export default mainBot;
