import { CamelCaseKeys } from "@/types";

/**
 * Database representation of verified waitlist entry record
 */
export interface WaitlistEntryVerifiedRow {
  discord_id: string;
  verified_at: Date;
}

export type WaitlistEntryVerified = CamelCaseKeys<WaitlistEntryVerifiedRow>;

export interface WaitlistEntryVerifiedCreate {
  discordId: string;
}
