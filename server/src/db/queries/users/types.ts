/**
 * Represents user record in the database
 */
export interface User {
  /** Identifier/Unique */
  id: number;
  /** Identifier/Unique */
  mcUuid: string;
  /** Identifier/Unique */
  mcName: string;
  /** Identifier/Unique */
  discordId: string;
  balance: string;
  online: boolean;
  lastSeen: Date;
  sessionStart: Date | null;
  totalPlaytime: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database representation (snake_case columns)
 */
export interface UserRow {
  id: number;
  mc_uuid: string;
  mc_name: string;
  discord_id: string;
  balance: string;
  online: boolean;
  last_seen: Date;
  session_start: Date;
  total_playtime: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Data required to create a new user record
 */
export interface UserCreate {
  mcUuid: string;
  mcName: string;
  discordId: string;
  balance?: string;
}

/**
 * Data that is possible to change for a user record
 */
export interface UserUpdate {
  balance: string;
  online: boolean;
  lastSeen: Date;
  sessionStart: Date;
  totalPlaytime: number;
  updatedAt: Date;
}
