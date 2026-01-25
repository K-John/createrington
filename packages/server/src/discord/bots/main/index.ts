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
 */
export const ticketService = new TicketService(mainBot);

/**
 * Initialize realtime role handlers once playtime services are ready
 */
function initializeRealtimeRoleHandlers(): void {
  const allPlaytimeServices = getAllPlaytimeServices();

  if (allPlaytimeServices.size === 0) {
    logger.debug(
      "No playtime services available yet for RealtimeRoleHandlers - will initialize later",
    );
    return;
  }

  for (const [serverId, playtimeService] of allPlaytimeServices) {
    if (!realtimeRoleHandlers.has(serverId)) {
      const handler = new RealtimeRoleHandler(mainBot, playtimeService);
      realtimeRoleHandlers.set(serverId, handler);
      logger.info(`RealtimeRoleHandler initialized for server ${serverId}`);
    }
  }
}

/**
 * Bot initialization IIFE
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

    // Try to initialize realtime role handlers
    // If playtime services aren't ready yet, this will be called again later
    initializeRealtimeRoleHandlers();

    // Initialize daily role scheduler
    dailyRoleScheduler = new DailyRoleScheduler(mainBot);
    dailyRoleScheduler.start();

    // Only trigger manual check if we want to run it immediately on startup
    // dailyRoleScheduler.triggerManualCheck();

    memberCleanupService.start();
  });
})().catch((error) => {
  logger.error("Failed to initialize:", error);
  process.exit(1);
});

// Export function to allow playtime service to trigger role handler initialization
export function onPlaytimeServicesReady(): void {
  initializeRealtimeRoleHandlers();
}

export default mainBot;
