import type { TableStructure } from "../types";

/**
 * Generate actual query class (extends Base) - for scaffolding only
 */
export function generateActualQueries(structure: TableStructure): string {
  const { className, tableName } = structure;

  return `import { Pool, PoolClient } from "pg";
import { ${className}BaseQueries } from "@/generated/db/${tableName}.queries";

/**
 * Custom queries for ${tableName} table
 * 
 * Extends the auto-generated base class with custom methods
 */
export class ${className}Queries extends ${className}BaseQueries {
  constructor(db: Pool | PoolClient) {
    super(db);
  }

  // Custom methods can be implemented here
}
`;
}
