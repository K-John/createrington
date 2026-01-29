import { CamelCaseKeys } from "../";

/**
 * Database representation of discord_guild_member_leave table
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
 * Application representation (camelCase)
 */
export type DiscordGuildMemberLeave = CamelCaseKeys<DiscordGuildMemberLeaveRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
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
 */
export type DiscordGuildMemberLeaveIdentifier = { id: number } | { discordId: string };

/**
 * Filterable fields for discord_guild_member_leave
 */
import type { FilterValue } from "./base.types";

export type DiscordGuildMemberLeaveFilters = {
  [K in keyof DiscordGuildMemberLeave]?: FilterValue<DiscordGuildMemberLeave[K]>;
};
