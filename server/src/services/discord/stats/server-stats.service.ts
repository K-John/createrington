import config from "@/config";
import { ServerStats } from "./types";
import { Client } from "discord.js";
import { ServerStatsConfig } from "./types";

/**
 * Service for updating Discord server statistics in channel names
 *
 * Features:
 * - Automatically updates channel names with member counts
 * - Tracks members, bots, and total separately
 * - Only updates when counts change to minimize API calls
 * - Configurable update interval
 * - Graceful error handling and logging
 */
export class ServerStatsService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastStats: ServerStats | null = null;
  private isRunning = false;

  constructor(
    private readonly client: Client,
    private readonly config: ServerStatsConfig,
  ) {}

  /**
   * Starts the periodic stats update
   *
   * @returns Promise resolving when the first update completes
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("ServerStatsService is already running");
      return;
    }

    logger.info("Starting ServerStatsService...");

    await this.updateStats();

    const interval = this.config.updateInterval || 30 * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.updateStats();
    }, interval);

    this.isRunning = true;
    logger.info(
      `ServerStatsService started (update interval: ${interval / 1000})s`,
    );
  }

  /**
   * Stops the periodic stats update
   */
  public stop(): void {
    if (!this.isRunning) {
      logger.warn("ServerStatsService is not running");
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    logger.info("ServerStatsService stopped");
  }

  /**
   * Fetches current server statistics
   *
   * @returns Promise resolving to current stats
   *
   * @private
   */
  private async fetchStats(): Promise<ServerStats> {
    const guild = await this.client.guilds.fetch(this.config.guildId);

    await guild.members.fetch();

    const members = guild.members.cache.filter((m) => !m.user.bot).size;
    const bots = guild.members.cache.filter((m) => m.user.bot).size;
    const total = members + bots;

    return { members, bots, total };
  }

  /**
   * Checks if stats have changed since last update
   *
   * @param newStats - New statistics to compare
   * @returns True if stats have changed, false otherwise
   *
   * @private
   */
  private hasStatsChanged(newStats: ServerStats): boolean {
    if (!this.lastStats) {
      return true;
    }

    return (
      newStats.members !== this.lastStats.members ||
      newStats.bots !== this.lastStats.bots ||
      newStats.total !== this.lastStats.total
    );
  }

  /**
   * Updates channel names with current statistics
   *
   * Only updates if stats have changed since last update to minize API calls
   *
   * @private
   */
  private async updateStats(): Promise<void> {
    try {
      const stats = await this.fetchStats();

      if (!this.hasStatsChanged(stats)) {
        logger.debug("Server stats unchanged, skipping update");
        return;
      }

      const guild = await this.client.guilds.fetch(this.config.guildId);

      if (this.config.membersChannelId) {
        const membersChannel = guild.channels.cache.get(
          this.config.membersChannelId,
        );
        if (membersChannel) {
          await membersChannel.setName(`Members: ${stats.members}`);
          logger.debug(`Updated members channel: ${stats.members}`);
        } else {
          logger.warn(
            `Members channel ${this.config.membersChannelId} not found`,
          );
        }
      }

      if (this.config.botsChannelId) {
        const botsChannel = guild.channels.cache.get(this.config.botsChannelId);
        if (botsChannel) {
          await botsChannel.setName(`Bots: ${stats.bots}`);
          logger.debug(`Updated bots channel: ${stats.bots}`);
        } else {
          logger.warn(`Bots channel ${this.config.botsChannelId} not found`);
        }
      }

      if (this.config.totalMembersChannelId) {
        const totalChannel = guild.channels.cache.get(
          this.config.totalMembersChannelId,
        );
        if (totalChannel) {
          await totalChannel.setName(`All Members: ${stats.total}`);
          logger.debug(`Updated total members channel: ${stats.total}`);
        } else {
          logger.warn(
            `Total members channel ${this.config.totalMembersChannelId} not found`,
          );
        }
      }

      this.lastStats = stats;
      logger.info(
        `Server stats updated - Members: ${stats.members}, Bots: ${stats.bots}, Total: ${stats.total}`,
      );
    } catch (error) {
      logger.error("Failed to update server stats:", error);
    }
  }

  /**
   * Manually triggers a stats update
   *
   * Useful for testing or forcing an immediate update
   *
   * @returns Promise resolving when the update completes
   */
  public async forceUpdate(): Promise<void> {
    await this.updateStats();
  }

  /**
   * Gets the current cached stats
   *
   * @returns Current stats or null if not yet fetched
   */
  public getCurrentStats(): ServerStats | null {
    return this.lastStats;
  }

  /**
   * Checks if the service is currently running
   *
   * @returns True if runnng, false otherwise
   */
  public isActive(): boolean {
    return this.isRunning;
  }
}
