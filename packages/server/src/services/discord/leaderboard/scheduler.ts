import { leaderboardService } from "./leaderboard.service";

/**
 * Starts the automatic leaderboard refresh scheduler
 *
 * This scheduler runs in two phases:
 * 1. Initial refresh after 30 seconds (allows bot to fully initialize)
 * 2. Recurring refreshes every hour
 *
 * All scheduled refreshes are automatic and do not trigger
 * the user cooldown system. This ensures leaderboards stay up-to-date
 * without preventing users from manually refreshing when needed
 *
 * @returns The interval timer that can be used to stop the scheduler
 */
export function startLeaderboardScheduler(): NodeJS.Timeout {
  const REFRESH_INTERVAL = 60 * 60 * 1000;

  logger.info("Starting leaderboard refresh scheduler");

  const interval = setInterval(async () => {
    logger.info("Running scheduled leaderboard refresh");
    await leaderboardService.refreshAll();
  }, REFRESH_INTERVAL);

  setTimeout(async () => {
    logger.info("Running initial leaderboard refresh");
    await leaderboardService.refreshAll();
  }, 30000);

  return interval;
}
