import { CamelCaseKeys } from "../";

/**
 * Database representation of leaderboard_message table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
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
 * Application representation with camelCase field names
 * 
 * Transformed version of LeaderboardMessageRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type LeaderboardMessage = CamelCaseKeys<LeaderboardMessageRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
 */
export interface LeaderboardMessageApiData {
  id: number;
  leaderboardType: string;
  channelId: string;
  messageId: string;
  lastRefreshed: string | null;
  lastManualRefresh: string | null;
  createdAt: string;
}

/**
 * Data required to create a new leaderboard_message record
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
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
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type LeaderboardMessageIdentifier = { id: number } | { leaderboardType: string };

/**
 * Type-safe filters for querying leaderboard_message
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type LeaderboardMessageFilters = {
  [K in keyof LeaderboardMessage]?: FilterValue<LeaderboardMessage[K]>;
};
