import { CamelCaseKeys } from "@/types";

/**
 * Database representation of waitlist entry record
 */
export interface WaitlistEntryRow {
  id: number;
  email: string;
  discord_name: string;
  token: string | null;
  submitted_at: Date;
}

export type WaitlistEntry = CamelCaseKeys<WaitlistEntryRow>;

export interface WaitlistEntryCreate {
  email: string;
  discordName: string;
  token?: string;
}
