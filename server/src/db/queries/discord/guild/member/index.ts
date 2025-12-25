import { Pool, PoolClient } from "pg";
import { DiscordGuildMemberJoinQueries } from "@/db/queries/discord/guild/member/join";

/**
 * Namespace queries for discord_guild_member
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class DiscordGuildMemberQueries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!DiscordGuildMemberQueries.queryInstances.has(this.db)) {
      DiscordGuildMemberQueries.queryInstances.set(this.db, new Map());
    }

    const cache = DiscordGuildMemberQueries.queryInstances.get(this.db)!;
    const fullKey = `discord_guild_member.${key}`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}
  private _join?: DiscordGuildMemberJoinQueries;

  /**
   * Lazy-loaded singleton accessor for discord_guild_member_join
   */
  get join(): DiscordGuildMemberJoinQueries {
    if (!this._join) {
      this._join = this.getOrCreateChild<DiscordGuildMemberJoinQueries>('join', DiscordGuildMemberJoinQueries);
    }
    return this._join;
  }
}
