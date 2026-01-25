import { Pool, PoolClient } from "pg";
import { LeaderboardMessageQueries } from "@/db/queries/leaderboard/message";

/**
 * Namespace queries for leaderboard
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class LeaderboardQueries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!LeaderboardQueries.queryInstances.has(this.db)) {
      LeaderboardQueries.queryInstances.set(this.db, new Map());
    }

    const cache = LeaderboardQueries.queryInstances.get(this.db)!;
    const fullKey = `leaderboard.${key}`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}

  private _message?: LeaderboardMessageQueries;

  /**
   * Lazy-loaded singleton accessor for leaderboard_message
   */
  get message(): LeaderboardMessageQueries {
    if (!this._message) {
      this._message = this.getOrCreateChild<LeaderboardMessageQueries>('message', LeaderboardMessageQueries);
    }
    return this._message;
  }
}
