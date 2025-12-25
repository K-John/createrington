import "@/logger.global";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import config from "@/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ColumnInfo {
  columnName: string;
  dataType: string;
  udtName: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  hasDefault: boolean;
  numericPrecision: number | null;
  numericScale: number | null;
}

interface TableInfo {
  tableName: string;
  columns: ColumnInfo[];
}

interface TableStructure {
  tableName: string;
  className: string;
  parentTable?: string;
  children: TableStructure[];
  depth: number;
  isNamespaceOnly: boolean;
}

interface SchemaCache {
  version: string;
  generatedAt: string;
  tables: {
    [tableName: string]: {
      columns: ColumnInfo[];
    };
  };
}

interface SchemaChange {
  type:
    | "table_added"
    | "table_removed"
    | "column_added"
    | "column_removed"
    | "column_modified";
  table: string;
  column?: string;
  detail?: string;
}

/**
 * Load previous schema cache
 */
function loadSchemaCache(cacheFile: string): SchemaCache | null {
  if (!fs.existsSync(cacheFile)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
  } catch (error) {
    logger.warn("Failed to load schema cache, treating as first run");
    return null;
  }
}

/**
 * Build schema cache from current tables
 */
function buildSchemaCache(tables: TableInfo[]): SchemaCache {
  const cache: SchemaCache = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    tables: {},
  };

  for (const table of tables) {
    cache.tables[table.tableName] = {
      columns: table.columns,
    };
  }

  return cache;
}

/**
 * Detect schema changes between previous and current schema
 */
function detectSchemaChanges(
  previous: SchemaCache,
  current: SchemaCache
): SchemaChange[] {
  const changes: SchemaChange[] = [];

  // Check for new tables
  for (const tableName in current.tables) {
    if (!previous.tables[tableName]) {
      changes.push({
        type: "table_added",
        table: tableName,
      });
    }
  }

  // Check for removed tables
  for (const tableName in previous.tables) {
    if (!current.tables[tableName]) {
      changes.push({
        type: "table_removed",
        table: tableName,
      });
    }
  }

  // Check for column changes in existing tables
  for (const tableName in current.tables) {
    if (!previous.tables[tableName]) continue;

    const prevColumns = previous.tables[tableName].columns;
    const currColumns = current.tables[tableName].columns;

    const prevColMap = new Map(prevColumns.map((c) => [c.columnName, c]));
    const currColMap = new Map(currColumns.map((c) => [c.columnName, c]));

    // New columns
    for (const col of currColumns) {
      if (!prevColMap.has(col.columnName)) {
        changes.push({
          type: "column_added",
          table: tableName,
          column: col.columnName,
          detail: `${col.udtName}${col.isNullable ? " | null" : ""}`,
        });
      }
    }

    // Removed columns
    for (const col of prevColumns) {
      if (!currColMap.has(col.columnName)) {
        changes.push({
          type: "column_removed",
          table: tableName,
          column: col.columnName,
        });
      }
    }

    // Modified columns
    for (const col of currColumns) {
      const prevCol = prevColMap.get(col.columnName);
      if (!prevCol) continue;

      if (
        prevCol.udtName !== col.udtName ||
        prevCol.isNullable !== col.isNullable ||
        prevCol.isPrimaryKey !== col.isPrimaryKey ||
        prevCol.isUnique !== col.isUnique
      ) {
        const prevType = `${prevCol.udtName}${
          prevCol.isNullable ? " | null" : ""
        }`;
        const currType = `${col.udtName}${col.isNullable ? " | null" : ""}`;

        changes.push({
          type: "column_modified",
          table: tableName,
          column: col.columnName,
          detail: `${prevType} → ${currType}`,
        });
      }
    }
  }

  return changes;
}

/**
 * Group changes by table name
 */
function groupByTable(changes: SchemaChange[]): Record<string, SchemaChange[]> {
  const grouped: Record<string, SchemaChange[]> = {};

  for (const change of changes) {
    if (!grouped[change.table]) {
      grouped[change.table] = [];
    }
    grouped[change.table].push(change);
  }

  return grouped;
}

/**
 * Generate a human-readable changelog entry
 */
