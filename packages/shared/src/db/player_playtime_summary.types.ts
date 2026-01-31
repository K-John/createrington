import { CamelCaseKeys } from "../";

/**
 * Database representation of player_playtime_summary table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface PlayerPlaytimeSummaryRow {
  player_minecraft_uuid: string;
  server_id: number;
  total_seconds: bigint;
  total_sessions: number;
  first_seen: Date | null;
  last_seen: Date | null;
  avg_session_seconds: bigint | null;
  updated_at: Date;
}

/**
 * Application representation with camelCase field names
 * 
 * Transformed version of PlayerPlaytimeSummaryRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type PlayerPlaytimeSummary = CamelCaseKeys<PlayerPlaytimeSummaryRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
 */
export interface PlayerPlaytimeSummaryApiData {
  playerMinecraftUuid: string;
  serverId: number;
  totalSeconds: bigint;
  totalSessions: number;
  firstSeen: string | null;
  lastSeen: string | null;
  avgSessionSeconds: bigint | null;
  updatedAt: string;
}

/**
 * Data required to create a new player_playtime_summary record
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
 */
export interface PlayerPlaytimeSummaryCreate {
  playerMinecraftUuid?: string;
  serverId?: number;
  totalSeconds?: bigint;
  totalSessions?: number;
  firstSeen?: Date | null;
  lastSeen?: Date | null;
  avgSessionSeconds?: bigint | null;
  updatedAt?: Date;
}

/**
 * Valid identifiers for querying player_playtime_summary
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type PlayerPlaytimeSummaryIdentifier = { playerMinecraftUuid: string; serverId: number };

/**
 * Type-safe filters for querying player_playtime_summary
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type PlayerPlaytimeSummaryFilters = {
  [K in keyof PlayerPlaytimeSummary]?: FilterValue<PlayerPlaytimeSummary[K]>;
};
