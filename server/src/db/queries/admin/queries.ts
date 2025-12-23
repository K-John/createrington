import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { Admin, AdminCreate, AdminRow } from "./types";

type Identifier = { discordId: string };

type Filters = { vanished: boolean };

type Update = Filters;

export class AdminQueries extends BaseQueries<{
  DbEntity: AdminRow;
  Entity: Admin;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: AdminCreate;
}> {
  protected readonly table = "admin";

  constructor(db: Pool) {
    super(db);
  }
}
