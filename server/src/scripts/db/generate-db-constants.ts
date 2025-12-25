import "@/logger.global";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import config from "@/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TableInfo {
  tableName: string;
  enumKey: string;
}

/**
 * Convert table name to enum key format
 * Examples:
 *   player -> PLAYER
 *   player_balance -> PLAYER_BALANCE
 *   discord_message -> DISCORD_MESSAGE
 */
function tableNameToEnumKey(tableName: string): string {
  return tableName.toUpperCase();
}

/**
 * Reads all table names from PostgreSQL database
 */
async function readTablesFromDatabase(): Promise<TableInfo[]> {
  const db = new pg.Pool(config.database.pool);

  try {
    const result = await db.query<{ table_name: string }>(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );

    return result.rows.map(({ table_name }) => ({
      tableName: table_name,
      enumKey: tableNameToEnumKey(table_name),
    }));
  } finally {
    await db.end();
  }
}

/**
 * Generate the DatabaseTable enum file
 */
function generateTablesFile(tables: TableInfo[]): string {
  // Sort by enum key for consistent ordering
  const sortedTables = [...tables].sort((a, b) =>
    a.enumKey.localeCompare(b.enumKey)
  );

  const enumEntries = sortedTables
    .map(({ enumKey, tableName }) => `  ${enumKey} = "${tableName}",`)
    .join("\n");

  return `/**
 * Auto-generated database table names
 *
 * DO NOT EDIT MANUALLY
 * 
 * To regenerate: npm run generate:db-tables
 * Source: PostgreSQL information_schema.tables
 * 
 * Generated: ${new Date().toISOString()}
 */

export enum DatabaseTable {
${enumEntries}
}

/**
 * Get the actual table name from a DatabaseTable enum value
 * 
 * @param table - Database table enum value
 * @returns Actual table name as a string
 */
export function getTableName(table: DatabaseTable): string {
  return table;
}

/**
 * Get all table names as an array
 * 
 * @returns Array of all table names
 */
export function getAllTableNames(): string[] {
  return Object.values(DatabaseTable);
}

/**
 * Check if a string is a valid table name
 * 
 * @param name - String to check
 * @returns True if the name matches a known table
 */
export function isValidTableName(name: string): name is DatabaseTable {
  return Object.values(DatabaseTable).includes(name as DatabaseTable);
}
`;
}

/**
 * Generate index file that exports tables
 */
function generateIndexFile(): string {
  return `/**
 * Auto-generated database constants
 *
 * DO NOT EDIT MANUALLY
 */

export * from "./tables";
`;
}

/**
 * Main generation function
 */
export async function generate() {
  const projectRoot = path.resolve(__dirname, "../../..");
  const outputDir = path.resolve(projectRoot, "src/generated/db");
  const tablesFile = path.resolve(outputDir, "tables.ts");
  const indexFile = path.resolve(outputDir, "index.ts");

  console.log("Connecting to database...");
  const tables = await readTablesFromDatabase();
  console.log(`Found ${tables.length} tables`);

  if (tables.length === 0) {
    throw new Error("No tables found in database");
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate tables enum file
  const tablesContent = generateTablesFile(tables);
  fs.writeFileSync(tablesFile, tablesContent, "utf-8");

  // Generate index file
  const indexContent = generateIndexFile();
  fs.writeFileSync(indexFile, indexContent, "utf-8");

  return {
    files: [
      path.relative(projectRoot, tablesFile),
      path.relative(projectRoot, indexFile),
    ],
    tablesFound: tables.length,
  };
}

export default generate;

if (import.meta.url === `file://${process.argv[1]}`) {
  generate()
    .then((result) => {
      console.log(`\nGenerated ${result.files.length} files`);
      console.log(`Found ${result.tablesFound} tables`);
      console.log("\nGenerated files:");
      result.files.forEach((file) => console.log(`   - ${file}`));
    })
    .catch((error) => {
      console.error("Error:", error.message);
      console.error(error);
      process.exit(1);
    });
}
