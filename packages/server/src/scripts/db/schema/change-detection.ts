import fs from "node:fs";
import type { SchemaCache, SchemaChange } from "../types";

/**
 * Schema change detection and changelog generation
 *
 * This module provides comprehensive schema diff functionality, comparing cached
 * and current database states to identify all changes (tables added/removed,
 * columns added/removed/modified). It generates both console output and markdown
 * changelog entries to document schema evolution over time.
 */

/**
 * Detects all schema changes between previous and current cache states
 *
 * Performs a comprehensive comparison of two schema snapshots to identify
 * all structural changes including tables and columns. This is the main
 * entry point for change detection logic.
 *
 * @param previous - Schema cache from the last generation run
 * @param current - Schema cache from the current database state
 * @returns Array of all detected changes, ordered by type (tables first, then columns)
 *
 * @example
 * ```typescript
 * const previousCache = loadSchemaCache('./cache.json');
 * const currentCache = buildSchemaCache(currentTables);
 * const changes = detectSchemaChanges(previousCache, currentCache);
 * console.log(`Found ${changes.length} changes`);
 * ```
 */
export function detectSchemaChanges(
  previous: SchemaCache,
  current: SchemaCache,
): SchemaChange[] {
  const changes: SchemaChange[] = [];

  // Detect table-level changes (additions and removals)
  changes.push(...detectTableChanges(previous, current));

  // Detect column-level changes (additions, removals, and modifications)
  changes.push(...detectColumnChanges(previous, current));

  return changes;
}

/**
 * Detects tables that were added or removed
 *
 * Compares the set of table names between previous and current schemas
 * to identify new tables and deleted tables.
 *
 * @param previous - Previous schema cache
 * @param current - Current schema cache
 * @returns Array of table-level changes (added or removed)
 *
 * @remarks
 * - Added tables: exist in current but not in previous
 * - Removed tables: exist in previous but not in current
 */
function detectTableChanges(
  previous: SchemaCache,
  current: SchemaCache,
): SchemaChange[] {
  const changes: SchemaChange[] = [];

  // Check for new tables
  for (const tableName in current.tables) {
    if (!previous.tables[tableName]) {
      changes.push({ type: "table_added", table: tableName });
    }
  }

  // Check for removed tables
  for (const tableName in previous.tables) {
    if (!current.tables[tableName]) {
      changes.push({ type: "table_removed", table: tableName });
    }
  }

  return changes;
}

/**
 * Detects column changes within existing tables
 *
 * For each table that exists in both schemas, compares column sets to
 * identify added, removed, and modified columns. Skips tables that only
 * exist in one schema (those are handled as table-level changes).
 *
 * @param previous - Previous schema cache
 * @param current - Current schema cache
 * @returns Array of column-level changes across all tables
 *
 * @remarks
 * - Only processes tables present in both schemas
 * - Uses column name as the primary key for comparison
 * - Detects additions, removals, and modifications separately
 */
function detectColumnChanges(
  previous: SchemaCache,
  current: SchemaCache,
): SchemaChange[] {
  const changes: SchemaChange[] = [];

  for (const tableName in current.tables) {
    // Skip tables that don't exist in previous schema (handled as table_added)
    if (!previous.tables[tableName]) continue;

    const prevColumns = previous.tables[tableName].columns;
    const currColumns = current.tables[tableName].columns;

    // Create lookup maps for efficient column comparison
    const prevColMap = new Map(prevColumns.map((c) => [c.columnName, c]));
    const currColMap = new Map(currColumns.map((c) => [c.columnName, c]));

    // Detect new columns
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

    // Detect removed columns
    for (const col of prevColumns) {
      if (!currColMap.has(col.columnName)) {
        changes.push({
          type: "column_removed",
          table: tableName,
          column: col.columnName,
        });
      }
    }

    // Detect modified columns (type, nullability, constraints changed)
    changes.push(...detectModifiedColumns(tableName, prevColMap, currColMap));
  }

  return changes;
}

