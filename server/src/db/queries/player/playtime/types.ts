import { CamelCaseKeys } from "@/types";

export interface PlayerPlaytimeRow {
  player_minecraft_uuid: string;
  server_id: number;
  total_seconds: number;
  session_start: Date | null;
  updated_at: Date;
}

export type PlayerPlaytime = CamelCaseKeys<PlayerPlaytimeRow>;

export interface PlayerPlaytimeCreate {
  playerMinecraftUuid: string;
  serverId: number;
  totalSeconds: number;
  sessionStart?: Date;
}