function generateChangelogEntry(changes: SchemaChange[]): string {
  if (changes.length === 0) {
    return "";
  }

  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });

  let entry = `## ${timestamp} ${time}\n\n`;

  // Group changes by type
  const added = changes.filter((c) => c.type === "table_added");
  const removed = changes.filter((c) => c.type === "table_removed");
  const colAdded = changes.filter((c) => c.type === "column_added");
  const colRemoved = changes.filter((c) => c.type === "column_removed");
  const colModified = changes.filter((c) => c.type === "column_modified");

  if (added.length > 0) {
    entry += "### ✨ Tables Added\n\n";
    added.forEach((c) => {
      entry += `- **${c.table}**\n`;
    });
    entry += "\n";
  }

  if (removed.length > 0) {
    entry += "### ❌ Tables Removed\n\n";
    removed.forEach((c) => {
      entry += `- **${c.table}**\n`;
    });
    entry += "\n";
  }

  if (colAdded.length > 0) {
    entry += "### ➕ Columns Added\n\n";
    const byTable = groupByTable(colAdded);
    Object.entries(byTable).forEach(([table, cols]) => {
      entry += `- **${table}**\n`;
      cols.forEach((c) => {
        entry += `  - \`${c.column}\` (${c.detail})\n`;
      });
    });
    entry += "\n";
  }

  if (colRemoved.length > 0) {
    entry += "### ➖ Columns Removed\n\n";
    const byTable = groupByTable(colRemoved);
    Object.entries(byTable).forEach(([table, cols]) => {
      entry += `- **${table}**\n`;
      cols.forEach((c) => {
        entry += `  - \`${c.column}\`\n`;
      });
    });
    entry += "\n";
  }

  if (colModified.length > 0) {
    entry += "### 🔄 Columns Modified\n\n";
    const byTable = groupByTable(colModified);
    Object.entries(byTable).forEach(([table, cols]) => {
      entry += `- **${table}**\n`;
      cols.forEach((c) => {
        entry += `  - \`${c.column}\`: ${c.detail}\n`;
      });
    });
    entry += "\n";
  }

  return entry;
}

/**
 * Update the CHANGELOG.md file
 */
function updateChangelog(changelogFile: string, entry: string): void {
  let content = "";

  if (fs.existsSync(changelogFile)) {
    content = fs.readFileSync(changelogFile, "utf-8");
  } else {
    content = `# Database Schema Changelog

All notable changes to the database schema will be documented in this file.

`;
  }

  // Prepend new entry (newest first)
  const lines = content.split("\n");
  const headerEndIndex = lines.findIndex((line) => line.startsWith("## "));

  if (headerEndIndex === -1) {
    // No previous entries
    content += entry;
  } else {
    // Insert before first entry
    lines.splice(headerEndIndex, 0, entry);
    content = lines.join("\n");
  }

  fs.writeFileSync(changelogFile, content, "utf-8");
}

/**
 * Print changes to console with colors
 */
function printChanges(changes: SchemaChange[]): void {
  if (changes.length === 0) {
    console.log("\n✅ No schema changes detected\n");
    return;
  }

  console.log("\n⚠️  Schema changes detected:\n");

  const added = changes.filter((c) => c.type === "table_added");
  const removed = changes.filter((c) => c.type === "table_removed");
  const colAdded = changes.filter((c) => c.type === "column_added");
  const colRemoved = changes.filter((c) => c.type === "column_removed");
  const colModified = changes.filter((c) => c.type === "column_modified");

  if (added.length > 0) {
    console.log("📦 Tables Added:");
    added.forEach((c) => console.log(`   + ${c.table}`));
    console.log();
  }

  if (removed.length > 0) {
    console.log("🗑️  Tables Removed:");
    removed.forEach((c) => console.log(`   - ${c.table}`));
    console.log();
  }

  if (colAdded.length > 0) {
    console.log("➕ Columns Added:");
    const byTable = groupByTable(colAdded);
    Object.entries(byTable).forEach(([table, cols]) => {
      console.log(`   ${table}:`);
      cols.forEach((c) => console.log(`     + ${c.column} (${c.detail})`));
    });
    console.log();
  }

  if (colRemoved.length > 0) {
    console.log("➖ Columns Removed:");
    const byTable = groupByTable(colRemoved);
    Object.entries(byTable).forEach(([table, cols]) => {
      console.log(`   ${table}:`);
      cols.forEach((c) => console.log(`     - ${c.column}`));
    });
    console.log();
  }

  if (colModified.length > 0) {
    console.log("🔄 Columns Modified:");
    const byTable = groupByTable(colModified);
    Object.entries(byTable).forEach(([table, cols]) => {
      console.log(`   ${table}:`);
      cols.forEach((c) => console.log(`     ~ ${c.column}: ${c.detail}`));
    });
    console.log();
  }

  console.log("💡 Review changes in CHANGELOG.md\n");
}

/**
 * PostgreSQL type to TypeScript type mapping
 */
