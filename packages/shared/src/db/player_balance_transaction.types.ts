import { CamelCaseKeys } from "../";

/**
 * Database representation of player_balance_transaction table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface PlayerBalanceTransactionRow {
  id: number;
  player_minecraft_uuid: string;
  amount: bigint;
  balance_before: bigint;
  balance_after: bigint;
  transaction_type: string;
  description: string | null;
  related_player_uuid: string | null;
  metadata: Record<string, any> | null;
  created_at: Date;
}

/**
 * Application representation (camelCase)
 */
export type PlayerBalanceTransaction = CamelCaseKeys<PlayerBalanceTransactionRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
 */
export interface PlayerBalanceTransactionApiData {
  id: number;
  playerMinecraftUuid: string;
  amount: bigint;
  balanceBefore: bigint;
  balanceAfter: bigint;
  transactionType: string;
  description: string | null;
  relatedPlayerUuid: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}
/**
 * Data required to create a new player_balance_transaction record
 */
export interface PlayerBalanceTransactionCreate {
  playerMinecraftUuid: string;
  amount: bigint;
  balanceBefore: bigint;
  balanceAfter: bigint;
  transactionType: string;
  id?: number;
  description?: string | null;
  relatedPlayerUuid?: string | null;
  metadata?: Record<string, any> | null;
  createdAt?: Date;
}

/**
 * Valid identifiers for querying player_balance_transaction
 */
export type PlayerBalanceTransactionIdentifier = { id: number };

/**
 * Filterable fields for player_balance_transaction
 */
import type { FilterValue } from "./base.types";

export type PlayerBalanceTransactionFilters = {
  [K in keyof PlayerBalanceTransaction]?: FilterValue<PlayerBalanceTransaction[K]>;
};
