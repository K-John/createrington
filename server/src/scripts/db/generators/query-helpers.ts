import type { TableStructure } from "../types";
import { snakeToCamel } from "../utils/naming";
import { getRootStructures } from "../hierarchy/builder";

/**
 * Generate query initialization helpers (Q object and createQueries)
 */
export function generateQueryHelpers(hierarchy: TableStructure[]): string {
  const rootTables = getRootStructures(hierarchy);

  return `import type { Pool, PoolClient } from "pg";
${generateImports(rootTables)}

${generateQueryInstancesInterface(rootTables)}

${generateCreateQueryInstances(rootTables)}

${generateCreateQueries(rootTables)}

${generateExportHelper(rootTables)}
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
 * Generate QueryInstances interface
 */
function generateQueryInstancesInterface(rootTables: TableStructure[]): string {
  const properties = rootTables
    .map((t) => {
      const propName = snakeToCamel(t.tableName);
      return `  ${propName}: ${t.className}Queries;`;
    })
    .join("\n");

  return `/**
 * Query singleton instances type
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface QueryInstances {
${properties}
}`;
}

/**
 * Generate createQueryInstances function
 */
function generateCreateQueryInstances(rootTables: TableStructure[]): string {
  const properties = rootTables
    .map((t) => {
      const propName = snakeToCamel(t.tableName);
      return `    ${propName}: new ${t.className}Queries(db),`;
    })
    .join("\n");

  return `/**
 * Create query singleton instances for normal usage
 * 
 * @param db - Database pool
 * @returns Object with all query instances
 * 
 * @example
 * \`\`\`typescript
 * import { createQueryInstances } from "@/generated/db/queries";
 * import db from "@/db";
 * 
 * export const Q = createQueryInstances(db);
 * 
 * // Use anywhere:
 * await Q.player.get({ id: 1 });
 * await Q.player.balance.findAll();
 * \`\`\`
 */
export function createQueryInstances(db: Pool): QueryInstances {
  return {
${properties}
  };
}`;
}

/**
 * Generate createQueries function (for transactions)
 */
function generateCreateQueries(rootTables: TableStructure[]): string {
  const properties = rootTables
    .map((t) => {
      const propName = snakeToCamel(t.tableName);
      return `    ${propName}: new ${t.className}Queries(client),`;
    })
    .join("\n");

  return `/**
 * Create query instances using a transaction client
 * Use this inside transaction callbacks
 * 
 * @param client - Transaction client from transaction helper
 * @returns Object with all query instances using the transaction client
 * 
 * @example
 * \`\`\`typescript
 * import { transaction } from "@/db/utils/transactions";
 * import { createQueries } from "@/generated/db/queries";
 * import db from "@/db";
 * 
 * await transaction(db, async (client) => {
 *   const Q = createQueries(client);
 *   await Q.player.create({ ... });
 *   await Q.player.balance.create({ ... });
 * });
 * \`\`\`
 */
export function createQueries(client: PoolClient): QueryInstances {
  return {
${properties}
  };
}`;
}

/**
 * Generate helper comment for individual exports
 */
function generateExportHelper(rootTables: TableStructure[]): string {
  const exportNames = rootTables
    .map((t) => snakeToCamel(t.tableName))
    .join(", ");

  return `/**
 * Helper to extract individual query instances from Q object
 * 
 * Copy this to your db/index.ts file:
 * 
 * export const { ${exportNames} } = Q;
 */
export type IndividualQueryExports = QueryInstances;`;
}
