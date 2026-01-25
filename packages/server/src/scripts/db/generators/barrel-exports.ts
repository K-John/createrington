import type { TableInfo, TableStructure } from "../types";
import { snakeToPascal } from "../utils/naming";
import { collectAllStructures, getActualTables } from "../hierarchy/builder";

/**
 * Generate barrel export for shared package (types only)
 */
export function generateSharedBarrelExport(tables: TableInfo[]): string {
  const typeExports = tables
    .map((table) => {
      return `export * from "./${table.tableName}.types";`;
    })
    .join("\n");

  return `/**
 * Barrel export for all shared database types
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */

// Base types for filters and operators
export * from "./base.types";

// Generated table types
${typeExports}
`;
}

/**
 * Generate barrel export file (main index.ts in generated/db)
 */
export function generateBarrelExport(tables: TableInfo[]): string {
  const baseExports = tables
    .map((table) => {
      const className = snakeToPascal(table.tableName);
      return `export { ${className}BaseQueries } from "./${table.tableName}.queries";`;
    })
    .join("\n");

  return `/**
 * Barrel export for all generated database queries
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */

// ============================================================================
// TYPE EXPORTS - Re-export from shared package
// ============================================================================

export * from "@createrington/shared/db";

// ============================================================================
// BASE QUERY CLASSES
// ============================================================================

${baseExports}

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
  hierarchy: TableStructure[],
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
