import { CamelCaseKeys } from "../";

/**
 * Database representation of player table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface PlayerRow {
  id: number;
  minecraft_uuid: string;
  minecraft_username: string;
  discord_id: string;
  online: boolean;
  last_seen: Date;
  created_at: Date;
  updated_at: Date;
  current_server_id: number | null;
}

/**
 * Application representation (camelCase)
 */
export type Player = CamelCaseKeys<PlayerRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
 */
export interface PlayerApiData {
  id: number;
  minecraftUuid: string;
  minecraftUsername: string;
  discordId: string;
  online: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  currentServerId: number | null;
}
/**
 * Data required to create a new player record
 */
export interface PlayerCreate {
  minecraftUuid: string;
  minecraftUsername: string;
  discordId: string;
  id?: number;
  online?: boolean;
  lastSeen?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  currentServerId?: number | null;
}

/**
 * Valid identifiers for querying player
 */
export type PlayerIdentifier = { id: number } | { minecraftUuid: string } | { minecraftUsername: string } | { discordId: string };

/**
 * Filterable fields for player
 */
import type { FilterValue } from "./base.types";

export type PlayerFilters = {
  [K in keyof Player]?: FilterValue<Player[K]>;
};
