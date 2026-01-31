import { CamelCaseKeys } from "../";

/**
 * Database representation of admin_log_action table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface AdminLogActionRow {
  id: number;
  admin_discord_id: string;
  admin_discord_username: string;
  action_type: string;
  target_player_uuid: string;
  target_player_name: string;
  table_name: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  server_id: number | null;
  performed_at: Date;
  metadata: Record<string, any> | null;
}

/**
 * Application representation with camelCase field names
 * 
 * Transformed version of AdminLogActionRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type AdminLogAction = CamelCaseKeys<AdminLogActionRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
 */
export interface AdminLogActionApiData {
  id: number;
  adminDiscordId: string;
  adminDiscordUsername: string;
  actionType: string;
  targetPlayerUuid: string;
  targetPlayerName: string;
  tableName: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  serverId: number | null;
  performedAt: string;
  metadata: Record<string, any> | null;
}

/**
 * Data required to create a new admin_log_action record
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
 */
export interface AdminLogActionCreate {
  adminDiscordId: string;
  adminDiscordUsername: string;
  actionType: string;
  targetPlayerUuid: string;
  targetPlayerName: string;
  tableName: string;
  fieldName: string;
  id?: number;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  serverId?: number | null;
  performedAt?: Date;
  metadata?: Record<string, any> | null;
}

/**
 * Valid identifiers for querying admin_log_action
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type AdminLogActionIdentifier = { id: number };

/**
 * Type-safe filters for querying admin_log_action
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type AdminLogActionFilters = {
  [K in keyof AdminLogAction]?: FilterValue<AdminLogAction[K]>;
};
