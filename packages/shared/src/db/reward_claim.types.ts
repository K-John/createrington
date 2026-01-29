import { CamelCaseKeys } from "../";

/**
 * Database representation of reward_claim table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface RewardClaimRow {
  id: number;
  player_minecraft_uuid: string;
  reward_type: string;
  claimed_at: Date;
  amount: bigint;
  metadata: Record<string, any> | null;
}

/**
 * Application representation with camelCase field names
 * 
 * Transformed version of RewardClaimRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type RewardClaim = CamelCaseKeys<RewardClaimRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
 */
export interface RewardClaimApiData {
  id: number;
  playerMinecraftUuid: string;
  rewardType: string;
  claimedAt: string;
  amount: bigint;
  metadata: Record<string, any> | null;
}

/**
 * Data required to create a new reward_claim record
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
 */
export interface RewardClaimCreate {
  playerMinecraftUuid: string;
  rewardType: string;
  amount: bigint;
  id?: number;
  claimedAt?: Date;
  metadata?: Record<string, any> | null;
}

/**
 * Valid identifiers for querying reward_claim
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type RewardClaimIdentifier = { id: number } | { playerMinecraftUuid: string } | { rewardType: string } | { claimedAt: Date };

/**
 * Type-safe filters for querying reward_claim
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type RewardClaimFilters = {
  [K in keyof RewardClaim]?: FilterValue<RewardClaim[K]>;
};
