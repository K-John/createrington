import config from "@/config";
import { mainBot } from "./client";
import { registerInteractionHandler } from "./handlers/interaction-handler";
import { createDiscordMessageService } from "@/services/discord/message/message.service";
import { Discord } from "@/discord/constants";
import { TicketService } from "@/services/discord/tickets";
import { startLeaderboardScheduler } from "@/services/discord/leaderboard";
import {
  DailyRoleScheduler,
  RealtimeRoleHandler,
} from "@/services/discord/role";
import { getAllPlaytimeServices } from "@/services/playtime";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEventHandlers } from "../common/loaders/event-loader";
import { loadCommandHandlers } from "../common/loaders/command-loader";
import { loadButtonHandlers } from "../common/loaders/button-loader";
import { memberCleanupService } from "@/services/discord/cleanup/member/member-cleanup.service";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Store all realtime role handlers (one per server)
const realtimeRoleHandlers: Map<number, RealtimeRoleHandler> = new Map();
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

  const commandsPath = path.join(__dirname, "interactions", "slash-commands");
  const buttonsPath = path.join(__dirname, "interactions", "buttons");
  const eventsPath = path.join(__dirname, "events");

  const commandHandlers = await loadCommandHandlers(commandsPath);
  const buttonHandlers = await loadButtonHandlers(buttonsPath);

  registerInteractionHandler(mainBot, commandHandlers, buttonHandlers);

  await loadEventHandlers(mainBot, eventsPath);

  await mainBot.login(config.discord.bots.main.token);

  mainBot.once("clientReady", () => {
    logger.info("Discord bot ready");

    startLeaderboardScheduler();

    // Initialize realtime role handlers for all playtime services
    const allPlaytimeServices = getAllPlaytimeServices();

    for (const [serverId, playtimeService] of allPlaytimeServices) {
      const handler = new RealtimeRoleHandler(mainBot, playtimeService);
      realtimeRoleHandlers.set(serverId, handler);
      logger.info(`RealtimeRoleHandler initialized for server ${serverId}`);
    }

    if (realtimeRoleHandlers.size === 0) {
      logger.warn(
        "No RealtimeRoleHandlers initialized - no playtime services available",
      );
    }

    dailyRoleScheduler = new DailyRoleScheduler(mainBot);
    dailyRoleScheduler.start();
    dailyRoleScheduler.triggerManualCheck();

    memberCleanupService.start();
  });
})().catch((error) => {
  logger.error("Failed to initialize:", error);
  process.exit(1);
});

export default mainBot;
