import { Pool, PoolClient } from "pg";
import { DiscordGuildQueries } from "@/db/queries/discord/guild";

/**
 * Namespace queries for discord
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class DiscordQueries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!DiscordQueries.queryInstances.has(this.db)) {
      DiscordQueries.queryInstances.set(this.db, new Map());
    }

    const cache = DiscordQueries.queryInstances.get(this.db)!;
    const fullKey = `discord.${key}`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}

  private _guild?: DiscordGuildQueries;

  /**
   * Lazy-loaded singleton accessor for discord_guild
   */
  get guild(): DiscordGuildQueries {
    if (!this._guild) {
      this._guild = this.getOrCreateChild<DiscordGuildQueries>('guild', DiscordGuildQueries);
    }
    return this._guild;
  }
}
