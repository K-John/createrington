import { CamelCaseKeys } from "../";

/**
 * Database representation of player_playtime_daily table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface PlayerPlaytimeDailyRow {
  player_minecraft_uuid: string;
  server_id: number;
  play_date: Date;
  seconds_played: bigint;
}

/**
 * Application representation (camelCase)
 */
export type PlayerPlaytimeDaily = CamelCaseKeys<PlayerPlaytimeDailyRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
 */
export interface PlayerPlaytimeDailyApiData {
  playerMinecraftUuid: string;
  serverId: number;
  playDate: string;
  secondsPlayed: bigint;
}
/**
 * Data required to create a new player_playtime_daily record
 */
export interface PlayerPlaytimeDailyCreate {
  playerMinecraftUuid?: string;
  serverId?: number;
  playDate?: Date;
  secondsPlayed?: bigint;
}

/**
 * Valid identifiers for querying player_playtime_daily
 */
export type PlayerPlaytimeDailyIdentifier = { playerMinecraftUuid: string; serverId: number; playDate: Date };

/**
 * Filterable fields for player_playtime_daily
 */
import type { FilterValue } from "./base.types";

export type PlayerPlaytimeDailyFilters = {
  [K in keyof PlayerPlaytimeDaily]?: FilterValue<PlayerPlaytimeDaily[K]>;
};
