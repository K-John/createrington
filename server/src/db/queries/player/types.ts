/**
 * Represents a player record in the database
 */
export interface Player {
  /** Identifier/Unique */
  uuid: string;
  /** Identifier/Unique */
  name: string;
  /** Identifier/Unique */
  discordId: string;
  online: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database representation of player record
 */
export interface PlayerRow {
  uuid: string;
  name: string;
  discord_id: string;
  online: boolean;
  last_seen: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PlayerIdentifier {
  uuid: string;
  name: string;
  discordId: string;
}

export interface PlayerFilter {
  online: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerCreate {
  uuid: string;
  name: string;
  discordId: string;
}
