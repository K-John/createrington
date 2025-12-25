import { Pool } from "pg";
import { AdminLogActionQueries } from "./actions/queries";

export class AdminLogQueries {
  private _action?: AdminLogActionQueries;

  constructor(protected db: Pool) {}

  get action(): AdminLogActionQueries {
    if (!this._action) {
      this._action = new AdminLogActionQueries(this.db);
    }
    return this._action;
  }
}
