import { CamelCaseKeys } from "../";

/**
 * Database representation of player_playtime_summary table
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
 * Application representation (camelCase)
 */
export type PlayerPlaytimeSummary = CamelCaseKeys<PlayerPlaytimeSummaryRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
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
 */
export type PlayerPlaytimeSummaryIdentifier = { playerMinecraftUuid: string; serverId: number };

/**
 * Filterable fields for player_playtime_summary
 */
import type { FilterValue } from "./base.types";

export type PlayerPlaytimeSummaryFilters = {
  [K in keyof PlayerPlaytimeSummary]?: FilterValue<PlayerPlaytimeSummary[K]>;
};
