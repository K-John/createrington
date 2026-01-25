import { CamelCaseKeys } from "../";

/**
 * Database representation of reward_claim table
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
 * Application representation (camelCase)
 */
export type RewardClaim = CamelCaseKeys<RewardClaimRow>;

/**
 * Data required to create a new reward_claim record
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
 */
export type RewardClaimIdentifier = { id: number } | { playerMinecraftUuid: string } | { rewardType: string } | { claimedAt: Date };

/**
 * Filterable fields for reward_claim
 */
import type { FilterValue } from "./base.types";

export type RewardClaimFilters = {
  [K in keyof RewardClaim]?: FilterValue<RewardClaim[K]>;
};
