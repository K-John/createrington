import { Pool, PoolClient } from "pg";
import { DiscordGuildMemberJoinQueries } from "@/db/queries/discord/guild/member/join";

/**
 * Namespace queries for discord_guild_member
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate:from-db
 * 
 * This file is always regenerated to ensure child accessors stay in sync
 */
export class DiscordGuildMemberQueries {
  constructor(protected db: Pool | PoolClient) {}
  private _join?: DiscordGuildMemberJoinQueries;

  /**
   * Lazy-loaded singleton accessor for discord_guild_member_join
   */
  get join(): DiscordGuildMemberJoinQueries {
    if (!this._join) {
      this._join = new DiscordGuildMemberJoinQueries(this.db);
    }
    return this._join;
  }
}