/**
 * Detects columns that exist in both schemas but have changed metadata
 *
 * Compares column properties (type, nullability, constraints) for columns
 * that exist in both the previous and current schema to identify modifications.
 *
 * @param tableName - Name of the table being analyzed
 * @param prevColMap - Map of column names to metadata from previous schema
 * @param currColMap - Map of column names to metadata from current schema
 * @returns Array of column modification changes for this table
 *
 * @remarks
 * - Only processes columns that exist in both schemas
 * - Tracks before → after state in the detail field
 * - Considers type, nullability, primary key, and unique constraint changes
 */
function detectModifiedColumns(
  tableName: string,
  prevColMap: Map<string, any>,
  currColMap: Map<string, any>,
): SchemaChange[] {
  const changes: SchemaChange[] = [];

  for (const [columnName, currCol] of currColMap) {
    const prevCol = prevColMap.get(columnName);
    if (!prevCol) continue; // Column only in current (handled as column_added)

    if (hasColumnChanged(prevCol, currCol)) {
      const prevType = `${prevCol.udtName}${
        prevCol.isNullable ? " | null" : ""
      }`;
      const currType = `${currCol.udtName}${
        currCol.isNullable ? " | null" : ""
      }`;

      changes.push({
        type: "column_modified",
        table: tableName,
        column: columnName,
        detail: `${prevType} → ${currType}`,
      });
    }
  }

  return changes;
}

/**
 * Determines if a column's metadata has changed between schemas
 *
 * Compares key column properties to detect any modifications that would
 * affect generated types or query behavior.
 *
 * @param prevCol - Column metadata from previous schema
 * @param currCol - Column metadata from current schema
 * @returns true if any tracked property differs, false otherwise
 *
 * @remarks
 * Tracked properties:
 * - udtName: PostgreSQL type (affects TypeScript type mapping)
 * - isNullable: Nullability (affects type union with null)
 * - isPrimaryKey: Primary key status (affects query generation)
 * - isUnique: Unique constraint (affects query generation)
 *
 * Not currently tracked:
 * - hasDefault: Default value presence
 * - numericPrecision/Scale: Numeric type constraints
 */
function hasColumnChanged(prevCol: any, currCol: any): boolean {
  return (
    prevCol.udtName !== currCol.udtName ||
    prevCol.isNullable !== currCol.isNullable ||
    prevCol.isPrimaryKey !== currCol.isPrimaryKey ||
    prevCol.isUnique !== currCol.isUnique
  );
}

/**
 * Prints formatted schema changes to console
 *
 * Displays a human-readable summary of all detected changes, grouped by
 * change type and formatted with appropriate symbols for quick visual scanning.
 *
 * @param changes - Array of all detected schema changes
 *
 * @remarks
 * Output format:
 * - Tables: grouped by added (+) and removed (-)
 * - Columns: grouped by added, removed, and modified (~)
 * - Each column change shows table context and details
 * - Prompts user to review the generated CHANGELOG.md
 *
 * @example
 * ```typescript
 * const changes = detectSchemaChanges(prev, curr);
 * printChanges(changes);
 * // Output:
 * // Schema changes detected:
 * //
 * // Tables Added:
 * //    + new_table
 * //
 * // Columns Added:
 * //    users:
 * //      + email (varchar | null)
 * ```
 */
export function printChanges(changes: SchemaChange[]): void {
  if (changes.length === 0) {
    console.log("\nNo schema changes detected\n");
    return;
  }

  console.log("\nSchema changes detected:\n");

  const grouped = groupChangesByType(changes);

  printTableChanges(grouped.added, "Tables Added:", "+");
  printTableChanges(grouped.removed, "Tables Removed:", "-");
  printColumnChanges(grouped.colAdded, "Columns Added:");
  printColumnChanges(grouped.colRemoved, "Columns Removed:");
  printColumnChanges(grouped.colModified, "Columns Modified:");

  console.log("Review changes in CHANGELOG.md\n");
}

