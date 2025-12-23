import { CamelCaseKeys } from "@/types";

/**
 * Database representation of player record
 */
export interface PlayerRow {
  uuid: string;
  name: string;
  discord_id: string;
  online: boolean;
  last_seen: Date;
  created_at: Date;
  updated_at: Date;
}

export type Player = CamelCaseKeys<PlayerRow>;

export interface PlayerCreate {
  uuid: string;
  name: string;
  discordId: string;
}
