import {
  getNotificationConfig,
  RoleAssignmentNotification,
  RoleConditionType,
} from "@/services/discord/role";
import { createEmbed } from "../../embed-builder";
import { EmbedColors } from "../../colors";
import { Discord } from "@/discord/constants";
import { formatBalance, formatPlaytime } from "@/utils/format";

/**
 * Formats a value based on condition type
 *
 * @param value - The value to format
 * @param conditionType - The type of condition
 * @returns Formatted string
 */
function formatValue(value: number, conditionType: RoleConditionType): string {
  switch (conditionType) {
    case RoleConditionType.PLAYTIME:
      return formatPlaytime(value);
    case RoleConditionType.BALANCE:
      return `${formatBalance(value)}`;
    case RoleConditionType.SERVER_AGE:
      return formatPlaytime(value);
    default:
      return value.toString();
  }
}

/**
 * Gets a congratulatory message based on whether it's a milestone
 *
 * @param isMilestone - Whether this is milestone role
 * @returns Congratulatory message
 */
function getCongratulatoryMessage(isMilestone: boolean): string {
  if (isMilestone) {
    const messages = [
      "has achieved an incredible milestone! 🎉",
      "has reached new heights! 🌟",
      "has ascended to greatness! ✨",
      "has proven their mastery! 🏆",
      "has earned a legendary achievement! 👑",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  const messages = [
    "has ranked up! 🎊",
    "has advanced! ⬆️",
    "has progressed! 📈",
    "has leveled up! ⭐",
    "has earned a new title! 🎯",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export const RoleAssignmentEmbedPresets = {
  /**
   * Creates an embed for a role assignment notification
   *
   * @param notification - Role assignment notification data
   * @returns Discord embed builder
   */
  rankUp(notification: RoleAssignmentNotification) {
    const config = getNotificationConfig(notification.role.roleId);
    const isMilestone = config.isMilestone || false;
    const emoji = config.emoji || "🎖️";

    const congratsMessage =
      config.customMessage || getCongratulatoryMessage(isMilestone);

    const embed = createEmbed()
      .title(
        isMilestone
          ? `${emoji} MILESTONE ACHIEVEMENT ${emoji}`
          : `${emoji} Rank Up!`,
      )
      .color(isMilestone ? EmbedColors.Premium : EmbedColors.Success)
      .description(
        `${Discord.Users.mention(
          notification.discordId,
        )} ${congratsMessage}\n\n` + `**${notification.role.label}**`,
      );

    if (notification.role.conditionType === RoleConditionType.PLAYTIME) {
      embed.field(
        "Total Playtime",
        formatValue(notification.currentValue, notification.role.conditionType),
        true,
      );
    } else if (notification.role.conditionType === RoleConditionType.BALANCE) {
      embed.field(
        "Current Balance",
        formatValue(notification.currentValue, notification.role.conditionType),
        true,
      );
    } else if (
      notification.role.conditionType === RoleConditionType.SERVER_AGE
    ) {
      embed.field(
        "Member Since",
        formatValue(notification.currentValue, notification.role.conditionType),
      );
    }

    embed.timestamp();

    return embed;
  },

  /**
   * Creates a simple notification embed for multiple role changes
   *
   * @param notifications - Array of role assignment notifications
   * @returns Discord embed builder
   */
  multipleRankUps(notifications: RoleAssignmentNotification[]) {
    const firstNotification = notifications[0];
    const embed = createEmbed()
      .title("🎉 Multiple Achievements Unlocked!")
      .color(EmbedColors.Success)
      .description(
        `${Discord.Users.mention(
          firstNotification.discordId,
        )} has earned multiple new roles!`,
      );

    const rolesList = notifications
      .map((n) => {
        const config = getNotificationConfig(n.role.roleId);
        const emoji = config.emoji || "🎖️";
        return `${emoji} **${n.role.label}**`;
      })
      .join("\n");

    embed.field("New Roles", rolesList, false);

    embed.timestamp();

    return embed;
  },

  /**
   * Creates a special embed for the top player annoucement
   *
   * @param discordId - Discord user ID of the top player
   * @param username - Username of the top player
   * @param roleLabel - Label of the role earned
   * @param value - The value that made them #1 (playtime, balance, etc.)
   * @param conditionType - Type of condition
   * @returns Discord embed builder
   */
  topPlayerAnnouncement(
    discordId: string,
    username: string,
    roleLabel: string,
    value: number,
    conditionType: RoleConditionType,
  ) {
    const embed = createEmbed()
      .title("👑 NEW #1 PLAYER 👑")
      .color(EmbedColors.Premium)
      .description(
        `${Discord.Users.mention(
          discordId,
        )} has claimed the top spot and earned the title of **${roleLabel}**!`,
      );

    if (conditionType === RoleConditionType.PLAYTIME) {
      embed.field("Total Playtime", formatPlaytime(value), true);
    } else if (conditionType === RoleConditionType.BALANCE) {
      embed.field("Total Balance", `$${value.toLocaleString()}`, true);
    }

    embed.timestamp();

    return embed;
  },
};