/**
 * Groups changes by their type for organized display
 *
 * Separates the flat array of changes into categorized groups for
 * structured output formatting.
 *
 * @param changes - Array of all changes
 * @returns Object with changes grouped by type
 */
function groupChangesByType(changes: SchemaChange[]) {
  return {
    added: changes.filter((c) => c.type === "table_added"),
    removed: changes.filter((c) => c.type === "table_removed"),
    colAdded: changes.filter((c) => c.type === "column_added"),
    colRemoved: changes.filter((c) => c.type === "column_removed"),
    colModified: changes.filter((c) => c.type === "column_modified"),
  };
}

/**
 * Prints table-level changes with consistent formatting
 *
 * Displays added or removed tables with a visual symbol prefix
 * for quick identification.
 *
 * @param changes - Table-level changes to display
 * @param header - Section header text
 * @param symbol - Symbol to prefix each table name (e.g., '+' or '-')
 */
function printTableChanges(
  changes: SchemaChange[],
  header: string,
  symbol: string,
): void {
  if (changes.length === 0) return;

  console.log(header);
  changes.forEach((c) => console.log(`   ${symbol} ${c.table}`));
  console.log();
}

/**
 * Prints column-level changes grouped by table
 *
 * Displays column changes in a hierarchical format, showing which table
 * each change belongs to along with relevant details.
 *
 * @param changes - Column-level changes to display
 * @param header - Section header text
 *
 * @remarks
 * - Groups changes by table for better readability
 * - Shows column name and change details (type, nullability)
 * - Uses '~' symbol for modifications, '+' for additions
 */
function printColumnChanges(changes: SchemaChange[], header: string): void {
  if (changes.length === 0) return;

  console.log(header);
  const byTable = groupByTable(changes);

  for (const [table, cols] of Object.entries(byTable)) {
    console.log(`   ${table}:`);
    cols.forEach((c) => {
      const detail = c.detail ? ` (${c.detail})` : "";
      const symbol = c.type === "column_modified" ? "~" : "+";
      console.log(`     ${symbol} ${c.column}${detail}`);
    });
  }
  console.log();
}

/**
 * Groups changes by table name for hierarchical display
 *
 * Organizes column-level changes into a table-keyed structure to
 * support nested output formatting.
 *
 * @param changes - Array of changes to group
 * @returns Object mapping table names to their associated changes
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
 * Updates the CHANGELOG.md file with new schema changes
 *
 * Generates a formatted markdown entry for the current changes and
 * prepends it to the changelog file. Creates the changelog if it
 * doesn't exist yet.
 *
 * @param changelogFile - Path to the CHANGELOG.md file
 * @param changes - Array of changes to document
 *
 * @remarks
 * - No-op if there are no changes to document
 * - Creates changelog with header if file doesn't exist
 * - New entries are prepended (newest first) for easy review
 * - Each entry includes timestamp for tracking
 *
 * @example
 * ```typescript
 * const changes = detectSchemaChanges(prev, curr);
 * updateChangelog('./CHANGELOG.md', changes);
 * // Creates or updates CHANGELOG.md with timestamped entry
 * ```
 */
export function updateChangelog(
  changelogFile: string,
  changes: SchemaChange[],
): void {
  if (changes.length === 0) return;

  const entry = generateChangelogEntry(changes);
  let content = loadOrCreateChangelog(changelogFile);

  content = prependEntry(content, entry);

  fs.writeFileSync(changelogFile, content, "utf-8");
}

/**
 * Loads existing changelog or creates a new one with header
 *
 * Reads the changelog file if it exists, or initializes a new changelog
 * with a standard markdown header structure.
 *
 * @param changelogFile - Path to the changelog file
 * @returns Current changelog content or initialized header
 */
