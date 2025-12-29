import type { TableInfo, TableStructure } from "../types";
import { snakeToPascal } from "../utils/naming";
import { collectAllStructures, getActualTables } from "../hierarchy/builder";

/**
 * Generate barrel export file (main index.ts in generated/db)
 */
export function generateBarrelExport(tables: TableInfo[]): string {
  const typeAndBaseExports = tables
    .map((table) => {
      const className = snakeToPascal(table.tableName);
      return `export * from "./${table.tableName}.types";
export { ${className}BaseQueries } from "./${table.tableName}.queries";`;
    })
    .join("\n");

  return `/**
 * Barrel export for all generated database types and queries
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */

// ============================================================================
// TYPE EXPORTS (Row, Entity, Create, Identifier, Filters)
// ============================================================================

${typeAndBaseExports}

// ============================================================================
// BASE QUERY CLASSES (DO NOT export actual queries here - causes circular deps)
// ============================================================================

// Actual query classes are exported from @/db directly, not from generated/

// ============================================================================
// DATABASE QUERY SINGLETON & HELPERS
// ============================================================================

export { DatabaseQueries } from "./db";
export { createQueryInstances, createQueries } from "./queries";
export type { QueryInstances } from "./queries";

// ============================================================================
// DATABASE CONSTANTS (Tables & Fields)
// ============================================================================

export { DatabaseTable } from "./constants";
export type { TableName, FieldName, CamelFieldName } from "./constants";
export {
  getAllTableNames,
  isValidTableName,
  getTableByName,
  snakeToCamel,
  camelToSnake,
} from "./constants";
`;
}

/**
 * Generate barrel export for actual query classes (/db/queries/index.ts)
 */
export function generateActualQueriesBarrel(
  hierarchy: TableStructure[]
): string {
  const actualTables = getActualTables(hierarchy);

  const exports = actualTables
    .map((structure) => {
      const className = structure.className;
      const parts = structure.tableName.split("_");
      return `export { ${className}Queries } from "./${parts.join("/")}";`;
    })
    .join("\n");

  return `/**
 * Barrel export for all actual query classes
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 * 
 * @example
 * import { PlayerQueries, AdminLogActionQueries } from "@/db/queries";
 */

${exports}
`;
}
