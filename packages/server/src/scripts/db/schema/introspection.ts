import pg from "pg";
import type { TableInfo, ColumnInfo } from "../types";

/**
 * Database schema introspection
 */

interface DatabaseConfig {
  pool: pg.PoolConfig;
}

/**
 * Read complete schema from PostgreSQL database
 */
export async function readSchemaFromDatabase(
  config: DatabaseConfig
): Promise<TableInfo[]> {
  const db = new pg.Pool(config.pool);

  try {
    const tableNames = await getTableNames(db);
    const tables: TableInfo[] = [];

    for (const tableName of tableNames) {
      const columns = await getTableColumns(db, tableName);
      const primaryKeys = await getPrimaryKeys(db, tableName);
      const uniqueKeys = await getUniqueKeys(db, tableName);

      tables.push({
        tableName,
        columns: buildColumnInfo(columns, primaryKeys, uniqueKeys),
      });
    }

    return tables;
  } finally {
    await db.end();
  }
}

/**
 * Get all table names from public schema
 */
async function getTableNames(db: pg.Pool): Promise<string[]> {
  const result = await db.query<{ table_name: string }>(
    `SELECT table_name 
     FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_type = 'BASE TABLE'
     ORDER BY table_name`
  );

  return result.rows.map((row) => row.table_name);
}

interface ColumnRow {
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
  column_default: string | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
}

/**
 * Get column information for a table
 */
async function getTableColumns(
  db: pg.Pool,
  tableName: string
): Promise<ColumnRow[]> {
  const result = await db.query<ColumnRow>(
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
    [tableName]
  );

  return result.rows;
}

/**
 * Get primary key columns for a table
 */
async function getPrimaryKeys(
  db: pg.Pool,
  tableName: string
): Promise<Set<string>> {
  const result = await db.query<{ column_name: string }>(
    `SELECT a.attname as column_name
     FROM pg_index i
     JOIN pg_attribute a ON a.attrelid = i.indrelid
     AND a.attnum = ANY(i.indkey)
     WHERE i.indrelid = $1::regclass
     AND i.indisprimary`,
    [tableName]
  );

  return new Set(result.rows.map((r) => r.column_name));
}

/**
 * Get unique constraint columns for a table (excluding primary keys)
 */
async function getUniqueKeys(
  db: pg.Pool,
  tableName: string
): Promise<Set<string>> {
  const result = await db.query<{ column_name: string }>(
    `SELECT a.attname as column_name
     FROM pg_index i
     JOIN pg_attribute a ON a.attrelid = i.indrelid
     AND a.attnum = ANY(i.indkey)
     WHERE i.indrelid = $1::regclass
     AND i.indisunique
     AND NOT i.indisprimary`,
    [tableName]
  );

  return new Set(result.rows.map((r) => r.column_name));
}

/**
 * Build ColumnInfo objects from database rows
 */
function buildColumnInfo(
  columns: ColumnRow[],
  primaryKeys: Set<string>,
  uniqueKeys: Set<string>
): ColumnInfo[] {
  return columns.map((col) => ({
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
}
