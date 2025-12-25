import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { Admin, AdminCreate, AdminRow } from "./types";
import { AdminLogQueries } from "./log/queries";

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

  private _log?: AdminLogQueries;

  constructor(db: Pool) {
    super(db);
  }

  get log(): AdminLogQueries {
    if (!this._log) {
      this._log = new AdminLogQueries(this.db);
    }
    return this._log;
  }
}
