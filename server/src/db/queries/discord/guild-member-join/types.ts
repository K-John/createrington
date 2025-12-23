import { CamelCaseKeys } from "@/types";

/**
 * Database representation (snake_case columns)
 */
export interface GuildMemberJoinRow {
  join_number: number;
  user_id: string;
  username: string;
  joined_at: Date;
}

export type GuildMemberJoin = CamelCaseKeys<GuildMemberJoinRow>;

/**
 * Data required to create a new join record
 */
export interface GuildMemberJoinCreate {
  userId: string;
  username: string;
  joinedAt?: Date;
}
