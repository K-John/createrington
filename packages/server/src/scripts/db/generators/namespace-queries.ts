import type { TableStructure } from "../types";

/**
 * Generate namespace query class (for grouping related tables)
 */
export function generateNamespaceQueries(structure: TableStructure): string {
  const { className, tableName, children } = structure;

  return `import { Pool, PoolClient } from "pg";
${generateChildImports(children)}

/**
 * Namespace queries for ${tableName}
 * 
 * This is a pure namespace that groups related query classes
 * It uses the singleton pattern for optimal performance
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class ${className}Queries {
  // Singleton registry
  private static queryInstances = new WeakMap<
    Pool | PoolClient,
    Map<string, any>
  >();

  protected getOrCreateChild<T>(
    key: string,
    QueryClass: new (db: Pool | PoolClient) => T
  ): T {
    if (!${className}Queries.queryInstances.has(this.db)) {
      ${className}Queries.queryInstances.set(this.db, new Map());
    }

    const cache = ${className}Queries.queryInstances.get(this.db)!;
    const fullKey = \`${tableName}.\${key}\`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}
${generateChildProperties(structure)}
}
`;
}

/**
 * Generate imports for child query classes
 */
function generateChildImports(children: TableStructure[]): string {
  return children
    .map((child) => {
      const parts = child.tableName.split("_");
      return `import { ${
        child.className
      }Queries } from "@/db/queries/${parts.join("/")}";`;
    })
    .join("\n");
}

/**
 * Generate child property accessors
 */
function generateChildProperties(structure: TableStructure): string {
  return structure.children
    .map((child) => {
      const propName = getChildPropertyName(
        structure.tableName,
        child.tableName
      );

      return `
  private _${propName}?: ${child.className}Queries;

  /**
   * Lazy-loaded singleton accessor for ${child.tableName}
   */
  get ${propName}(): ${child.className}Queries {
    if (!this._${propName}) {
      this._${propName} = this.getOrCreateChild<${child.className}Queries>('${propName}', ${child.className}Queries);
    }
    return this._${propName};
  }`;
    })
    .join("\n");
}

/**
 * Get the property name for a child query
 */
function getChildPropertyName(parentName: string, childName: string): string {
  return childName.replace(parentName + "_", "").split("_")[0];
}
