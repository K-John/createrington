import { Pool, PoolClient } from "pg";
import { AdminLogActionQueries } from "@/db/queries/admin/log/action";

/**
 * Namespace queries for admin_log
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class AdminLogQueries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!AdminLogQueries.queryInstances.has(this.db)) {
      AdminLogQueries.queryInstances.set(this.db, new Map());
    }

    const cache = AdminLogQueries.queryInstances.get(this.db)!;
    const fullKey = `admin_log.${key}`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}

  private _action?: AdminLogActionQueries;

  /**
   * Lazy-loaded singleton accessor for admin_log_action
   */
  get action(): AdminLogActionQueries {
    if (!this._action) {
      this._action = this.getOrCreateChild<AdminLogActionQueries>('action', AdminLogActionQueries);
    }
    return this._action;
  }
}
