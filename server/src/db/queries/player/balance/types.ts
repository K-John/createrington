import { CamelCaseKeys } from "@/types";

export interface PlayerBalanceRow {
  player_minecraft_uuid: string;
  balance: string;
  updated_at: Date;
}

export type PlayerBalance = CamelCaseKeys<PlayerBalanceRow>;

export type PlayerBalanceCreate = {
  playerMinecraftUuid: string;
  balance: string;
  updatedAt?: Date;
};
