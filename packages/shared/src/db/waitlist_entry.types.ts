import { CamelCaseKeys } from "../";

/**
 * Database representation of waitlist_entry table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
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
 * Application representation with camelCase field names
 * 
 * Transformed version of WaitlistEntryRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type WaitlistEntry = CamelCaseKeys<WaitlistEntryRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
 */
export interface WaitlistEntryApiData {
  id: number;
  email: string;
  discordName: string;
  discordId: string | null;
  token: string | null;
  submittedAt: string;
  discordMessageId: string | null;
  status: string;
  joinedDiscord: boolean;
  verified: boolean;
  registered: boolean;
  joinedMinecraft: boolean;
  acceptedAt: string | null;
  acceptedBy: string | null;
}

/**
 * Data required to create a new waitlist_entry record
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
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
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type WaitlistEntryIdentifier = { id: number } | { email: string } | { discordName: string } | { discordId: string } | { token: string };

/**
 * Type-safe filters for querying waitlist_entry
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type WaitlistEntryFilters = {
  [K in keyof WaitlistEntry]?: FilterValue<WaitlistEntry[K]>;
};
