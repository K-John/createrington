import "@/logger.global";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "@/config";

// Types
import type {
  GenerationContext,
  GenerationResult,
  TableStructure,
} from "./types";

// Schema operations
import { readSchemaFromDatabase } from "./schema/introspection";
import {
  loadSchemaCache,
  buildSchemaCache,
  saveSchemaCache,
} from "./schema/cache";
import {
  detectSchemaChanges,
  printChanges,
  updateChangelog,
} from "./schema/change-detection";

// Hierarchy
import { buildTableHierarchy, collectAllStructures } from "./hierarchy/builder";

// Generators
import { generateTypes } from "./generators/types";
import { generateBaseTypes } from "./generators/base-types";
import { generateConstants } from "./generators/constants";
import { generateBaseQueries } from "./generators/base-queries";
import { generateNamespaceQueries } from "./generators/namespace-queries";
import { generateActualQueries } from "./generators/actual-queries";
import { generateDatabaseQueries } from "./generators/database-queries";
import { generateQueryHelpers } from "./generators/query-helpers";
import {
  generateBarrelExport,
  generateActualQueriesBarrel,
  generateSharedBarrelExport,
} from "./generators/barrel-exports";

// File operations
import {
  writeFile,
  writeFileIfNotExists,
  copyFile,
  getRelativePath,
} from "./utils/file-writer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Setup generation context with all paths
 */
function setupContext(): GenerationContext {
  const projectRoot = path.resolve(__dirname, "../../..");
  const monorepoRoot = path.resolve(projectRoot, "..");
  const sharedPackageRoot = path.resolve(monorepoRoot, "shared");
  const sharedTypesDir = path.resolve(sharedPackageRoot, "src/db");
  const generatedDir = path.resolve(projectRoot, "src/generated/db");
  const actualQueriesDir = path.resolve(projectRoot, "src/db/queries");
  const cacheFile = path.join(generatedDir, ".schema-cache.json");
  const changelogFile = path.join(generatedDir, "CHANGELOG.md");

  return {
    projectRoot,
    monorepoRoot,
    sharedPackageRoot,
    sharedTypesDir,
    generatedDir,
    actualQueriesDir,
    cacheFile,
    changelogFile,
  };
}

/**
 * Generate files for a single table structure
 */
function generateTableFiles(
  structure: TableStructure,
  tableMap: Map<string, any>,
  context: GenerationContext,
  generatedFiles: string[],
  scaffoldedFiles: string[],
): void {
  const { projectRoot, sharedTypesDir, generatedDir, actualQueriesDir } =
    context;
  const parts = structure.tableName.split("_");
  const actualDir = path.join(actualQueriesDir, ...parts);

  if (!structure.isNamespaceOnly) {
    // ACTUAL TABLE
    const table = tableMap.get(structure.tableName)!;

    // 1. Generate types file in SHARED package
    const typesContent = generateTypes(table);
    const typesFile = path.join(
      sharedTypesDir,
      `${structure.tableName}.types.ts`,
    );
    writeFile(typesFile, typesContent);
    generatedFiles.push(getRelativePath(projectRoot, typesFile));

    // 2. Generate base query class in SERVER
    const baseQueryContent = generateBaseQueries(table, structure);
    const baseQueryFile = path.join(
      generatedDir,
      `${structure.tableName}.queries.ts`,
    );
    writeFile(baseQueryFile, baseQueryContent);
    generatedFiles.push(getRelativePath(projectRoot, baseQueryFile));

    // 3. Scaffold actual query if doesn't exist (NEVER overwrite)
    const actualQueryFile = path.join(actualDir, "index.ts");
    const wasScaffolded = writeFileIfNotExists(
      actualQueryFile,
      generateActualQueries(structure),
    );
    if (wasScaffolded) {
      scaffoldedFiles.push(getRelativePath(projectRoot, actualQueryFile));
    }
  } else {
    // NAMESPACE - Always regenerate and copy
    const namespaceContent = generateNamespaceQueries(structure);
    const namespaceFile = path.join(
      generatedDir,
      `${structure.tableName}.queries.ts`,
    );
    writeFile(namespaceFile, namespaceContent);
    generatedFiles.push(getRelativePath(projectRoot, namespaceFile));

    // Copy to actual directory (overwrites namespace files intentionally)
    const actualNamespaceFile = path.join(actualDir, "index.ts");
    copyFile(namespaceFile, actualNamespaceFile);
  }

  // Process children recursively
  for (const child of structure.children) {
    generateTableFiles(
      child,
      tableMap,
      context,
      generatedFiles,
      scaffoldedFiles,
    );
  }
}

