import { Q } from "@/db";
import {
  LeaderboardData,
  LeaderboardEntry,
  LeaderboardProvider,
  LeaderboardType,
} from "../types";
import { EmbedBuilder } from "discord.js";
import { EmbedPresets } from "@/discord/embeds";

export class PlaytimeLeaderboardProvider implements LeaderboardProvider {
  type = LeaderboardType.PLAYTIME;

  async fetch(serverId: number = 1): Promise<LeaderboardData> {
    const leaderboard = await Q.player.playtime.summary.getLeaderboard(
      serverId,
      10
    );

    const entries: LeaderboardEntry[] = leaderboard.map((entry, index) => {
      const totalHours = entry.totalSeconds / 3600;
      const avgMinutes = entry.avgSessionSeconds / 60;

      return {
        rank: index + 1,
        displayName: entry.minecraftUsername,
        value: `${totalHours.toFixed(1)}h`,
        secondaryValue: `${entry.totalSessions} sessions • ${avgMinutes.toFixed(
          0
        )}m avg`,
      };
    });

    return {
      title: "Top Players by Playtime",
      icon: "🏆",
      description: `Most active players on the server`,
      entries,
      footer: `Showing top ${entries.length} players`,
      lastUpdated: new Date(),
    };
  }

  generateEmbed(data: LeaderboardData): EmbedBuilder {
    return EmbedPresets.leaderboard.create(data).build();
  }
}