function pgTypeToTsType(
  udtName: string,
  isNullable: boolean,
  numericPrecision: number | null,
  numericScale: number | null
): string {
  const baseType = (() => {
    if (udtName === "numeric") {
      if (numericScale !== null && numericScale > 0) {
        return "string";
      }
      if (numericPrecision !== null && numericPrecision > 15) {
        return "string";
      }
      return "number";
    }

    switch (udtName) {
      case "int2":
      case "int4":
      case "int8":
      case "float4":
      case "float8":
        return "number";
      case "text":
      case "varchar":
      case "bpchar":
      case "uuid":
        return "string";
      case "bool":
        return "boolean";
      case "timestamp":
      case "timestamptz":
      case "date":
        return "Date";
      case "json":
      case "jsonb":
        return "Record<string, any>";
      default:
        return "any";
    }
  })();

  return isNullable ? `${baseType} | null` : baseType;
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function snakeToPascal(str: string): string {
  return str
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Reads schema from PostgreSQL database
 */
async function readSchemaFromDatabase(): Promise<TableInfo[]> {
  const db = new pg.Pool(config.database.pool);

  try {
    const tablesResult = await db.query<{ table_name: string }>(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );

    const tables: TableInfo[] = [];

    for (const { table_name } of tablesResult.rows) {
      const columnsResult = await db.query<{
        column_name: string;
        data_type: string;
        udt_name: string;
        is_nullable: string;
        column_default: string | null;
        numeric_precision: number | null;
        numeric_scale: number | null;
      }>(
        `SELECT 
          column_name,
          data_type,
          udt_name,
          is_nullable,
          column_default,
          numeric_precision,
          numeric_scale
         FROM information_schema.columns
         WHERE table_schema = 'public'
         AND table_name = $1
         ORDER BY ordinal_position`,
        [table_name]
      );

      // Get primary keys
      const pkResult = await db.query<{ column_name: string }>(
        `SELECT a.attname as column_name
         FROM pg_index i
         JOIN pg_attribute a ON a.attrelid = i.indrelid
         AND a.attnum = ANY(i.indkey)
         WHERE i.indrelid = $1::regclass
         AND i.indisprimary`,
        [table_name]
      );

      // Get unique constraints
      const uniqueResult = await db.query<{ column_name: string }>(
        `SELECT a.attname as column_name
         FROM pg_index i
         JOIN pg_attribute a ON a.attrelid = i.indrelid
         AND a.attnum = ANY(i.indkey)
         WHERE i.indrelid = $1::regclass
         AND i.indisunique
         AND NOT i.indisprimary`,
        [table_name]
      );

      const primaryKeys = new Set(pkResult.rows.map((r) => r.column_name));
      const uniqueKeys = new Set(uniqueResult.rows.map((r) => r.column_name));

      const columns: ColumnInfo[] = columnsResult.rows.map((col) => ({
        columnName: col.column_name,
        dataType: col.data_type,
        udtName: col.udt_name,
        isNullable: col.is_nullable === "YES",
        isPrimaryKey: primaryKeys.has(col.column_name),
        isUnique: uniqueKeys.has(col.column_name),
        hasDefault: col.column_default !== null,
        numericPrecision: col.numeric_precision,
        numericScale: col.numeric_scale,
      }));

      tables.push({
        tableName: table_name,
        columns,
      });
    }

    return tables;
  } finally {
    await db.end();
  }
}

/**
 * Build hierarchical structure from table names - with DEEP nesting support
 */
function buildTableHierarchy(tables: TableInfo[]): TableStructure[] {
  const tableMap = new Map<string, TableStructure>();
  const roots: TableStructure[] = [];

  // First pass: create all actual tables
  for (const table of tables) {
    const structure: TableStructure = {
      tableName: table.tableName,
      className: snakeToPascal(table.tableName),
      children: [],
      depth: 0,
      isNamespaceOnly: false,
    };
    tableMap.set(table.tableName, structure);
  }

  // Second pass: build DEEP hierarchy
  for (const table of tables) {
    const parts = table.tableName.split("_");

    if (parts.length === 1) {
      // Root level table
      roots.push(tableMap.get(table.tableName)!);
    } else {
      // Build the full parent chain
      let currentParentName = "";
      let currentParent: TableStructure | null = null;

      // Create/find all intermediate parents
      for (let i = 0; i < parts.length - 1; i++) {
        currentParentName = currentParentName
          ? `${currentParentName}_${parts[i]}`
          : parts[i];

        // Check if this level exists as an actual table
        if (tableMap.has(currentParentName)) {
          currentParent = tableMap.get(currentParentName)!;
        } else {
          // Create namespace parent if it doesn't exist
          if (!tableMap.has(currentParentName)) {
            const namespaceParent: TableStructure = {
              tableName: currentParentName,
              className: snakeToPascal(currentParentName),
              children: [],
              depth: i,
              isNamespaceOnly: true,
            };
            tableMap.set(currentParentName, namespaceParent);

            // Add to parent or roots
            if (currentParent) {
              // Check if already a child to avoid duplicates
              if (
                !currentParent.children.find(
                  (c) => c.tableName === currentParentName
                )
              ) {
                currentParent.children.push(namespaceParent);
              }
            } else {
              roots.push(namespaceParent);
            }
          }
          currentParent = tableMap.get(currentParentName)!;
        }
      }

      // Add actual table to its immediate parent
      const actualTable = tableMap.get(table.tableName)!;
      actualTable.parentTable = currentParentName;
      actualTable.depth = parts.length - 1;

      if (currentParent) {
        // Check if already a child to avoid duplicates
        if (
          !currentParent.children.find((c) => c.tableName === table.tableName)
        ) {
          currentParent.children.push(actualTable);
        }
      }
    }
  }

  return roots;
}

/**
 * Generate unified DatabaseQueries class
 * Single class containing all query instances with transaction support
 */
function generateDatabaseQueriesClass(hierarchy: TableStructure[]): string {
  const rootTables = hierarchy.filter((t) => t.depth === 0);

  // Import all root query classes
  const imports = rootTables
    .map((t) => {
      const parts = t.tableName.split("_");
      return `import { ${t.className}Queries } from "@/db/queries/${parts.join(
        "/"
      )}";`;
    })
    .join("\n");

  // Generate lazy-loaded getters for each root table
  const getters = rootTables
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

  return `import type { Pool, PoolClient } from "pg";
import logger from "@/logger";
${imports}

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
${getters}

  /**
   * Execute a callback within a database transaction
   * Creates a new DatabaseQueries instance using a transaction client
   * All queries within the callback will be part of the same transaction
   * 
   * @param callback - Function to execute with transaction-enabled queries
   * @returns Result from callback
   * 
   * @example
   * await db.inTransaction(async (tx) => {
   *   const player = await tx.player.createAndReturn({ ... });
   *   await tx.player.balance.create({ playerId: player.id, ... });
   *   await tx.admin.log.action.create({ ... });
   * });
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
   * Useful for debugging or conditional logic
   * 
   * @returns true if using a transaction client, false if using pool
   */
  isInTransaction(): boolean {
    return "processID" in this.db;
  }

  /**
   * Get the underlying database pool or client
   * Use with caution - prefer using the query methods instead
   * 
   * @returns The Pool or PoolClient instance
   */
  getDb(): Pool | PoolClient {
    return this.db;
  }
}
`;
}

/**
 * Generate database constants file with table and field names
 * Includes BOTH snake_case (DB) and camelCase (App) field names
 */
function generateDatabaseConstants(tables: TableInfo[]): string {
  const tableConstants = tables
    .map((table) => {
      const constName = table.tableName.toUpperCase().replace(/_/g, "_");

      // Snake_case fields (for database queries)
      const snakeFields = table.columns
        .map((col) => {
          const fieldConstName = col.columnName.toUpperCase();
          return `      ${fieldConstName}: "${col.columnName}" as const,`;
        })
        .join("\n");

      // CamelCase fields (for app logic)
      const camelFields = table.columns
        .map((col) => {
          const fieldConstName = col.columnName.toUpperCase();
          const camelCaseName = snakeToCamel(col.columnName);
          return `      ${fieldConstName}: "${camelCaseName}" as const,`;
        })
        .join("\n");

      return `  ${constName}: {
    TABLE: "${table.tableName}" as const,
    FIELDS: {
${snakeFields}
    },
    CAMEL_FIELDS: {
${camelFields}
    },
  },`;
    })
    .join("\n");

  return `/**
 * Auto-generated database constants
 * Provides type-safe access to table and field names
 * 
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 * Generated: ${new Date().toISOString()}
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
 * 
 * @example
 * // Use in database queries
 * await tx.admin.log.action.create({
 *   tableName: DatabaseTable.PLAYER.TABLE,
 *   fieldName: DatabaseTable.PLAYER.FIELDS.MINECRAFT_USERNAME
 * });
 * 
 * @example
 * // Use for object property access
 * const fieldName = DatabaseTable.PLAYER.CAMEL_FIELDS.MINECRAFT_USERNAME;
 * const value = player[fieldName]; // player.minecraftUsername
 */
export const DatabaseTable = {
${tableConstants}
} as const;

/**
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
export type CamelFieldName<T extends keyof typeof DatabaseTable> = typeof DatabaseTable[T]["CAMEL_FIELDS"][keyof typeof DatabaseTable[T]["CAMEL_FIELDS"]];

/**
 * Get all table names as an array
 * 
 * @returns Array of all table names
 */
export function getAllTableNames(): TableName[] {
  return Object.values(DatabaseTable).map((t) => t.TABLE);
}

/**
 * Check if a string is a valid table name
 * 
 * @param name - String to check
 * @returns True if the name matches a known table
 */
export function isValidTableName(name: string): name is TableName {
  return getAllTableNames().includes(name as TableName);
}

/**
 * Get the table constant object by table name
 * 
 * @param tableName - Table name to look up
 * @returns Table constant object or undefined
 */
export function getTableByName(tableName: string): typeof DatabaseTable[keyof typeof DatabaseTable] | undefined {
  return Object.values(DatabaseTable).find((t) => t.TABLE === tableName);
}

/**
 * Convert a snake_case field name to camelCase
 * 
 * @param snakeCase - Snake case string
 * @returns Camel case string
 */
export function snakeToCamel(snakeCase: string): string {
  return snakeCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert a camelCase field name to snake_case
 * 
 * @param camelCase - Camel case string
 * @returns Snake case string
 */
export function camelToSnake(camelCase: string): string {
  return camelCase.replace(/[A-Z]/g, (letter) => \`_\${letter.toLowerCase()}\`);
}
`;
}

/**
 * Generate identifier types based on primary keys and unique columns
 */
function generateIdentifierType(table: TableInfo): string {
  const identifiers: string[] = [];

  // Primary key(s)
  const pkColumns = table.columns.filter((c) => c.isPrimaryKey);
  if (pkColumns.length > 0) {
    const fields = pkColumns
      .map((col) => {
        const type = pgTypeToTsType(
          col.udtName,
          false,
          col.numericPrecision,
          col.numericScale
        );
        return `${snakeToCamel(col.columnName)}: ${type}`;
      })
      .join("; ");
    identifiers.push(`{ ${fields} }`);
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

  return identifiers.length > 0 ? identifiers.join(" | ") : "{ id: number }";
}

/**
 * Generate filter types (non-unique, non-pk fields)
 */
function generateFilterType(table: TableInfo): string {
  const filterFields = table.columns
    .filter((c) => !c.isPrimaryKey && !c.isUnique)
    .map((col) => {
      const type = pgTypeToTsType(
        col.udtName,
        col.isNullable,
        col.numericPrecision,
        col.numericScale
      );
      return `  ${snakeToCamel(col.columnName)}: ${type};`;
    });

  return filterFields.length > 0 ? `{\n${filterFields.join("\n")}\n}` : "{}";
}

/**
 * Generate types file (includes Row, Entity, Create, Identifier, Filters)
 */
function generateTypes(table: TableInfo): string {
  const className = snakeToPascal(table.tableName);

  const rowInterface = `export interface ${className}Row {
${table.columns
  .map((col) => {
    const type = pgTypeToTsType(
      col.udtName,
      col.isNullable,
      col.numericPrecision,
      col.numericScale
    );
    let comment = "";
    if (col.udtName === "numeric" && col.numericPrecision && col.numericScale) {
      comment = ` // numeric(${col.numericPrecision}, ${col.numericScale})`;
    }
    return `  ${col.columnName}: ${type};${comment}`;
  })
  .join("\n")}
}`;

  const entityType = `export type ${className} = CamelCaseKeys<${className}Row>;`;

  // Determine which fields are required vs optional in Create
  const requiredFields = table.columns.filter(
    (col) =>
      !col.isNullable &&
      !col.isPrimaryKey &&
      !col.hasDefault &&
      !["created_at", "updated_at"].includes(col.columnName)
  );

  const optionalFields = table.columns.filter(
    (col) =>
      col.isNullable ||
      col.isPrimaryKey ||
      col.hasDefault ||
      ["created_at", "updated_at"].includes(col.columnName)
  );

  const createInterface = `export interface ${className}Create {
${
  requiredFields.length > 0
    ? requiredFields
        .map((col) => {
          const type = pgTypeToTsType(
            col.udtName,
            false,
            col.numericPrecision,
            col.numericScale
          );
          return `  ${snakeToCamel(col.columnName)}: ${type};`;
        })
        .join("\n")
    : ""
}${requiredFields.length > 0 && optionalFields.length > 0 ? "\n" : ""}${
    optionalFields.length > 0
      ? optionalFields
          .map((col) => {
            const type = pgTypeToTsType(
              col.udtName,
              col.isNullable,
              col.numericPrecision,
              col.numericScale
            );
            return `  ${snakeToCamel(col.columnName)}?: ${type};`;
          })
          .join("\n")
      : ""
  }
}`;

  const identifierType = generateIdentifierType(table);
  const filterType = generateFilterType(table);

  return `import { CamelCaseKeys } from "@/types";

