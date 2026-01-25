import { CamelCaseKeys } from "../";

/**
 * Database representation of discord_guild_member_join table
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
 * Application representation (camelCase)
 */
export type DiscordGuildMemberJoin = CamelCaseKeys<DiscordGuildMemberJoinRow>;

/**
 * Data required to create a new discord_guild_member_join record
 */
export interface DiscordGuildMemberJoinCreate {
  userId: string;
  username: string;
  joinNumber?: number;
  joinedAt?: Date;
}

/**
 * Valid identifiers for querying discord_guild_member_join
 */
export type DiscordGuildMemberJoinIdentifier = { joinNumber: number } | { userId: string };

/**
 * Filterable fields for discord_guild_member_join
 */
import type { FilterValue } from "./base.types";

export type DiscordGuildMemberJoinFilters = {
  [K in keyof DiscordGuildMemberJoin]?: FilterValue<DiscordGuildMemberJoin[K]>;
};
