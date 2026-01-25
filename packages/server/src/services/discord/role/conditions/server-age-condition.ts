import { player } from "@/db";
import { RoleEligibilityResult, ServerAgeRoleRule } from "../types";
import { BaseRoleCondition } from "./base-condition";

/**
 * Server age-based role assignment condition
 *
 * Checks if a player has been in the Discord server long enough to qualify for a role
 */
export class ServerAgeCondition extends BaseRoleCondition<ServerAgeRoleRule> {
  constructor(rule: ServerAgeRoleRule) {
    super(rule);
  }

  /**
   * Checks if a player has been in the server long enough for this role
   *
   * @param discordId - Discord user ID of the player
   * @returns Promise resolving to the eligibility result with current/required days
   */
  async checkEligibility(discordId: string): Promise<RoleEligibilityResult> {
    const currentDays = await this.getCurrentValue(discordId);
    const requiredDays = await this.getRequiredValue();

    return {
      rule: this.rule,
      qualifies: currentDays >= requiredDays,
      currentValue: currentDays,
      requiredValue: requiredDays,
      discordId,
    };
  }

  /**
   * Get the number of days the player has been in the Discord server
   *
   * @param discordId - Discord user ID of the player
   * @returns Promise resolving to the number of days
   */
  async getCurrentValue(discordId: string): Promise<number> {
    try {
      const result: Date = await player.select.createdAt({ discordId });

      const now = new Date();
      const diffMs = now.getTime() - result.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      logger.error(`Failed to get server age for ${discordId}`, error);
      return 0;
    }
  }

  /**
   * Get the required number of days for this role
   *
   * @returns Required number of days
   */
  getRequiredValue(): number {
    return this.rule.requiredDays;
  }
}
