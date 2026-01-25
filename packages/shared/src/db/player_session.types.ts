import { CamelCaseKeys } from "../";

/**
 * Database representation of player_session table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface PlayerSessionRow {
  id: number;
  player_minecraft_uuid: string;
  server_id: number;
  session_start: Date;
  session_end: Date | null;
  seconds_played: bigint | null;
}

/**
 * Application representation (camelCase)
 */
export type PlayerSession = CamelCaseKeys<PlayerSessionRow>;

/**
 * Data required to create a new player_session record
 */
export interface PlayerSessionCreate {
  playerMinecraftUuid: string;
  serverId: number;
  sessionStart: Date;
  id?: number;
  sessionEnd?: Date | null;
  secondsPlayed?: bigint | null;
}

/**
 * Valid identifiers for querying player_session
 */
export type PlayerSessionIdentifier = { id: number };

/**
 * Filterable fields for player_session
 */
import type { FilterValue } from "./base.types";

export type PlayerSessionFilters = {
  [K in keyof PlayerSession]?: FilterValue<PlayerSession[K]>;
};
