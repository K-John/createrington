import { CamelCaseKeys } from "../";

/**
 * Database representation of ticket table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface TicketRow {
  id: number;
  ticket_number: number;
  type: any;
  creator_discord_id: string;
  channel_id: string;
  status: any;
  created_at: Date;
  closed_at: Date | null;
  closed_by_discord_id: string | null;
  deleted_at: Date | null;
  metadata: Record<string, any> | null;
}

/**
 * Application representation with camelCase field names
 * 
 * Transformed version of TicketRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type Ticket = CamelCaseKeys<TicketRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
 */
export interface TicketApiData {
  id: number;
  ticketNumber: number;
  type: any;
  creatorDiscordId: string;
  channelId: string;
  status: any;
  createdAt: string;
  closedAt: string | null;
  closedByDiscordId: string | null;
  deletedAt: string | null;
  metadata: Record<string, any> | null;
}

/**
 * Data required to create a new ticket record
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
 */
export interface TicketCreate {
  ticketNumber: number;
  type: any;
  creatorDiscordId: string;
  channelId: string;
  id?: number;
  status?: any;
  createdAt?: Date;
  closedAt?: Date | null;
  closedByDiscordId?: string | null;
  deletedAt?: Date | null;
  metadata?: Record<string, any> | null;
}

/**
 * Valid identifiers for querying ticket
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type TicketIdentifier = { id: number } | { channelId: string };

/**
 * Type-safe filters for querying ticket
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type TicketFilters = {
  [K in keyof Ticket]?: FilterValue<Ticket[K]>;
};
