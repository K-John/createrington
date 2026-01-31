import { CamelCaseKeys } from "../";

/**
 * Database representation of discord_guild_member_join table
 * 
 * Raw database row with snake_case field names matching the PostgreSQL schema.
 * Use this type when working directly with database query results before
 * transformation to application entities.
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface DiscordGuildMemberJoinRow {
  join_number: number;
  user_id: string;
  username: string;
  joined_at: Date;
}

/**
 * Application representation with camelCase field names
 * 
 * Transformed version of DiscordGuildMemberJoinRow with camelCase property names for
 * idiomatic TypeScript code. Use this type in application logic, business
 * rules, and internal processing.
 */
export type DiscordGuildMemberJoin = CamelCaseKeys<DiscordGuildMemberJoinRow>;

/**
 * API representation with dates as ISO strings
 * 
 * Optimized for JSON serialization with Date fields converted to ISO string
 * format. Use this type for API responses, client-side data, and anywhere
 * JSON serialization occurs (Date objects don't serialize well to JSON).
 */
export interface DiscordGuildMemberJoinApiData {
  joinNumber: number;
  userId: string;
  username: string;
  joinedAt: string;
}

/**
 * Data required to create a new discord_guild_member_join record
 * 
 * Defines which fields are required vs optional when inserting a new row.
 * Fields with defaults, auto-generated values (e.g., id, timestamps), or
 * nullable columns are marked optional.
 */
export interface DiscordGuildMemberJoinCreate {
  userId: string;
  username: string;
  joinNumber?: number;
  joinedAt?: Date;
}

/**
 * Valid identifiers for querying discord_guild_member_join
 * 
 * Union type of all valid ways to uniquely identify a row in this table.
 * Includes primary key combinations and individual unique column identifiers.
 * Use this type when fetching, updating, or deleting specific records.
 */
export type DiscordGuildMemberJoinIdentifier = { joinNumber: number } | { userId: string };

/**
 * Type-safe filters for querying discord_guild_member_join
 * 
 * Allows filtering on any field with support for comparison operators,
 * pattern matching, and null checks. Each field accepts FilterValue<T>
 * which includes direct values and operator objects.
 */
import type { FilterValue } from "./base.types";

export type DiscordGuildMemberJoinFilters = {
  [K in keyof DiscordGuildMemberJoin]?: FilterValue<DiscordGuildMemberJoin[K]>;
};