/**
 * Generate all database query system files
 */
export async function generate(): Promise<GenerationResult> {
  console.log("📡 Connecting to database...");

  // Setup paths
  const context = setupContext();

  // Read schema
  const tables = await readSchemaFromDatabase(config.database);
  console.log(`✅ Found ${tables.length} tables`);

  // Detect changes
  const previousSchema = loadSchemaCache(context.cacheFile);
  const currentSchema = buildSchemaCache(tables);
  const changes = previousSchema
    ? detectSchemaChanges(previousSchema, currentSchema)
    : [];

  printChanges(changes);

  if (changes.length > 0) {
    updateChangelog(context.changelogFile, changes);
  }

  // Build hierarchy
  const hierarchy = buildTableHierarchy(tables);
  console.log(`Built hierarchy with ${hierarchy.length} root nodes`);

  // Track generated files
  const generatedFiles: string[] = [];
  const scaffoldedFiles: string[] = [];
  const tableMap = new Map(tables.map((t) => [t.tableName, t]));

  // Generate table-specific files
  for (const root of hierarchy) {
    generateTableFiles(
      root,
      tableMap,
      context,
      generatedFiles,
      scaffoldedFiles,
    );
  }

  // Generate shared files
  generateSharedFiles(tables, hierarchy, context, generatedFiles);

  // Save schema cache
  saveSchemaCache(context.cacheFile, currentSchema);

  return {
    files: generatedFiles,
    scaffolds: scaffoldedFiles,
    tablesFound: tables.length,
    changes: changes.length,
  };
}

/**
 * Generate shared files (constants, helpers, barrel exports)
 */
function generateSharedFiles(
  tables: any[],
  hierarchy: TableStructure[],
  context: GenerationContext,
  generatedFiles: string[],
): void {
  const { projectRoot, sharedTypesDir, generatedDir, actualQueriesDir } =
    context;

  // Base types file for shared/db (FilterValue, FilterOperators)
  const baseTypesFile = path.join(sharedTypesDir, "base.types.ts");
  writeFile(baseTypesFile, generateBaseTypes());
  generatedFiles.push(getRelativePath(projectRoot, baseTypesFile));

  // Barrel export for shared/db (types only)
  const sharedBarrelFile = path.join(sharedTypesDir, "index.ts");
  writeFile(sharedBarrelFile, generateSharedBarrelExport(tables));
  generatedFiles.push(getRelativePath(projectRoot, sharedBarrelFile));

  // Barrel export for generated/db (server)
  const barrelFile = path.join(generatedDir, "index.ts");
  writeFile(barrelFile, generateBarrelExport(tables));
  generatedFiles.push(getRelativePath(projectRoot, barrelFile));

  // Query helpers
  const queryHelpersFile = path.join(generatedDir, "queries.ts");
  writeFile(queryHelpersFile, generateQueryHelpers(hierarchy));
  generatedFiles.push(getRelativePath(projectRoot, queryHelpersFile));

  // DatabaseQueries class
  const dbQueriesFile = path.join(generatedDir, "db.ts");
  writeFile(dbQueriesFile, generateDatabaseQueries(hierarchy));
  generatedFiles.push(getRelativePath(projectRoot, dbQueriesFile));

  // Constants
  const constantsFile = path.join(generatedDir, "constants.ts");
  writeFile(constantsFile, generateConstants(tables));
  generatedFiles.push(getRelativePath(projectRoot, constantsFile));

  // Actual queries barrel
  const actualQueriesBarrelFile = path.join(actualQueriesDir, "index.ts");
  writeFile(actualQueriesBarrelFile, generateActualQueriesBarrel(hierarchy));
  generatedFiles.push(getRelativePath(projectRoot, actualQueriesBarrelFile));
}

/**
 * CLI entry point
 */
export default generate;

if (import.meta.url === `file://${process.argv[1]}`) {
  generate()
    .then((result) => {
      console.log(`\n✅ Generated ${result.files.length} files`);
      console.log(`📝 Scaffolded ${result.scaffolds.length} new query files`);
      console.log(`📊 Total tables: ${result.tablesFound}`);

      if (result.changes > 0) {
        console.log(`🔄 Schema changes: ${result.changes}`);
      }

      if (result.scaffolds.length > 0) {
        console.log("\n📂 Scaffolded files (edit these in src/db/queries/):");
        result.scaffolds.forEach((file) => console.log(`   - ${file}`));
      }
    })
    .catch((error) => {
      console.error("❌ Error:", error.message);
      console.error(error);
      process.exit(1);
    });
}
