import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import {
  PlayerPlaytime,
  PlayerPlaytimeCreate,
  PlayerPlaytimeRow,
} from "./types";

type Identifier = { playerMinecraftUuid: string };

type Filters = {
  playerUuid: string;
  serverId: number;
  totalSeconds: number;
};

export class PlayerPlaytimeQueries extends BaseQueries<{
  DbEntity: PlayerPlaytimeRow;
  Entity: PlayerPlaytime;
  Identifier: Identifier;
  Filters: Filters;
  Create: PlayerPlaytimeCreate;
  Update: Partial<PlayerPlaytime>;
}> {
  protected readonly table = "player_playtime";

  constructor(db: Pool) {
    super(db);
  }
}
