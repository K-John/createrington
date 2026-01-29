import { CamelCaseKeys } from "../";

/**
 * Database representation of admin_log_action table
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
 * Application representation (camelCase)
 */
export type AdminLogAction = CamelCaseKeys<AdminLogActionRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
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
 */
export type AdminLogActionIdentifier = { id: number };

/**
 * Filterable fields for admin_log_action
 */
import type { FilterValue } from "./base.types";

export type AdminLogActionFilters = {
  [K in keyof AdminLogAction]?: FilterValue<AdminLogAction[K]>;
};
