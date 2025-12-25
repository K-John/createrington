import { Pool, PoolClient } from "pg";
import { AdminLogActionQueries } from "@/db/queries/admin/log/action";

/**
 * Namespace queries for admin_log
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate:from-db
 * 
 * This file is always regenerated to ensure child accessors stay in sync
 */
export class AdminLogQueries {
  constructor(protected db: Pool | PoolClient) {}
  private _action?: AdminLogActionQueries;

  /**
   * Lazy-loaded singleton accessor for admin_log_action
   */
  get action(): AdminLogActionQueries {
    if (!this._action) {
      this._action = new AdminLogActionQueries(this.db);
    }
    return this._action;
  }
}
