import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { PlayerBalance, PlayerBalanceCreate, PlayerBalanceRow } from "./types";

type Identifier = { playerMinecraftUuid: string };

type Filters = {
  balance: string;
  updatedAt: Date;
};

export class PlayerBalanceQueries extends BaseQueries<{
  DbEntity: PlayerBalanceRow;
  Entity: PlayerBalance;
  Identifier: Identifier;
  Filters: Filters;
  Update: Partial<Identifier>;
  Create: PlayerBalanceCreate;
}> {
  protected readonly table = "player_balance";

  constructor(db: Pool) {
    super(db);
  }
}
