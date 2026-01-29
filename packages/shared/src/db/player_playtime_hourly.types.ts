import { CamelCaseKeys } from "../";

/**
 * Database representation of player_playtime_hourly table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface PlayerPlaytimeHourlyRow {
  player_minecraft_uuid: string;
  server_id: number;
  play_hour: Date;
  seconds_played: bigint;
}

/**
 * Application representation (camelCase)
 */
export type PlayerPlaytimeHourly = CamelCaseKeys<PlayerPlaytimeHourlyRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
 */
export interface PlayerPlaytimeHourlyApiData {
  playerMinecraftUuid: string;
  serverId: number;
  playHour: string;
  secondsPlayed: bigint;
}
/**
 * Data required to create a new player_playtime_hourly record
 */
export interface PlayerPlaytimeHourlyCreate {
  playerMinecraftUuid?: string;
  serverId?: number;
  playHour?: Date;
  secondsPlayed?: bigint;
}

/**
 * Valid identifiers for querying player_playtime_hourly
 */
export type PlayerPlaytimeHourlyIdentifier = { playerMinecraftUuid: string; serverId: number; playHour: Date };

/**
 * Filterable fields for player_playtime_hourly
 */
import type { FilterValue } from "./base.types";

export type PlayerPlaytimeHourlyFilters = {
  [K in keyof PlayerPlaytimeHourly]?: FilterValue<PlayerPlaytimeHourly[K]>;
};
