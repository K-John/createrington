import { LeaderboardEntry } from "@/services/discord/leaderboard/types";
import { createEmbed, DiscordEmbedBuilder } from "../../embed-builder";
import { EmbedColors } from "../../colors";

export interface LeaderboardEmbedOptions {
  title: string;
  description?: string;
  entries: LeaderboardEntry[];
  footer?: string;
  lastUpdated?: Date;
  icon?: string;
}

export const LeaderboardEmbedPresets = {
  /**
   * Creates a standard leaderboard embed
   *
   * Automatically formats entries with medals for top 3 and
   * consistent spacing for a clean table-like appearance
   */
  create(options: LeaderboardEmbedOptions): DiscordEmbedBuilder {
    const {
      title,
      description,
      entries,
      footer,
      lastUpdated = new Date(),
      icon,
    } = options;

    const embed = createEmbed()
      .title(icon ? `${icon} ${title}` : title)
      .color(EmbedColors.Premium)
      .timestamp(lastUpdated);

    if (description) {
      embed.description(description);
    }

    const leaderboardText = entries
      .map((entry) => {
        const medal =
          entry.rank === 1
            ? "🥇"
            : entry.rank === 2
            ? "🥈"
            : entry.rank === 3
            ? "🥉"
            : `${entry.rank}.`;

        const name = entry.displayName.padEnd(16, " ");
        const value = entry.value.padStart(10, " ");

        const mainLine = `\`${medal} ${name}${value}\``;
        const secondaryLine = entry.secondaryValue
          ? `\n    └ ${entry.secondaryValue}`
          : "";

        return mainLine + secondaryLine;
      })
      .join("\n");

    embed.field("Rankings", leaderboardText || "No data available");

    if (footer) {
      embed.footer(footer);
    }

    return embed;
  },

  /**
   * Creates a simple leaderboard embed without secondary values
   *
   * Useful for balance boards or other simple rankings
   */
  simple(options: LeaderboardEmbedOptions): DiscordEmbedBuilder {
    const {
      title,
      description,
      entries,
      footer,
      lastUpdated = new Date(),
      icon,
    } = options;

    const embed = createEmbed()
      .title(icon ? `${icon} ${title}` : title)
      .color(EmbedColors.Premium)
      .timestamp(lastUpdated);

    if (description) {
      embed.description(description);
    }

    const leaderboardText = entries
      .map((entry) => {
        const medal =
          entry.rank === 1
            ? "🥇"
            : entry.rank === 2
            ? "🥈"
            : entry.rank === 3
            ? "🥉"
            : `${entry.rank}.`;

        const name = entry.displayName.padEnd(16, " ");
        const value = entry.value.padStart(12, " ");

        return `\`${medal} ${name}${value}\``;
      })
      .join("\n");

    embed.field("Rankings", leaderboardText || "No data available");

    if (footer) {
      embed.footer(footer);
    }

    return embed;
  },

  /**
   * Creates a compact leaderboard embed
   *
   * Fits more entries by removing padding and using tighter formatting
   */
  compact(options: LeaderboardEmbedOptions): DiscordEmbedBuilder {
    const {
      title,
      description,
      entries,
      footer,
      lastUpdated = new Date(),
      icon,
    } = options;

    const embed = createEmbed()
      .title(icon ? `${icon} ${title}` : title)
      .color(EmbedColors.Premium)
      .timestamp(lastUpdated);

    if (description) {
      embed.description(description);
    }

    const leaderboardText = entries
      .map((entry) => {
        const medal =
          entry.rank === 1
            ? "🥇"
            : entry.rank === 2
            ? "🥈"
            : entry.rank === 3
            ? "🥉"
            : `${entry.rank}.`;
        return `${medal} **${entry.displayName}** — ${entry.value}${
          entry.secondaryValue ? ` • ${entry.secondaryValue}` : ""
        }`;
      })
      .join("\n");

    embed.field("Rankings", leaderboardText || "No data available");

    if (footer) {
      embed.footer(footer);
    }

    return embed;
  },
};
