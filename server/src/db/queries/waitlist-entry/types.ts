import { CamelCaseKeys } from "@/types";

export enum WaitlistStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  COMPLETED = "completed",
}

/**
 * Database representation of waitlist entry record
 */
export interface WaitlistEntryRow {
  id: number;
  email: string;
  discord_name: string;
  token: string | null;
  discord_id: string | null;
  submitted_at: Date;
  discord_message_id: string | null;
  status: WaitlistStatus;
  joined_discord: boolean;
  verified: boolean;
  registered: boolean;
  joined_minecraft: boolean;
  accepted_at: Date | null;
  accepted_by: string | null;
}

export type WaitlistEntry = CamelCaseKeys<WaitlistEntryRow>;

export interface WaitlistEntryCreate {
  email: string;
  discordName: string;
  token?: string;
}
