import type { TableInfo, TableStructure } from "../types";
import { extractIdentifierFieldNames } from "./types";

/**
 * Generate base query class with child accessor patterns and identifier validation
 */
export function generateBaseQueries(
  table: TableInfo,
  structure: TableStructure,
): string {
  const { className, tableName, children } = structure;
  const identifierFields = extractIdentifierFieldNames(table);
  const identifierFieldsSet = `new Set([${identifierFields
    .map((f) => `'${f}'`)
    .join(", ")}])`;

  return `import { Pool, PoolClient } from "pg";
import { BaseQueries } from "@/db/queries/base.queries";
import {
  ${className},
  ${className}Create,
  ${className}Row,
  ${className}Identifier,
  ${className}Filters,
} from "@createrington/shared/db/${tableName}.types";
${generateChildImports(children)}

/**
 * Auto-generated base queries for ${tableName} table
 * 
 * Child query instances are singletons per database pool for optimal performance
 * 
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export class ${className}BaseQueries extends BaseQueries<{
  DbEntity: ${className}Row;
  Entity: ${className};
  Identifier: ${className}Identifier;
  Filters: ${className}Filters;
  Update: Partial<${className}>;
  Create: ${className}Create;
}> {
  protected readonly table = "${tableName}";
  
  /**
   * Valid identifier fields for this table
   * Used by extractIdentifier to skip invalid fields when passed full entities
   */
  protected readonly VALID_IDENTIFIER_FIELDS = ${identifierFieldsSet};

  constructor(db: Pool | PoolClient) {
    super(db);
  }

  // Child query singletons (shared across all instances using this pool)
${generateChildProperties(structure)}
}
`;
}

/**
 * Generate imports for child query classes
 */
function generateChildImports(children: TableStructure[]): string {
  if (children.length === 0) return "";

  const typeImports = children
    .map((child) => {
      const parts = child.tableName.split("_");
      return `import type { ${
        child.className
      }Queries } from "@/db/queries/${parts.join("/")}";`;
    })
    .join("\n");

  const actualImports = children
    .map((child) => {
      const parts = child.tableName.split("_");
      return `import { ${child.className}Queries as ${
        child.className
      }QueriesImpl } from "@/db/queries/${parts.join("/")}";`;
    })
    .join("\n");

  return `\n${typeImports}\n${actualImports}`;
}

/**
 * Generate child property accessors
 */
function generateChildProperties(structure: TableStructure): string {
  if (structure.children.length === 0) return "";

  return structure.children
    .map((child) => {
      const propName = getChildPropertyName(
        structure.tableName,
        child.tableName,
      );

      return `
  private _${propName}?: ${child.className}Queries;
  
  /**
   * Singleton accessor for ${child.tableName} queries
   */
  get ${propName}(): ${child.className}Queries {
    if (!this._${propName}) {
      this._${propName} = this.getOrCreateChild<${child.className}Queries>('${propName}', ${child.className}QueriesImpl);
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
  // Remove parent prefix and get the next segment
  return childName.replace(parentName + "_", "").split("_")[0];
}
