import type { TableInfo } from "../types";
import { snakeToPascal, snakeToCamel } from "../utils/naming";
import { pgTypeToTsType, getNumericComment } from "../utils/type-mapping";

/**
 * Generate TypeScript type definitions for a table
 */
export function generateTypes(table: TableInfo): string {
  const className = snakeToPascal(table.tableName);

  return `import { CamelCaseKeys } from "@/types";

/**
 * Database representation of ${table.tableName} table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
${generateRowInterface(table, className)}

/**
 * Application representation (camelCase)
 */
${generateEntityType(className)}

/**
 * Data required to create a new ${table.tableName} record
 */
${generateCreateInterface(table, className)}

/**
 * Valid identifiers for querying ${table.tableName}
 */
${generateIdentifierType(table, className)}

/**
 * Filterable fields for ${table.tableName}
 */
${generateFiltersType(table, className)}
`;
}

/**
 * Generate the Row interface (database representation)
 */
function generateRowInterface(table: TableInfo, className: string): string {
  const fields = table.columns.map((col) => {
    const type = pgTypeToTsType(
      col.udtName,
      col.isNullable,
      col.numericPrecision,
      col.numericScale
    );
    const comment = getNumericComment(
      col.udtName,
      col.numericPrecision,
      col.numericScale
    );
    return `  ${col.columnName}: ${type};${comment}`;
  });

  return `export interface ${className}Row {
${fields.join("\n")}
}`;
}

/**
 * Generate the Entity type (camelCase representation)
 */
function generateEntityType(className: string): string {
  return `export type ${className} = CamelCaseKeys<${className}Row>;`;
}

/**
 * Generate the Create interface (for inserts)
 */
function generateCreateInterface(table: TableInfo, className: string): string {
  const { required, optional } = partitionCreateFields(table);

  const requiredFields = required.map((col) => {
    const type = pgTypeToTsType(
      col.udtName,
      false,
      col.numericPrecision,
      col.numericScale
    );
    return `  ${snakeToCamel(col.columnName)}: ${type};`;
  });

  const optionalFields = optional.map((col) => {
    const type = pgTypeToTsType(
      col.udtName,
      col.isNullable,
      col.numericPrecision,
      col.numericScale
    );
    return `  ${snakeToCamel(col.columnName)}?: ${type};`;
  });

  const allFields = [...requiredFields, ...optionalFields];

  return `export interface ${className}Create {
${allFields.join("\n")}
}`;
}

/**
 * Partition fields into required and optional for Create interface
 */
function partitionCreateFields(table: TableInfo) {
  const required = table.columns.filter(
    (col) =>
      !col.isNullable &&
      !col.isPrimaryKey &&
      !col.hasDefault &&
      !["created_at", "updated_at"].includes(col.columnName)
  );

  const optional = table.columns.filter(
    (col) =>
      col.isNullable ||
      col.isPrimaryKey ||
      col.hasDefault ||
      ["created_at", "updated_at"].includes(col.columnName)
  );

  return { required, optional };
}

/**
 * Generate the Identifier type (for queries)
 */
function generateIdentifierType(table: TableInfo, className: string): string {
  const identifiers: string[] = [];

  // Primary key(s)
  const pkColumns = table.columns.filter((c) => c.isPrimaryKey);
  if (pkColumns.length > 0) {
    const fields = pkColumns.map((col) => {
      const type = pgTypeToTsType(
        col.udtName,
        false,
        col.numericPrecision,
        col.numericScale
      );
      return `${snakeToCamel(col.columnName)}: ${type}`;
    });
    identifiers.push(`{ ${fields.join("; ")} }`);
  }

  // Unique columns
  const uniqueColumns = table.columns.filter(
    (c) => c.isUnique && !c.isPrimaryKey
  );
  for (const col of uniqueColumns) {
    const type = pgTypeToTsType(
      col.udtName,
      false,
      col.numericPrecision,
      col.numericScale
    );
    identifiers.push(`{ ${snakeToCamel(col.columnName)}: ${type} }`);
  }

  const unionType =
    identifiers.length > 0 ? identifiers.join(" | ") : "{ id: number }";

  return `export type ${className}Identifier = ${unionType};`;
}

/**
 * Generate the Filters type (non-unique, non-pk fields)
 */
function generateFiltersType(table: TableInfo, className: string): string {
  return `import type { FilterValue } from "@/db/queries/base.queries";

export type ${className}Filters = {
  [K in keyof ${className}]?: FilterValue<${className}[K]>;
};`;
}
