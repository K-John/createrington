import { Pool } from "pg";
import { GuildMemberJoinQueries } from "./guild-member-join/queries";

export class DiscordQueries {
  private _guildMemberJoin?: GuildMemberJoinQueries;

  constructor(protected db: Pool) {}

  get guildMemberJoin(): GuildMemberJoinQueries {
    if (!this._guildMemberJoin) {
      this._guildMemberJoin = new GuildMemberJoinQueries(this.db);
    }
    return this._guildMemberJoin;
  }
}
