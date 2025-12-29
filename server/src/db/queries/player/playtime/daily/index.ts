import { Pool, PoolClient } from "pg";
import { PlayerPlaytimeDailyBaseQueries } from "@/generated/db/player_playtime_daily.queries";

/**
 * Custom queries for player_playtime_daily table
 * 
 * Extends the auto-generated base class with custom methods
 */
export class PlayerPlaytimeDailyQueries extends PlayerPlaytimeDailyBaseQueries {
  constructor(db: Pool | PoolClient) {
    super(db);
  }

  // Custom methods can be implemented here
}
