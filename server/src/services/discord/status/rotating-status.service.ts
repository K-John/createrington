import { ActivityType, Client } from "discord.js";
import { StatusCategory, StatusConfig, statusConfigs } from "./types";
import config from "@/config";

/**
 * Rotating status manager for the web bot
 * Handles status rotation with support for dynamic data
 */
export class RotatingStatusService {
  private client: Client;
  private statuses: StatusConfig[];
  private currentIndex: number = 0;
  private intervalId?: NodeJS.Timeout;
  private rotationInterval: number;

  /**
   * Creates a new rotating status service
   *
   * @param client - The Discord client instance
   * @param rotationInterval - Interval between status changed in milliseconds (default: 60000)
   */
  constructor(client: Client, rotationInterval: number = 60000) {
    this.client = client;
    this.statuses = statusConfigs;
    this.rotationInterval = rotationInterval;
  }

  /**
   * Starts the status rotation
   *
   * Sets an initial status immediately, then rotates at the configured interval
   */
  public start(): void {
    // if (!config.envMode.isProd) {
    //   logger.warn("Skipping rotating statuses in non-production environment");
    //   return;
    // }

    if (!this.client.isReady()) {
      logger.warn("Cannot start status rotation - client not ready");
      return;
    }

    this.rotateStatus();

    this.intervalId = setInterval(() => {
      this.rotateStatus();
    }, this.rotationInterval);

    logger.info(
      `Started rotating status service (${this.statuses.length} statuses, ${this.rotationInterval}ms interval)`,
    );
  }

  /**
   * Stops the status rotation
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info("Stopped rotating status service");
    }
  }

  /**
   * Rotates to the next status
   * Handles both static and dynamic statuses
   */
  private async rotateStatus(): Promise<void> {
    const statusConfig = this.statuses[this.currentIndex];

    try {
      const statusText = statusConfig.dynamic
        ? await statusConfig.dynamic()
        : statusConfig.text;

      this.setStatus(statusText);

      this.currentIndex = (this.currentIndex + 1) % this.statuses.length;
    } catch (error) {
      logger.error("Error rotating status:", error);
      this.setStatus(statusConfig.text);
    }
  }

  /**
   * Sets the bot's custom status
   *
   * @param status - The status text to display
   */
  private setStatus(status: string): void {
    if (!this.client.isReady()) {
      return;
    }

    this.client.user.setPresence({
      activities: [
        {
          type: ActivityType.Custom,
          name: "custom",
          state: status,
        },
      ],
      status: "online",
    });
  }

  /**
   * Adds a new status to the rotation
   *
   * @param status - Status configuration to add
   */
  public addStatus(status: StatusConfig): void {
    this.statuses.push(status);
    logger.debug(`Added new status: ${status.text}`);
  }

  /**
   * Filters statuses by category
   *
   * @param category - Category to filter by
   */
  public filterCategory(category: StatusCategory): void {
    this.statuses = statusConfigs.filter((s) => s.category === category);
    this.currentIndex = 0;
    logger.info(`Filtered statuses to category ${category}`);
  }

  /**
   * Resets statuses to default configuration
   */
  public resetStatuses(): void {
    this.statuses = statusConfigs;
    this.currentIndex = 0;
    logger.info("Reset statuses to default configuration");
  }

  /**
   * Gets statistics about the status rotation
   */
  public getStats(): {
    total: number;
    currentIndex: number;
    byCategory: Record<StatusCategory, number>;
  } {
    const byCategory = this.statuses.reduce(
      (acc, status) => {
        acc[status.category] = (acc[status.category] || 0) + 1;
        return acc;
      },
      {} as Record<StatusCategory, number>,
    );

    return {
      total: this.statuses.length,
      currentIndex: this.currentIndex,
      byCategory,
    };
  }
}
