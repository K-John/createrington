import { CamelCaseKeys } from "../";

/**
 * Database representation of player table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
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
 * Application representation with camelCase field names
 * 
 * Transformed version of PlayerRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type Player = CamelCaseKeys<PlayerRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
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
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
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
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type PlayerIdentifier = { id: number } | { minecraftUuid: string } | { minecraftUsername: string } | { discordId: string };

/**
 * Type-safe filters for querying player
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type PlayerFilters = {
  [K in keyof Player]?: FilterValue<Player[K]>;
};