/**
 * Database representation of ${table.tableName} table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
${rowInterface}

/**
 * Application representation (camelCase)
 */
${entityType}

/**
 * Data required to create a new ${table.tableName} record
 */
${createInterface}

/**
 * Valid identifiers for querying ${table.tableName}
 */
export type ${className}Identifier = ${identifierType};

/**
 * Filterable fields for ${table.tableName}
 */
export type ${className}Filters = ${filterType};
`;
}

/**
 * Generate query initialization helpers
 * Creates Q object and createQueries function automatically
 */
function generateQueryHelpers(hierarchy: TableStructure[]): string {
  const rootTables = hierarchy.filter((t) => t.depth === 0);

  // Import from actual queries directory (not generated)
  const imports = rootTables
    .map((t) => {
      const parts = t.tableName.split("_");
      return `import { ${t.className}Queries } from "@/db/queries/${parts.join(
        "/"
      )}";`;
    })
    .join("\n");

  // Q object properties
  const qProperties = rootTables
    .map((t) => {
      const propName = snakeToCamel(t.tableName);
      return `  ${propName}: new ${t.className}Queries(db),`;
    })
    .join("\n");

  // createQueries properties
  const createQueriesProperties = rootTables
    .map((t) => {
      const propName = snakeToCamel(t.tableName);
      return `    ${propName}: new ${t.className}Queries(client),`;
    })
    .join("\n");

  // Type definitions
  const qTypeProperties = rootTables
    .map((t) => {
      const propName = snakeToCamel(t.tableName);
      return `  ${propName}: ${t.className}Queries;`;
    })
    .join("\n");

  // Individual export names (for the helper snippet)
  const individualExportNames = rootTables
    .map((t) => snakeToCamel(t.tableName))
    .join(", ");

  return `import type { Pool, PoolClient } from "pg";
${imports}

/**
 * Query singleton instances type
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface QueryInstances {
${qTypeProperties}
}

/**
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
${qProperties}
  };
}

/**
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
${createQueriesProperties}
  };
}

/**
 * Helper to extract individual query instances from Q object
 * 
 * Copy this to your db/index.ts file:
 * 
 * export const { ${individualExportNames} } = Q;
 */
export type IndividualQueryExports = QueryInstances;
`;
}

