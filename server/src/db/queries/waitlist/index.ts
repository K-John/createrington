import { Pool, PoolClient } from "pg";
import { WaitlistEntryQueries } from "@/db/queries/waitlist/entry";

/**
 * Namespace queries for waitlist
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate:from-db
 * 
 * This file is always regenerated to ensure child accessors stay in sync
 */
export class WaitlistQueries {
  constructor(protected db: Pool | PoolClient) {}
  private _entry?: WaitlistEntryQueries;

  /**
   * Lazy-loaded singleton accessor for waitlist_entry
   */
  get entry(): WaitlistEntryQueries {
    if (!this._entry) {
      this._entry = new WaitlistEntryQueries(this.db);
    }
    return this._entry;
  }
}
