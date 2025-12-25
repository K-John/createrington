import { Pool, PoolClient } from "pg";
import { AdminLogActionBaseQueries } from "@/generated/db/admin_log_action.queries";

/**
 * Custom queries for admin_log_action table
 * 
 * Extends the auto-generated base class with custom methods
 */
export class AdminLogActionQueries extends AdminLogActionBaseQueries {
  constructor(db: Pool | PoolClient) {
    super(db);
  }

  // Custom methods can be implemented here
}
