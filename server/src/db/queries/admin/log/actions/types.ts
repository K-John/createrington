import { CamelCaseKeys } from "@/types";

export enum AdminLogActionType {
  UPDATE_PLAYER = "UPDATE_PLAYER",
  UPDATE_BALANCE = "UPDATE_BALANCE",
  UPDATE_PLAYTIME = "UPDATE_PLAYTIME",
}

export interface AdminLogActionRow {
  id: number;
  admin_discord_id: string;
  admin_username: string;
  action_type: AdminLogActionType;
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

export type AdminLogAction = CamelCaseKeys<AdminLogActionRow>;

export interface AdminLogActionCreate {
  adminDiscordId: string;
  adminUsername: string;
  actionType: AdminLogActionType;
  targetPlayerUuid: string;
  targetPlayerName: string;
  tableName: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  reason?: string;
  serverId?: number;
  metadata?: Record<string, any>;
}
