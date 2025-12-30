import { EmbedBuilder } from "discord.js";

export enum LeaderboardType {
  PLAYTIME = "playtime",
  BALANCE = "balance",
  SESSIONS = "sessions",
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  value: string;
  secondaryValue?: string;
  avatarUrl?: string;
}

export interface LeaderboardData {
  title: string;
  description?: string;
  entries: LeaderboardEntry[];
  footer?: string;
  lastUpdated: Date;
  icon?: string;
}

export interface LeaderboardProvider {
  /**
   * Unique type identifier
   */
  type: LeaderboardType;

  /**
   * Fetch the current leaderboard data
   */
  fetch(serverId?: number): Promise<LeaderboardData>;

  /**
   * Generate embed from data
   */
  generateEmbed(data: LeaderboardData): EmbedBuilder;

  /**
   * Optional: Generate image from data
   */
  generateImage?(data: LeaderboardData): Promise<Buffer>;
}
