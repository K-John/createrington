/**
 * Shared types for the query system generator
 */

export interface ColumnInfo {
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

export interface TableInfo {
  tableName: string;
  columns: ColumnInfo[];
}

export interface TableStructure {
  tableName: string;
  className: string;
  parentTable?: string;
  children: TableStructure[];
  depth: number;
  isNamespaceOnly: boolean;
}

export interface SchemaCache {
  version: string;
  generatedAt: string;
  tables: {
    [tableName: string]: {
      columns: ColumnInfo[];
    };
  };
}

export type SchemaChangeType =
  | "table_added"
  | "table_removed"
  | "column_added"
  | "column_removed"
  | "column_modified";

export interface SchemaChange {
  type: SchemaChangeType;
  table: string;
  column?: string;
  detail?: string;
}

export interface GenerationResult {
  files: string[];
  scaffolds: string[];
  tablesFound: number;
  changes: number;
}

export interface GenerationContext {
  projectRoot: string;
  monorepoRoot: string;
  sharedPackageRoot: string;
  sharedTypesDir: string;
  generatedDir: string;
  actualQueriesDir: string;
  cacheFile: string;
  changelogFile: string;
}
