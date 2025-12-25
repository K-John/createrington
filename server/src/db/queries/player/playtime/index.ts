import { Pool, PoolClient } from "pg";
import { PlayerPlaytimeBaseQueries } from "@/generated/db/player_playtime.queries";

/**
 * Custom queries for player_playtime table
 * 
 * Extends the auto-generated base class with custom methods
 */
export class PlayerPlaytimeQueries extends PlayerPlaytimeBaseQueries {
  constructor(db: Pool | PoolClient) {
    super(db);
  }

  // Custom methods can be implemented here
}
