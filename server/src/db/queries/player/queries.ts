import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { Player, PlayerCreate, PlayerRow } from "./types";

type Identifier = { uuid: string } | { name: string } | { discordId: string };

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

  constructor(db: Pool) {
    super(db);
  }
}
