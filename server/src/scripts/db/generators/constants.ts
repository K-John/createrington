import type { TableInfo } from "../types";
import { snakeToCamel } from "../utils/naming";

/**
 * Generate database constants file with table and field names
 */
export function generateConstants(tables: TableInfo[]): string {
  const timestamp = new Date().toISOString();
  const tableConstants = tables.map(generateTableConstant).join("\n");

  return `/**
 * Auto-generated database constants
 * Provides type-safe access to table and field names
 * 
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 * Generated: ${timestamp}
 * 
 * @example
 * // Access table names
 * DatabaseTable.PLAYER.TABLE // "player"
 * 
 * @example
 * // Access field names (snake_case for database)
 * DatabaseTable.PLAYER.FIELDS.MINECRAFT_USERNAME // "minecraft_username"
 * 
 * @example
 * // Access field names (camelCase for app logic)
 * DatabaseTable.PLAYER.CAMEL_FIELDS.MINECRAFT_USERNAME // "minecraftUsername"
 */
export const DatabaseTable = {
${tableConstants}
} as const;

${generateHelperTypes()}

${generateHelperFunctions()}
`;
}

/**
 * Generate constant object for a single table
 */
function generateTableConstant(table: TableInfo): string {
  const constName = table.tableName.toUpperCase().replace(/_/g, "_");
  const snakeFields = generateFieldConstants(table, false);
  const camelFields = generateFieldConstants(table, true);

  return `  ${constName}: {
    TABLE: "${table.tableName}" as const,
    FIELDS: {
${snakeFields}
    },
    CAMEL_FIELDS: {
${camelFields}
    },
  },`;
}

/**
 * Generate field constants (snake_case or camelCase)
 */
function generateFieldConstants(
  table: TableInfo,
  useCamelCase: boolean
): string {
  return table.columns
    .map((col) => {
      const fieldConstName = col.columnName.toUpperCase();
      const value = useCamelCase
        ? snakeToCamel(col.columnName)
        : col.columnName;
      return `      ${fieldConstName}: "${value}" as const,`;
    })
    .join("\n");
}

/**
 * Generate helper types
 */
function generateHelperTypes(): string {
  return `/**
 * Type-safe table name type
 */
export type TableName = typeof DatabaseTable[keyof typeof DatabaseTable]["TABLE"];

/**
 * Type-safe snake_case field names for a given table
 */
export type FieldName<T extends keyof typeof DatabaseTable> = typeof DatabaseTable[T]["FIELDS"][keyof typeof DatabaseTable[T]["FIELDS"]];

/**
 * Type-safe camelCase field names for a given table
 */
export type CamelFieldName<T extends keyof typeof DatabaseTable> = typeof DatabaseTable[T]["CAMEL_FIELDS"][keyof typeof DatabaseTable[T]["CAMEL_FIELDS"]];`;
}

/**
 * Generate helper functions
 */
function generateHelperFunctions(): string {
  return `/**
 * Get all table names as an array
 */
export function getAllTableNames(): TableName[] {
  return Object.values(DatabaseTable).map((t) => t.TABLE);
}

/**
 * Check if a string is a valid table name
 */
export function isValidTableName(name: string): name is TableName {
  return getAllTableNames().includes(name as TableName);
}

/**
 * Get the table constant object by table name
 */
export function getTableByName(tableName: string): typeof DatabaseTable[keyof typeof DatabaseTable] | undefined {
  return Object.values(DatabaseTable).find((t) => t.TABLE === tableName);
}

/**
 * Convert a snake_case field name to camelCase
 */
export function snakeToCamel(snakeCase: string): string {
  return snakeCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert a camelCase field name to snake_case
 */
export function camelToSnake(camelCase: string): string {
  return camelCase.replace(/[A-Z]/g, (letter) => \`_\${letter.toLowerCase()}\`);
}`;
}