function loadOrCreateChangelog(changelogFile: string): string {
  if (fs.existsSync(changelogFile)) {
    return fs.readFileSync(changelogFile, "utf-8");
  }

  return `# Database Schema Changelog

All notable changes to the database schema will be documented in this file.

`;
}

/**
 * Prepends a new entry to the changelog (newest entries first)
 *
 * Inserts the new changelog entry at the appropriate position in the file,
 * maintaining chronological order with newest entries at the top.
 *
 * @param content - Current changelog content
 * @param entry - New entry to prepend
 * @returns Updated changelog content with new entry added
 *
 * @remarks
 * - Finds the first existing entry (marked by '## ') and inserts before it
 * - If no entries exist, appends to the end of the header section
 */
function prependEntry(content: string, entry: string): string {
  const lines = content.split("\n");
  const headerEndIndex = lines.findIndex((line) => line.startsWith("## "));

  if (headerEndIndex === -1) {
    return content + entry;
  }

  lines.splice(headerEndIndex, 0, entry);
  return lines.join("\n");
}

/**
 * Generates a formatted markdown changelog entry
 *
 * Creates a complete changelog section with timestamp header and
 * organized subsections for each type of change detected.
 *
 * @param changes - Array of changes to document
 * @returns Formatted markdown string ready to insert into changelog
 *
 * @remarks
 * Entry structure:
 * - Level 2 heading with date and time
 * - Level 3 headings for each change category
 * - Bullet lists with table and column details
 * - Markdown formatting for readability
 *
 * @example
 * ```markdown
 * ## 2026-01-29 14:30:00
 *
 * ### Tables Added
 * - **user_sessions**
 *
 * ### Columns Added
 * - **users**
 *   - `email`: varchar | null
 * ```
 */
function generateChangelogEntry(changes: SchemaChange[]): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });

  let entry = `## ${timestamp} ${time}\n\n`;

  const grouped = groupChangesByType(changes);

  entry += generateTableSection(grouped.added, "Tables Added");
  entry += generateTableSection(grouped.removed, "Tables Removed");
  entry += generateColumnSection(grouped.colAdded, "Columns Added");
  entry += generateColumnSection(grouped.colRemoved, "Columns Removed");
  entry += generateColumnSection(grouped.colModified, "Columns Modified");

  return entry;
}

/**
 * Generates a markdown section for table-level changes
 *
 * Creates a subsection documenting added or removed tables with
 * consistent markdown formatting.
 *
 * @param changes - Table changes for this section
 * @param title - Section title (e.g., "Tables Added")
 * @returns Formatted markdown section, or empty string if no changes
 */
function generateTableSection(changes: SchemaChange[], title: string): string {
  if (changes.length === 0) return "";

  let section = `### ${title}\n\n`;
  changes.forEach((c) => {
    section += `- **${c.table}**\n`;
  });
  section += "\n";

  return section;
}

/**
 * Generates a markdown section for column-level changes
 *
 * Creates a subsection documenting column changes, grouped by table
 * and including relevant details about each change.
 *
 * @param changes - Column changes for this section
 * @param title - Section title (e.g., "Columns Added")
 * @returns Formatted markdown section, or empty string if no changes
 *
 * @remarks
 * - Groups changes by table for clarity
 * - Includes type information and change details
 * - Uses nested bullet lists for hierarchical structure
 * - Column names formatted as inline code
 */
function generateColumnSection(changes: SchemaChange[], title: string): string {
  if (changes.length === 0) return "";

  let section = `### ${title}\n\n`;
  const byTable = groupByTable(changes);

  for (const [table, cols] of Object.entries(byTable)) {
    section += `- **${table}**\n`;
    cols.forEach((c) => {
      const detail = c.detail ? `: ${c.detail}` : "";
      section += `  - \`${c.column}\`${detail}\n`;
    });
  }
  section += "\n";

  return section;
}
