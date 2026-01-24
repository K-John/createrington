/**
 * Types of rewards available in the system
 */
export enum RewardType {
  DAILY = "daily",
}

/**
 * Result of checking reward eligibility
 */
export interface RewardEligibilityResult {
  eligible: boolean;
  reason?: string;
  nextClaimTime?: Date;
  lastClaimTime?: Date;
}

/**
 * Result of claiming a reward
 */
export interface RewardClaimResult {
  success: boolean;
  amount?: number;
  newBalance?: number;
  error?: string;
  nextClaimTime?: Date;
}

/**
 * Base configuration for a reward
 */
export interface RewardConfig {
  type: RewardType;
  amount: number;
  label: string;
  description: string;
  resetHour: number; // UTC 0-23
  enabled: boolean;
}
