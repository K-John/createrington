import fs from "node:fs";
import type { SchemaCache, SchemaChange } from "../types";

/**
 * Schema change detection and changelog generation
 */

/**
 * Detect schema changes between previous and current schema
 */
export function detectSchemaChanges(
  previous: SchemaCache,
  current: SchemaCache
): SchemaChange[] {
  const changes: SchemaChange[] = [];

  changes.push(...detectTableChanges(previous, current));
  changes.push(...detectColumnChanges(previous, current));

  return changes;
}

/**
 * Detect added and removed tables
 */
function detectTableChanges(
  previous: SchemaCache,
  current: SchemaCache
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
 * Detect column changes in existing tables
 */
function detectColumnChanges(
  previous: SchemaCache,
  current: SchemaCache
): SchemaChange[] {
  const changes: SchemaChange[] = [];

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
    changes.push(...detectModifiedColumns(tableName, prevColMap, currColMap));
  }

  return changes;
}

/**
 * Detect modified columns
 */
function detectModifiedColumns(
  tableName: string,
  prevColMap: Map<string, any>,
  currColMap: Map<string, any>
): SchemaChange[] {
  const changes: SchemaChange[] = [];

  for (const [columnName, currCol] of currColMap) {
    const prevCol = prevColMap.get(columnName);
    if (!prevCol) continue;

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
 * Check if a column has changed
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
 * Print changes to console with formatting
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
 * Group changes by type
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
 * Print table-level changes
 */
function printTableChanges(
  changes: SchemaChange[],
  header: string,
  symbol: string
): void {
  if (changes.length === 0) return;

  console.log(header);
  changes.forEach((c) => console.log(`   ${symbol} ${c.table}`));
  console.log();
}

/**
 * Print column-level changes
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
 * Update the CHANGELOG.md file with new changes
 */
export function updateChangelog(
  changelogFile: string,
  changes: SchemaChange[]
): void {
  if (changes.length === 0) return;

  const entry = generateChangelogEntry(changes);
  let content = loadOrCreateChangelog(changelogFile);

  content = prependEntry(content, entry);

  fs.writeFileSync(changelogFile, content, "utf-8");
}

/**
 * Load existing changelog or create header
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
 * Prepend new entry to changelog (newest first)
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
 * Generate a human-readable changelog entry
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
 * Generate changelog section for table changes
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
 * Generate changelog section for column changes
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
