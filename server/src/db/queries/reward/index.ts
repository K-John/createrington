import { Pool, PoolClient } from "pg";
import { RewardClaimQueries } from "@/db/queries/reward/claim";

/**
 * Namespace queries for reward
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class RewardQueries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!RewardQueries.queryInstances.has(this.db)) {
      RewardQueries.queryInstances.set(this.db, new Map());
    }

    const cache = RewardQueries.queryInstances.get(this.db)!;
    const fullKey = `reward.${key}`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}

  private _claim?: RewardClaimQueries;

  /**
   * Lazy-loaded singleton accessor for reward_claim
   */
  get claim(): RewardClaimQueries {
    if (!this._claim) {
      this._claim = this.getOrCreateChild<RewardClaimQueries>('claim', RewardClaimQueries);
    }
    return this._claim;
  }
}
