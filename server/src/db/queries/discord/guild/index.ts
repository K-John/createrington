import { Pool, PoolClient } from "pg";
import { DiscordGuildMemberQueries } from "@/db/queries/discord/guild/member";

/**
 * Namespace queries for discord_guild
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate:from-db
 * 
 * This file is always regenerated to ensure child accessors stay in sync
 */
export class DiscordGuildQueries {
  constructor(protected db: Pool | PoolClient) {}
  private _member?: DiscordGuildMemberQueries;

  /**
   * Lazy-loaded singleton accessor for discord_guild_member
   */
  get member(): DiscordGuildMemberQueries {
    if (!this._member) {
      this._member = new DiscordGuildMemberQueries(this.db);
    }
    return this._member;
  }
}
