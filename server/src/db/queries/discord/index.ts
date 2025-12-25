import { Pool, PoolClient } from "pg";
import { DiscordGuildQueries } from "@/db/queries/discord/guild";

/**
 * Namespace queries for discord
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate:from-db
 * 
 * This file is always regenerated to ensure child accessors stay in sync
 */
export class DiscordQueries {
  constructor(protected db: Pool | PoolClient) {}
  private _guild?: DiscordGuildQueries;

  /**
   * Lazy-loaded singleton accessor for discord_guild
   */
  get guild(): DiscordGuildQueries {
    if (!this._guild) {
      this._guild = new DiscordGuildQueries(this.db);
    }
    return this._guild;
  }
}
