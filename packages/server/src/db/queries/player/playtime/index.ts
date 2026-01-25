import { Pool, PoolClient } from "pg";
import { PlayerPlaytimeDailyQueries } from "@/db/queries/player/playtime/daily";
import { PlayerPlaytimeHourlyQueries } from "@/db/queries/player/playtime/hourly";
import { PlayerPlaytimeSummaryQueries } from "@/db/queries/player/playtime/summary";

/**
 * Namespace queries for player_playtime
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class PlayerPlaytimeQueries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!PlayerPlaytimeQueries.queryInstances.has(this.db)) {
      PlayerPlaytimeQueries.queryInstances.set(this.db, new Map());
    }

    const cache = PlayerPlaytimeQueries.queryInstances.get(this.db)!;
    const fullKey = `player_playtime.${key}`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}

  private _daily?: PlayerPlaytimeDailyQueries;

  /**
   * Lazy-loaded singleton accessor for player_playtime_daily
   */
  get daily(): PlayerPlaytimeDailyQueries {
    if (!this._daily) {
      this._daily = this.getOrCreateChild<PlayerPlaytimeDailyQueries>('daily', PlayerPlaytimeDailyQueries);
    }
    return this._daily;
  }

  private _hourly?: PlayerPlaytimeHourlyQueries;

  /**
   * Lazy-loaded singleton accessor for player_playtime_hourly
   */
  get hourly(): PlayerPlaytimeHourlyQueries {
    if (!this._hourly) {
      this._hourly = this.getOrCreateChild<PlayerPlaytimeHourlyQueries>('hourly', PlayerPlaytimeHourlyQueries);
    }
    return this._hourly;
  }

  private _summary?: PlayerPlaytimeSummaryQueries;

  /**
   * Lazy-loaded singleton accessor for player_playtime_summary
   */
  get summary(): PlayerPlaytimeSummaryQueries {
    if (!this._summary) {
      this._summary = this.getOrCreateChild<PlayerPlaytimeSummaryQueries>('summary', PlayerPlaytimeSummaryQueries);
    }
    return this._summary;
  }
}
