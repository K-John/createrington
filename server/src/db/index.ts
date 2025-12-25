import pg from "pg";
import config from "@/config";
import { createQueryInstances, createQueries } from "@/generated/db/queries";
import * as repositories from "./repositories";

/**
 * PostgreSQL database pool instance using environment variables
 *
 * Environment variables used:
 * @env DB_USER - The PostgreSQL username
 * @env DB_HOST - The PostgreSQL host
 * @env DB_DATABASE - The name of the database
 * @env DB_PASSWORD - The database user's password
 * @env DB_PORT - The port PostgreSQL is running on
 */
const db = new pg.Pool(config.database.pool);

try {
  await db.query("SELECT 1");
  logger.info("Connected to PostgreSQL database");
} catch (error) {
  logger.error("Failed to connect to DB:", error);
  process.exit(1);
}

// ============================================================================
// QUERY SINGLETONS (for normal usage)
// ============================================================================

export const Q = createQueryInstances(db);

// Individual exports for convenience
export const { player, discord, waitlist, admin, server } = Q;

// ============================================================================
// QUERY FACTORY (for transactions)
// ============================================================================

export { createQueries };

// ============================================================================
// REPOSITORIES
// ============================================================================

export const waitlistRepo = new repositories.WaitlistRepository();

export const R = { waitlistRepo };

// ============================================================================
// EXPORTS
// ============================================================================

export default db;
export { transaction, Transaction } from "./utils/transactions";
