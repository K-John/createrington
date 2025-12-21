import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import {
  Player,
  PlayerCreate,
  PlayerFilter,
  PlayerIdentifier,
  PlayerRow,
} from "./types";

export class PlayerQueries extends BaseQueries<{
  DbEntity: PlayerRow;
  Entity: Player;
  Identifier: PlayerIdentifier;
  Filters: PlayerFilter;
  Update: Partial<PlayerFilter>;
  Create: PlayerCreate;
}> {
  protected readonly table = "player";

  constructor(db: Pool) {
    super(db);
  }
}
