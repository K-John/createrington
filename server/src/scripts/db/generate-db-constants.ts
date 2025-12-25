import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TableInfo {
  tableName: string;
  enumKey: string;
  filePath: string;
}

function convert(tableName: string): string {
  return tableName.toUpperCase();
}

function extract(dir: string, tables: TableInfo[] = []): TableInfo[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      extract(fullPath, tables);
    } else if (entry.name === "queries.ts") {
      const content = fs.readFileSync(fullPath, "utf-8");
      const tableMatch = content.match(
        /protected\s+readonly\s+table\s*=\s*["']([^"']+)["']/
      );

      if (tableMatch) {
        const tableName = tableMatch[1];
        const enumKey = convert(tableName);
        tables.push({ tableName, enumKey, filePath: fullPath });
      }
    }
  }

  return tables;
}

function generateTablesFile(tables: TableInfo[]): string {
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
 * To regenerate: npm run generate
 * Source: src/db/queries/**\\/queries.ts files
 * 
 * Generated: ${new Date().toISOString()}
 */

export enum DatabaseTable {
${enumEntries}
}

export function getTableName(table: DatabaseTable): string {
  return table;
}

export function getAllTableNames(): string[] {
  return Object.values(DatabaseTable);
}
`;
}

function generateIndexFile(): string {
  return `/**
 * Auto-generated database constants
 *
 * DO NOT EDIT MANUALLY
 */

${"export"} * ${"from"} "./tables";
`;
}

/**
 * Main generation function
 * @returns Result with generated files
 */
export async function generate() {
  const projectRoot = path.resolve(__dirname, "../../..");
  const queriesDir = path.resolve(projectRoot, "src/db/queries");
  const outputDir = path.resolve(projectRoot, "src/generated/db");
  const tablesFile = path.resolve(outputDir, "tables.ts");
  const indexFile = path.resolve(outputDir, "index.ts");

  if (!fs.existsSync(queriesDir)) {
    throw new Error(`Queries directory not found: ${queriesDir}`);
  }

  const tables = extract(queriesDir);

  if (tables.length === 0) {
    throw new Error("No tables found in query files");
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(tablesFile, generateTablesFile(tables), "utf-8");
  fs.writeFileSync(indexFile, generateIndexFile(), "utf-8");

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
      console.log(`✅ Generated ${result.files.length} files`);
      console.log(`📊 Found ${result.tablesFound} tables`);
      result.files.forEach((file) => console.log(`   - ${file}`));
    })
    .catch((error) => {
      console.error("❌ Error:", error.message);
      process.exit(1);
    });
}
