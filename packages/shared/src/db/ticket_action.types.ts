import { CamelCaseKeys } from "../";

/**
 * Database representation of ticket_action table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface TicketActionRow {
  id: number;
  ticket_id: number;
  action_type: string;
  performed_by_discord_id: string;
  performed_at: Date;
  metadata: Record<string, any> | null;
}

/**
 * Application representation with camelCase field names
 * 
 * Transformed version of TicketActionRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type TicketAction = CamelCaseKeys<TicketActionRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
 */
export interface TicketActionApiData {
  id: number;
  ticketId: number;
  actionType: string;
  performedByDiscordId: string;
  performedAt: string;
  metadata: Record<string, any> | null;
}

/**
 * Data required to create a new ticket_action record
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
 */
export interface TicketActionCreate {
  ticketId: number;
  actionType: string;
  performedByDiscordId: string;
  id?: number;
  performedAt?: Date;
  metadata?: Record<string, any> | null;
}

/**
 * Valid identifiers for querying ticket_action
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type TicketActionIdentifier = { id: number };

/**
 * Type-safe filters for querying ticket_action
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type TicketActionFilters = {
  [K in keyof TicketAction]?: FilterValue<TicketAction[K]>;
};