/**
 * Generate a barrel export file for all types, base queries, and actual queries
 * This is your ONE-STOP-SHOP for all database-related imports
 */
function generateBarrelExport(tables: TableInfo[]): string {
  const typeAndBaseExports = tables
    .map((table) => {
      const className = snakeToPascal(table.tableName);
      return `export * from "./${table.tableName}.types";
export { ${className}BaseQueries } from "./${table.tableName}.queries";`;
    })
    .join("\n");

  // Add actual query exports (from /db/queries)
  const actualQueryExports = tables
    .map((table) => {
      const className = snakeToPascal(table.tableName);
      const parts = table.tableName.split("_");
      return `export { ${className}Queries } from "@/db/queries/${parts.join(
        "/"
      )}";`;
    })
    .join("\n");

  return `/**
 * Barrel export for all generated database types and queries
 * 
 * ONE-STOP-SHOP: Import everything you need from here!
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 * 
 * @example
 * // Import types
 * import type { Player, PlayerCreate, Admin } from "@/generated/db";
 * 
 * @example
 * // Import database singleton
 * import { DatabaseQueries } from "@/generated/db";
 * 
 * @example
 * // Import constants
 * import { DatabaseTable } from "@/generated/db";
 */

// ============================================================================
// TYPE EXPORTS (Row, Entity, Create, Identifier, Filters)
// ============================================================================

${typeAndBaseExports}

// ============================================================================
// QUERY CLASSES
// ============================================================================

${actualQueryExports}

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
 * Generate BASE query class with deep hierarchy support
 */
function generateBaseQueryClass(
  table: TableInfo,
  structure: TableStructure
): string {
  const className = structure.className;

  // Collect ALL children (both actual tables and namespaces)
  const allChildren = structure.children;

  // Type imports for circular dependency prevention
  const childTypeImports = allChildren
    .map((child) => {
      const childParts = child.tableName.split("_");
      return `import type { ${
        child.className
      }Queries } from "@/db/queries/${childParts.join("/")}";`;
    })
    .join("\n");

  // Actual imports for runtime
  const childImports = allChildren
    .map((child) => {
      const childParts = child.tableName.split("_");
      return `import { ${child.className}Queries as ${
        child.className
      }QueriesImpl } from "@/db/queries/${childParts.join("/")}";`;
    })
    .join("\n");

  // Generate getters for ALL children (tables AND namespaces)
  const childProperties = allChildren
    .map((child) => {
      // For children, get the last part after the parent's name
      const propName = child.tableName
        .replace(structure.tableName + "_", "")
        .split("_")[0]; // Just the next level

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

  return `import { Pool, PoolClient } from "pg";
import { BaseQueries } from "@/db/queries/base.queries";
import {
  ${className},
  ${className}Create,
  ${className}Row,
  ${className}Identifier,
  ${className}Filters,
} from "@/generated/db/${structure.tableName}.types";
${childTypeImports ? childTypeImports + "\n" : ""}${
    childImports ? childImports + "\n" : ""
  }

/**
 * Auto-generated base queries for ${table.tableName} table
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
  protected readonly table = "${table.tableName}";

  constructor(db: Pool | PoolClient) {
    super(db);
  }

  // Child query singletons (shared across all instances using this pool)
${childProperties}
}
`;
}

/**
 * Generate actual query class (extends Base) - only if doesn't exist
 */
function generateActualQueryClass(
  table: TableInfo,
  structure: TableStructure
): string {
  const className = structure.className;

  return `import { Pool, PoolClient } from "pg";
import { ${className}BaseQueries } from "@/generated/db";

/**
 * Custom queries for ${table.tableName} table
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

/**
 * Generate namespace query class with deep hierarchy support
 */
function generateNamespaceQuery(structure: TableStructure): string {
  const className = structure.className;

  const childImports = structure.children
    .map((child) => {
      const childParts = child.tableName.split("_");
      return `import { ${
        child.className
      }Queries } from "@/db/queries/${childParts.join("/")}";`;
    })
    .join("\n");

  // Generate getters for all children using the same singleton pattern
  const childProperties = structure.children
    .map((child) => {
      // Get the property name - just the next segment after current namespace
      const propName = child.tableName
        .replace(structure.tableName + "_", "")
        .split("_")[0];

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

  return `import { Pool, PoolClient } from "pg";
${childImports}

/**
 * Namespace queries for ${structure.tableName}
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
    const fullKey = \`${structure.tableName}.\${key}\`;

    if (!cache.has(fullKey)) {
      cache.set(fullKey, new QueryClass(this.db));
    }

    return cache.get(fullKey) as T;
  }

  constructor(protected db: Pool | PoolClient) {}${childProperties}
}
`;
}

/**
 * Main generation function
 */
export async function generate() {
  const projectRoot = path.resolve(__dirname, "../../..");
  const generatedDir = path.resolve(projectRoot, "src/generated/db");
  const actualQueriesDir = path.resolve(projectRoot, "src/db/queries");

  const cacheFile = path.join(generatedDir, ".schema-cache.json");
  const changelogFile = path.join(generatedDir, "CHANGELOG.md");

  console.log("📡 Connecting to database...");
  const tables = await readSchemaFromDatabase();
  console.log(`✅ Found ${tables.length} tables`);

  const previousSchema = loadSchemaCache(cacheFile);
  const currentSchema = buildSchemaCache(tables);

  let changes: SchemaChange[] = [];
  if (previousSchema) {
    changes = detectSchemaChanges(previousSchema, currentSchema);
  }

  printChanges(changes);

  if (changes.length > 0) {
    const changelogEntry = generateChangelogEntry(changes);
    updateChangelog(changelogFile, changelogEntry);
  }

  const hierarchy = buildTableHierarchy(tables);
  console.log(`Built hierarchy with ${hierarchy.length} root nodes`);

  // Ensure generated directory exists
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  const generatedFiles: string[] = [];
  const scaffoldedFiles: string[] = [];
  const tableMap = new Map(tables.map((t) => [t.tableName, t]));

  /**
   * Process structure recursively
   */
  function processStructure(structure: TableStructure) {
    const parts = structure.tableName.split("_");
    const actualDir = path.join(actualQueriesDir, ...parts);

    if (!structure.isNamespaceOnly) {
      // ACTUAL TABLE - same as before
      const table = tableMap.get(structure.tableName)!;

      // 1. Generate types file
      const typesContent = generateTypes(table);
      const typesFile = path.join(
        generatedDir,
        `${structure.tableName}.types.ts`
      );
      fs.writeFileSync(typesFile, typesContent, "utf-8");
      generatedFiles.push(path.relative(projectRoot, typesFile));

      // 2. Generate base query class
      const baseQueryContent = generateBaseQueryClass(table, structure);
      const baseQueryFile = path.join(
        generatedDir,
        `${structure.tableName}.queries.ts`
      );
      fs.writeFileSync(baseQueryFile, baseQueryContent, "utf-8");
      generatedFiles.push(path.relative(projectRoot, baseQueryFile));

      // 3. Scaffold actual query if doesn't exist (NEVER overwrite)
      if (!fs.existsSync(actualDir)) {
        fs.mkdirSync(actualDir, { recursive: true });
      }

      const actualQueryFile = path.join(actualDir, "index.ts");
      if (!fs.existsSync(actualQueryFile)) {
        const actualQueryContent = generateActualQueryClass(table, structure);
        fs.writeFileSync(actualQueryFile, actualQueryContent, "utf-8");
        scaffoldedFiles.push(path.relative(projectRoot, actualQueryFile));
      }
    } else {
      // NAMESPACE - ALWAYS regenerate and copy

      // 1. Generate namespace query in /generated
      const namespaceContent = generateNamespaceQuery(structure);
      const namespaceFile = path.join(
        generatedDir,
        `${structure.tableName}.queries.ts`
      );
      fs.writeFileSync(namespaceFile, namespaceContent, "utf-8");
      generatedFiles.push(path.relative(projectRoot, namespaceFile));

      // 2. ALWAYS copy to actual (this is the key change!)
      if (!fs.existsSync(actualDir)) {
        fs.mkdirSync(actualDir, { recursive: true });
      }

      const actualNamespaceFile = path.join(actualDir, "index.ts");
      const wasNew = !fs.existsSync(actualNamespaceFile);

      // Copy even if it exists - namespaces should always match generated
      fs.copyFileSync(namespaceFile, actualNamespaceFile);

      if (wasNew) {
        scaffoldedFiles.push(path.relative(projectRoot, actualNamespaceFile));
      }
      // Note: We intentionally don't track overwrites to avoid noisy output
    }

    // Process children recursively
    for (const child of structure.children) {
      processStructure(child);
    }
  }

  hierarchy.forEach((root) => processStructure(root));

  const barrelContent = generateBarrelExport(tables);
  const barrelFile = path.join(generatedDir, "index.ts");
  fs.writeFileSync(barrelFile, barrelContent, "utf-8");
  generatedFiles.push(path.relative(projectRoot, barrelFile));

  const queryHelpersContent = generateQueryHelpers(hierarchy);
  const queryHelpersFile = path.join(generatedDir, "queries.ts");
  fs.writeFileSync(queryHelpersFile, queryHelpersContent, "utf-8");
  generatedFiles.push(path.relative(projectRoot, queryHelpersFile));

  const dbQueriesContent = generateDatabaseQueriesClass(hierarchy);
  const dbQueriesFile = path.join(generatedDir, "db.ts");
  fs.writeFileSync(dbQueriesFile, dbQueriesContent, "utf-8");
  generatedFiles.push(path.relative(projectRoot, dbQueriesFile));

  const constantsContent = generateDatabaseConstants(tables);
  const constantsFile = path.join(generatedDir, "constants.ts");
  fs.writeFileSync(constantsFile, constantsContent, "utf-8");
  generatedFiles.push(path.relative(projectRoot, constantsFile));

  fs.writeFileSync(cacheFile, JSON.stringify(currentSchema, null, 2), "utf-8");

  return {
    files: generatedFiles,
    scaffolds: scaffoldedFiles,
    tablesFound: tables.length,
    changes: changes.length,
  };
}

export default generate;

if (import.meta.url === `file://${process.argv[1]}`) {
  generate()
    .then((result) => {
      console.log(`\nGenerated ${result.files.length} files`);
      console.log(`Scaffolded ${result.scaffolds.length} new query files`);
      console.log(`Total tables: ${result.tablesFound}`);

      if (result.changes > 0) {
        console.log(`Schema changes: ${result.changes}`);
      }

      if (result.scaffolds.length > 0) {
        console.log("\nScaffolded files (edit these in src/db/queries/):");
        result.scaffolds.forEach((file) => console.log(`   - ${file}`));
      }
    })
    .catch((error) => {
      console.error("Error:", error.message);
      console.error(error);
      process.exit(1);
    });
}
