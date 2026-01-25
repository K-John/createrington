import { CamelCaseKeys } from "../";

/**
 * Database representation of leaderboard_message table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface LeaderboardMessageRow {
  id: number;
  leaderboard_type: string;
  channel_id: string;
  message_id: string;
  last_refreshed: Date | null;
  last_manual_refresh: Date | null;
  created_at: Date;
}

/**
 * Application representation (camelCase)
 */
export type LeaderboardMessage = CamelCaseKeys<LeaderboardMessageRow>;

/**
 * Data required to create a new leaderboard_message record
 */
export interface LeaderboardMessageCreate {
  leaderboardType: string;
  channelId: string;
  messageId: string;
  id?: number;
  lastRefreshed?: Date | null;
  lastManualRefresh?: Date | null;
  createdAt?: Date;
}

/**
 * Valid identifiers for querying leaderboard_message
 */
export type LeaderboardMessageIdentifier = { id: number } | { leaderboardType: string };

/**
 * Filterable fields for leaderboard_message
 */
import type { FilterValue } from "./base.types";

export type LeaderboardMessageFilters = {
  [K in keyof LeaderboardMessage]?: FilterValue<LeaderboardMessage[K]>;
};
