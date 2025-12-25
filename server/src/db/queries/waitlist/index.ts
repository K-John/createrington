import { Pool, PoolClient } from "pg";
import { WaitlistEntryQueries } from "@/db/queries/waitlist/entry";

/**
 * Namespace queries for waitlist
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class WaitlistQueries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!WaitlistQueries.queryInstances.has(this.db)) {
      WaitlistQueries.queryInstances.set(this.db, new Map());
    }

    const cache = WaitlistQueries.queryInstances.get(this.db)!;
    const fullKey = `waitlist.${key}`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}
  private _entry?: WaitlistEntryQueries;

  /**
   * Lazy-loaded singleton accessor for waitlist_entry
   */
  get entry(): WaitlistEntryQueries {
    if (!this._entry) {
      this._entry = this.getOrCreateChild<WaitlistEntryQueries>('entry', WaitlistEntryQueries);
    }
    return this._entry;
  }
}
