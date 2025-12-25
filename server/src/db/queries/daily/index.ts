import { Pool, PoolClient } from "pg";
import { DailyPlaytimeQueries } from "@/db/queries/daily/playtime";

/**
 * Namespace queries for daily
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate:from-db
 * 
 * This file is always regenerated to ensure child accessors stay in sync
 */
export class DailyQueries {
  constructor(protected db: Pool | PoolClient) {}
  private _playtime?: DailyPlaytimeQueries;

  /**
   * Lazy-loaded singleton accessor for daily_playtime
   */
  get playtime(): DailyPlaytimeQueries {
    if (!this._playtime) {
      this._playtime = new DailyPlaytimeQueries(this.db);
    }
    return this._playtime;
  }
}
