export enum LeaderboardType {
  PLAYTIME = "playtime",
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  value: string;
  formattedValue: string;
}

export interface LeaderboardConfig {
  type: LeaderboardType;
  title: string;
  description: string;
  emoji: string;
  channelId: string;
  serverId: number;
  fetchData: (serverId: number, limit: number) => Promise<LeaderboardEntry[]>;
  formatValue: (value: number) => string;
}

export interface LeaderboardRefreshResult {
  success: boolean;
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  error?: string;
}
