import fs from "node:fs";
import type { SchemaCache, TableInfo } from "../types";

/**
 * Schema cache management
 */

/**
 * Load previous schema cache from disk
 */
export function loadSchemaCache(cacheFile: string): SchemaCache | null {
  if (!fs.existsSync(cacheFile)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
  } catch (error) {
    console.warn("Failed to load schema cache, treating as first run");
    return null;
  }
}

/**
 * Build schema cache from current tables
 */
export function buildSchemaCache(tables: TableInfo[]): SchemaCache {
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
 * Save schema cache to disk
 */
export function saveSchemaCache(cacheFile: string, cache: SchemaCache): void {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf-8");
}
