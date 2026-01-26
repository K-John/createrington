import { Q } from "@/db";
import { Discord } from "@/discord/constants";
import { EmbedPresets } from "@/discord/embeds";
import { minecraftRcon, ServerId, WhitelistAction } from "@/utils/rcon";

/**
 * Service to automatically clean up departed members after 30 days
 */
export class MemberCleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 6 * 60 * 60 * 1000;

  /**
   * Starts the cleanup service
   */
  start(): void {
    if (this.intervalId) {
      logger.warn("MemberCleanupService already running");
      return;
    }

    logger.info("Starting MemberCleanupService");

    this.cleanup().catch((error) => {
      logger.error("Initial member cleanup failed:", error);
    });

    this.intervalId = setInterval(() => {
      this.cleanup().catch((error) => {
        logger.error("Scheduled member cleanup failed:", error);
      });
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stops the cleanup service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("Stopped departed member cleanup service");
    }
  }

  /**
   * Performs cleanup of departed members older than 30 days
   */
  private async cleanup(): Promise<void> {
    try {
      const expiredMembers = await Q.discord.guild.member.leave.expired();

      if (expiredMembers.length === 0) {
        logger.debug("No departed members to clean up");
        return;
      }

      logger.info(
        `Found ${expiredMembers.length} departed member(s) ready for auto-deletion`,
      );

      for (const member of expiredMembers) {
        try {
          await Q.player.delete({ minecraftUuid: member.minecraftUuid });

          try {
            await minecraftRcon.whitelist(
              ServerId.COGS,
              WhitelistAction.REMOVE,
              member.minecraftUsername,
            );
          } catch (error) {
            logger.error(
              `Failed to remove ${member.minecraftUsername} from whitelist:`,
              error,
            );
          }

          await Q.discord.guild.member.leave.update(
            { id: member.id },
            { deletedAt: new Date() },
          );

          if (member.notificationMessageId) {
            try {
              const result = await Discord.Messages.fetchMessage({
                channelId: Discord.Channels.administration.NOTIFICATIONS,
                messageId: member.notificationMessageId,
              });

              if (result.success) {
                const autoDeleted = EmbedPresets.departed.autoDeleted({
                  minecraftUsername: member.minecraftUsername,
                  departedAt: member.departedAt,
                  deletedAt: new Date(),
                });

                await result.message.edit({
                  embeds: [autoDeleted.build()],
                  components: [],
                });
              }
            } catch (error) {
              logger.warn(
                `Could not update notification message for ${member.minecraftUsername}:`,
                error,
              );
            }
          }

          logger.info(
            `Auto-deleted departed member ${member.minecraftUsername} (departed ${member.departedAt.toISOString()})`,
          );
        } catch (error) {
          logger.error(
            `Failed to auto-delete ${member.minecraftUsername}:`,
            error,
          );
        }
      }
    } catch (error) {
      logger.error("Error during departed member cleanup:", error);
      throw error;
    }
  }

  /**
   * Manually triggers cleanup (for testing/admin commands)
   */
  async triggerManualCleanup(): Promise<void> {
    await this.cleanup();
  }
}

export const memberCleanupService = new MemberCleanupService();
