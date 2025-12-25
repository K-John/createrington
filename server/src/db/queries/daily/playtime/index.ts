import { Pool, PoolClient } from "pg";
import { DailyPlaytimeBaseQueries } from "@/generated/db/daily_playtime.queries";

/**
 * Custom queries for daily_playtime table
 * 
 * Extends the auto-generated base class with custom methods
 */
export class DailyPlaytimeQueries extends DailyPlaytimeBaseQueries {
  constructor(db: Pool | PoolClient) {
    super(db);
  }

  // Custom methods can be implemented here
}
