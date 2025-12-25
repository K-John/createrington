import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { Player, PlayerCreate, PlayerRow } from "./types";
import { PlayerBalanceQueries } from "./balance/queries";
import { PlayerPlaytimeQueries } from "./playtime/queries";

type Identifier =
  | { uuid: string }
  | { minecraftUsername: string }
  | { discordId: string };

interface Filters {
  online: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PlayerQueries extends BaseQueries<{
  DbEntity: PlayerRow;
  Entity: Player;
  Identifier: Identifier;
  Filters: Filters;
  Create: PlayerCreate;
  Update: Partial<Player>;
}> {
  protected readonly table = "player";

  private _balance?: PlayerBalanceQueries;

  private _playtime?: PlayerPlaytimeQueries;

  constructor(db: Pool) {
    super(db);
  }

  get balance(): PlayerBalanceQueries {
    if (!this._balance) {
      this._balance = new PlayerBalanceQueries(this.db);
    }
    return this._balance;
  }

  get playtime(): PlayerPlaytimeQueries {
    if (!this._playtime) {
      this._playtime = new PlayerPlaytimeQueries(this.db);
    }
    return this._playtime;
  }
}
