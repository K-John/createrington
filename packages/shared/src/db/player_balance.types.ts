import { CamelCaseKeys } from "../";

/**
 * Database representation of player_balance table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface PlayerBalanceRow {
  minecraft_uuid: string;
  balance: bigint;
  updated_at: Date;
}

/**
 * Application representation (camelCase)
 */
export type PlayerBalance = CamelCaseKeys<PlayerBalanceRow>;

/**
 * Data required to create a new player_balance record
 */
export interface PlayerBalanceCreate {
  minecraftUuid?: string;
  balance?: bigint;
  updatedAt?: Date;
}

/**
 * Valid identifiers for querying player_balance
 */
export type PlayerBalanceIdentifier = { minecraftUuid: string };

/**
 * Filterable fields for player_balance
 */
import type { FilterValue } from "./base.types";

export type PlayerBalanceFilters = {
  [K in keyof PlayerBalance]?: FilterValue<PlayerBalance[K]>;
};
