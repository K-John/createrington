import type { TableStructure } from "../types";
import { snakeToCamel } from "../utils/naming";
import { getRootStructures } from "../hierarchy/builder";

/**
 * Generate unified DatabaseQueries class with transaction support
 */
export function generateDatabaseQueries(hierarchy: TableStructure[]): string {
  const rootTables = getRootStructures(hierarchy);

  return `import type { Pool, PoolClient } from "pg";
import logger from "@/logger";
${generateImports(rootTables)}

/**
 * Unified database queries class
 * Contains all query instances and transaction management
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 * 
 * @example
 * // Normal usage
 * import { db } from "@/db";
 * await db.player.create({ ... });
 * await db.player.balance.findAll();
 * 
 * @example
 * // With transactions
 * import { db } from "@/db";
 * await db.inTransaction(async (tx) => {
 *   await tx.player.create({ ... });
 *   await tx.player.balance.create({ ... });
 * });
 */
export class DatabaseQueries {
  constructor(protected db: Pool | PoolClient) {}
${generateGetters(rootTables)}

  /**
   * Execute a callback within a database transaction
   * Creates a new DatabaseQueries instance using a transaction client
   * All queries within the callback will be part of the same transaction
   * 
   * @param callback - Function to execute with transaction-enabled queries
   * @returns Result from callback
   */
  async inTransaction<T>(
    callback: (tx: DatabaseQueries) => Promise<T>
  ): Promise<T> {
    // If already in transaction, reuse this instance
    if (this.isInTransaction()) {
      logger.debug("Already in transaction, reusing existing client");
      return callback(this);
    }

    const client = await (this.db as Pool).connect();

    try {
      await client.query("BEGIN");
      logger.debug("Transaction started");

      const txQueries = new DatabaseQueries(client);
      const result = await callback(txQueries);

      await client.query("COMMIT");
      logger.debug("Transaction committed");

      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Transaction rolled back:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if this instance is using a transaction client
   */
  isInTransaction(): boolean {
    return "processID" in this.db;
  }

  /**
   * Get the underlying database pool or client
   * Use with caution - prefer using the query methods instead
   */
  getDb(): Pool | PoolClient {
    return this.db;
  }
}
`;
}

/**
 * Generate imports for root query classes
 */
function generateImports(rootTables: TableStructure[]): string {
  return rootTables
    .map((t) => {
      const parts = t.tableName.split("_");
      return `import { ${t.className}Queries } from "@/db/queries/${parts.join(
        "/"
      )}";`;
    })
    .join("\n");
}

/**
 * Generate lazy-loaded getters for each root table
 */
function generateGetters(rootTables: TableStructure[]): string {
  return rootTables
    .map((t) => {
      const propName = snakeToCamel(t.tableName);
      return `
  private _${propName}?: ${t.className}Queries;

  /**
   * Lazy-loaded singleton accessor for ${t.tableName} queries
   */
  get ${propName}(): ${t.className}Queries {
    if (!this._${propName}) {
      this._${propName} = new ${t.className}Queries(this.db);
    }
    return this._${propName};
  }`;
    })
    .join("\n");
}
