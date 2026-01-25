import { Pool, PoolClient } from "pg";
import { DiscordGuildMemberQueries } from "@/db/queries/discord/guild/member";

/**
 * Namespace queries for discord_guild
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class DiscordGuildQueries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!DiscordGuildQueries.queryInstances.has(this.db)) {
      DiscordGuildQueries.queryInstances.set(this.db, new Map());
    }

    const cache = DiscordGuildQueries.queryInstances.get(this.db)!;
    const fullKey = `discord_guild.${key}`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}

  private _member?: DiscordGuildMemberQueries;

  /**
   * Lazy-loaded singleton accessor for discord_guild_member
   */
  get member(): DiscordGuildMemberQueries {
    if (!this._member) {
      this._member = this.getOrCreateChild<DiscordGuildMemberQueries>('member', DiscordGuildMemberQueries);
    }
    return this._member;
  }
}
