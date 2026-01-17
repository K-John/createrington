import { Q } from "@/db";
import { PlaytimeRoleRule, RoleEligibilityResult } from "../types";
import { BaseRoleCondition } from "./base-condition";

/**
 * Playtime-based role assignment condition
 *
 * Checks if a player has accumulated enough playtime to qualify for a role
 */
export class PlaytimeCondition extends BaseRoleCondition<PlaytimeRoleRule> {
  /**
   * Check if a player has enough playtime for this role
   *
   * @param discordId - Discord user ID of the player
   * @returns Promise resolving to the eligibility result with current/required playtime
   */
  async checkEligibility(discordId: string): Promise<RoleEligibilityResult> {
    const currentSeconds = await this.getCurrentValue(discordId);
    const requiredSeconds = this.getRequiredValue();

    return {
      rule: this.rule,
      qualifies: currentSeconds >= requiredSeconds,
      currentValue: currentSeconds,
      requiredValue: requiredSeconds,
      discordId,
    };
  }

  /**
   * Get the player's total playtime in seconds
   *
   * @param discordId - Discord user ID of the player
   * @returns Promise resolving to the total playtime in seconds
   */
  async getCurrentValue(discordId: string): Promise<number> {
    try {
      const player = await Q.player.find({ discordId });

      if (!player) {
        return 0;
      }

      if (this.rule.serverId) {
        const summary = await Q.player.playtime.summary.find({
          playerMinecraftUuid: player.minecraftUuid,
          serverId: this.rule.serverId,
        });
        return summary ? Number(summary.totalSeconds) : 0;
      }

      const summaries = await Q.player.playtime.summary.findAll({
        playerMinecraftUuid: player.minecraftUuid,
      });

      return summaries.reduce(
        (total, summary) => total + Number(summary.totalSeconds),
        0
      );
    } catch (error) {
      logger.error(`Failed to get playtime for ${discordId}`, error);
      return 0;
    }
  }

  /**
   * Get the required playtime for this role
   *
   * @returns Required playtime in seconds
   */
  getRequiredValue(): number {
    return this.rule.requiredSeconds;
  }
}
