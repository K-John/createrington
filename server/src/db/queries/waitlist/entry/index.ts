import { Pool, PoolClient } from "pg";
import { WaitlistEntryBaseQueries } from "@/generated/db";

/**
 * Custom queries for waitlist_entry table
 * 
 * Extends the auto-generated base class with custom methods
 */
export class WaitlistEntryQueries extends WaitlistEntryBaseQueries {
  constructor(db: Pool | PoolClient) {
    super(db);
  }

  // Custom methods can be implemented here
}
