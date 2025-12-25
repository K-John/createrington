import { Pool, PoolClient } from "pg";
import { DailyPlaytimeQueries } from "@/db/queries/daily/playtime";

/**
 * Namespace queries for daily
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class DailyQueries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!DailyQueries.queryInstances.has(this.db)) {
      DailyQueries.queryInstances.set(this.db, new Map());
    }

    const cache = DailyQueries.queryInstances.get(this.db)!;
    const fullKey = `daily.${key}`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}
  private _playtime?: DailyPlaytimeQueries;

  /**
   * Lazy-loaded singleton accessor for daily_playtime
   */
  get playtime(): DailyPlaytimeQueries {
    if (!this._playtime) {
      this._playtime = this.getOrCreateChild<DailyPlaytimeQueries>('playtime', DailyPlaytimeQueries);
    }
    return this._playtime;
  }
}
