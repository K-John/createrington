import "@/logger.global";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import config from "@/config";

const poolConfig = config.database.pool;
const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_ROOT = path.resolve(__dirname, "../../../../../db");
const SCHEMA_DIR = path.resolve(DB_ROOT, "schema");
const TABLES_DIR = path.resolve(DB_ROOT, "tables");
const FUNCTIONS_DIR = path.resolve(DB_ROOT, "functions");
const TYPES_DIR = path.resolve(DB_ROOT, "types");

/**
 * Execute a PostgreSQL query and return results
 */
async function query(sql: string): Promise<string> {
  const command = `psql -h ${poolConfig.host} -U ${poolConfig.user} -d ${poolConfig.database} -t -A -c "${sql.replace(/"/g, '\\"')}"`;

  try {
    const { stdout } = await execAsync(command, {
      env: {
        ...process.env,
        PGPASSWORD: poolConfig.password,
      },
    });

    return stdout.trim();
  } catch (error) {
    console.error(`Query failed: ${sql}`);
    console.error(error);
    throw error;
  }
}

/**
 * Get list of all custom types (enums) - USER DEFINED ONLY
 */
async function getCustomTypes(): Promise<string[]> {
  const result = await query(
    "SELECT t.typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typtype = 'e' AND n.nspname = 'public' ORDER BY t.typname",
  );

  if (!result) {
    return [];
  }

  return result
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Get list of all user tables
 */
async function getTables(): Promise<string[]> {
  const result = await query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
  );

  if (!result) {
    return [];
  }

  return result
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Get list of all user functions
 */
async function getFunctions(): Promise<string[]> {
  const result = await query(
    "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION' ORDER BY routine_name",
  );

  if (!result) {
    return [];
  }

  return result
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Dump a custom type (enum) definition
 */
async function dumpCustomType(
  typeName: string,
  index: number,
): Promise<string> {
  const fileName = `${String(index).padStart(2, "0")}_${typeName}.sql`;
  const outputFile = path.join(TYPES_DIR, fileName);

  try {
    const result = await query(
      `SELECT enumlabel FROM pg_enum WHERE enumtypid = '${typeName}'::regtype ORDER BY enumsortorder`,
    );

    const values = result
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => `    '${v}'`)
      .join(",\n");

    const typeDef = `CREATE TYPE public.${typeName} AS ENUM (\n${values}\n);`;

    await fs.writeFile(outputFile, typeDef + "\n", "utf-8");
  } catch (error) {
    console.error(`Failed to dump type ${typeName}`);
    throw error;
  }

  return fileName;
}

/**
 * Dump a single table to a file
 */
async function dumpTable(tableName: string, index: number): Promise<string> {
  const fileName = `${String(index).padStart(2, "0")}_${tableName}.sql`;
  const outputFile = path.join(TABLES_DIR, fileName);

  const command = `pg_dump -h ${poolConfig.host} -U ${poolConfig.user} -d ${poolConfig.database} --table=public.${tableName} --schema-only -f "${outputFile}"`;

  try {
    await execAsync(command, {
      env: {
        ...process.env,
        PGPASSWORD: poolConfig.password,
      },
    });
  } catch (error) {
    console.error(`Failed to dump table ${tableName}`);
    throw error;
  }

  return fileName;
}

/**
 * Dump a single function to a file
 */
async function dumpFunction(
  functionName: string,
  index: number,
): Promise<string> {
  const fileName = `${String(index).padStart(2, "0")}_${functionName}.sql`;
  const outputFile = path.join(FUNCTIONS_DIR, fileName);

  try {
    const functionDef = await query(
      `SELECT pg_get_functiondef(p.oid) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = '${functionName}' AND n.nspname = 'public' LIMIT 1`,
    );

    if (functionDef) {
      await fs.writeFile(outputFile, functionDef + ";\n", "utf-8");
    } else {
      console.warn(
        `   ⚠ Could not get definition for function: ${functionName}`,
      );
    }
  } catch (error) {
    console.error(`Failed to dump function ${functionName}`);
    throw error;
  }

  return fileName;
}

/**
 * Create directory if it doesn't exist
 */
async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Generate init.sql that sources all individual files
 */
async function generateInitFile(
  customTypes: string[],
  tables: string[],
  functions: string[],
): Promise<void> {
  const lines: string[] = [
    "-- Auto-generated schema initialization file",
    "-- This file sources all individual type, table and function files",
    "-- Generated at: " + new Date().toISOString(),
    "",
  ];

  // Custom types section
  if (customTypes.length > 0) {
    lines.push(
      "-- ============================================================================",
    );
    lines.push("-- CUSTOM TYPES (ENUMS)");
    lines.push(
      "-- ============================================================================",
    );
    lines.push("");

    for (let i = 0; i < customTypes.length; i++) {
      const fileName = `${String(i).padStart(2, "0")}_${customTypes[i]}.sql`;
      lines.push(`\\i types/${fileName}`);
    }
    lines.push("");
  }

  // Tables section
  lines.push(
    "-- ============================================================================",
  );
  lines.push("-- TABLES");
  lines.push(
    "-- ============================================================================",
  );
  lines.push("");

  for (let i = 0; i < tables.length; i++) {
    const fileName = `${String(i).padStart(2, "0")}_${tables[i]}.sql`;
    lines.push(`\\i tables/${fileName}`);
  }

  // Functions section
  if (functions.length > 0) {
    lines.push("");
    lines.push(
      "-- ============================================================================",
    );
    lines.push("-- FUNCTIONS");
    lines.push(
      "-- ============================================================================",
    );
    lines.push("");

    for (let i = 0; i < functions.length; i++) {
      const fileName = `${String(i).padStart(2, "0")}_${functions[i]}.sql`;
      lines.push(`\\i functions/${fileName}`);
    }
  }

  const initFile = path.join(SCHEMA_DIR, "init.sql");
  await fs.writeFile(initFile, lines.join("\n") + "\n", "utf-8");
}

/**
 * Generate init-docker.sql using full schema dump (handles dependencies)
 */
async function generateDockerInitFile(): Promise<void> {
  const dockerInitFile = path.join(SCHEMA_DIR, "init-docker.sql");

  const command = `pg_dump -h ${poolConfig.host} -U ${poolConfig.user} -d ${poolConfig.database} --schema-only --no-owner --no-acl -f "${dockerInitFile}"`;

  try {
    await execAsync(command, {
      env: {
        ...process.env,
        PGPASSWORD: poolConfig.password,
      },
    });

    console.log("   ✓ init-docker.sql (full schema dump with proper ordering)");
  } catch (error) {
    console.error("Failed to generate init-docker.sql");
    throw error;
  }
}

/**
 * Main dump function
 */
async function dumpSchema(): Promise<void> {
  try {
    console.log("🔍 Scanning database...\n");

    // Ensure directories exist
    await ensureDir(TYPES_DIR);
    await ensureDir(TABLES_DIR);
    await ensureDir(FUNCTIONS_DIR);
    await ensureDir(SCHEMA_DIR);

    // Get custom types, tables and functions
    console.log("Fetching custom types...");
    const customTypes = await getCustomTypes();

    console.log("Fetching table list...");
    const tables = await getTables();

    console.log("Fetching function list...");
    const functions = await getFunctions();

    console.log(
      `\nFound ${customTypes.length} custom types, ${tables.length} tables and ${functions.length} functions\n`,
    );

    if (tables.length === 0) {
      console.warn("No tables found! Make sure the database has tables.");
      console.log("\nConnection details:");
      console.log(`   Host: ${poolConfig.host}`);
      console.log(`   Database: ${poolConfig.database}`);
      console.log(`   User: ${poolConfig.user}`);
      process.exit(1);
    }

    // Dump custom types
    if (customTypes.length > 0) {
      console.log("Dumping custom types:");
      for (let i = 0; i < customTypes.length; i++) {
        const fileName = await dumpCustomType(customTypes[i], i);
        console.log(`   ✓ ${fileName}`);
      }
    }

    // Dump tables
    console.log("\nDumping tables:");
    for (let i = 0; i < tables.length; i++) {
      const fileName = await dumpTable(tables[i], i);
      console.log(`   ✓ ${fileName}`);
    }

    // Dump functions
    if (functions.length > 0) {
      console.log("\nDumping functions:");
      for (let i = 0; i < functions.length; i++) {
        const fileName = await dumpFunction(functions[i], i);
        console.log(`   ✓ ${fileName}`);
      }
    }

    // Generate init files
    console.log("\nGenerating initialization files...");
    await generateInitFile(customTypes, tables, functions);
    console.log("   ✓ init.sql (with \\i references)");

    await generateDockerInitFile();
    console.log("   ✓ init-docker.sql (inline for Docker)");

    console.log("\nSchema dump completed successfully!\n");
    console.log("Output structure:");
    console.log(
      `   db/types/        - ${customTypes.length} custom type files`,
    );
    console.log(`   db/tables/       - ${tables.length} table files`);
    console.log(`   db/functions/    - ${functions.length} function files`);
    console.log(`   db/schema/       - Initialization files`);

    process.exit(0);
  } catch (error) {
    console.error("\nFailed to dump schema:");
    console.error(error);
    process.exit(1);
  }
}

dumpSchema();
