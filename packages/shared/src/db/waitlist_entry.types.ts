import { CamelCaseKeys } from "../";

/**
 * Database representation of waitlist_entry table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface WaitlistEntryRow {
  id: number;
  email: string;
  discord_name: string;
  discord_id: string | null;
  token: string | null;
  submitted_at: Date;
  discord_message_id: string | null;
  status: string;
  joined_discord: boolean;
  verified: boolean;
  registered: boolean;
  joined_minecraft: boolean;
  accepted_at: Date | null;
  accepted_by: string | null;
}

/**
 * Application representation (camelCase)
 */
export type WaitlistEntry = CamelCaseKeys<WaitlistEntryRow>;

/**
 * Data required to create a new waitlist_entry record
 */
export interface WaitlistEntryCreate {
  email: string;
  discordName: string;
  id?: number;
  discordId?: string | null;
  token?: string | null;
  submittedAt?: Date;
  discordMessageId?: string | null;
  status?: string;
  joinedDiscord?: boolean;
  verified?: boolean;
  registered?: boolean;
  joinedMinecraft?: boolean;
  acceptedAt?: Date | null;
  acceptedBy?: string | null;
}

/**
 * Valid identifiers for querying waitlist_entry
 */
export type WaitlistEntryIdentifier = { id: number } | { email: string } | { discordName: string } | { discordId: string } | { token: string };

/**
 * Filterable fields for waitlist_entry
 */
import type { FilterValue } from "./base.types";

export type WaitlistEntryFilters = {
  [K in keyof WaitlistEntry]?: FilterValue<WaitlistEntry[K]>;
};
