import { CamelCaseKeys } from "../";

/**
 * Database representation of discord_guild_member_leave table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface DiscordGuildMemberLeaveRow {
  id: number;
  discord_id: string;
  minecraft_uuid: string;
  minecraft_username: string;
  departed_at: Date;
  notification_message_id: string | null;
  deleted_at: Date | null;
}

/**
 * Application representation with camelCase field names
 * 
 * Transformed version of DiscordGuildMemberLeaveRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type DiscordGuildMemberLeave = CamelCaseKeys<DiscordGuildMemberLeaveRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
 */
export interface DiscordGuildMemberLeaveApiData {
  id: number;
  discordId: string;
  minecraftUuid: string;
  minecraftUsername: string;
  departedAt: string;
  notificationMessageId: string | null;
  deletedAt: string | null;
}

/**
 * Data required to create a new discord_guild_member_leave record
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
 */
export interface DiscordGuildMemberLeaveCreate {
  discordId: string;
  minecraftUuid: string;
  minecraftUsername: string;
  id?: number;
  departedAt?: Date;
  notificationMessageId?: string | null;
  deletedAt?: Date | null;
}

/**
 * Valid identifiers for querying discord_guild_member_leave
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type DiscordGuildMemberLeaveIdentifier = { id: number } | { discordId: string };

/**
 * Type-safe filters for querying discord_guild_member_leave
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type DiscordGuildMemberLeaveFilters = {
  [K in keyof DiscordGuildMemberLeave]?: FilterValue<DiscordGuildMemberLeave[K]>;
};
