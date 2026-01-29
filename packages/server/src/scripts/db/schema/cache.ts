import fs from "node:fs";
import type { SchemaCache, TableInfo } from "../types";

/**
 * Schema cache management for incremental type generation
 *
 * This module handles persisting and loading database schema metadata to enable
 * efficient incremental generation. By caching the schema state, we can detect
 * changes between runs and avoid regenerating unchanged types, while providing
 * detailed changelogs of what has been modified in the database.
 */

/**
 * Loads the previous schema cache from disk
 *
 * Attempts to read and parse the cached schema metadata from a previous
 * generation run. Returns null if the cache doesn't exist or is corrupted,
 * which will trigger a full regeneration.
 *
 * @param cacheFile - Absolute path to the cache file (typically .schema-cache.json)
 * @returns Parsed SchemaCache object, or null if cache is unavailable/invalid
 *
 * @remarks
 * - Returns null on first run (no cache file exists yet)
 * - Returns null if cache is corrupted/unparseable (logs warning)
 * - Does not throw errors; gracefully falls back to full regeneration
 *
 * @example
 * ```typescript
 * const cache = loadSchemaCache('./generated/.schema-cache.json');
 * if (cache) {
 *   console.log(`Cache from ${cache.generatedAt}`);
 *   // Perform incremental generation
 * } else {
 *   console.log('No cache found, performing full generation');
 * }
 * ```
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
 * Builds a schema cache object from current database table metadata
 *
 * Creates a cache structure containing all current table and column information,
 * along with metadata like version and timestamp. This cache can be saved to
 * disk and compared against future database states to detect schema changes.
 *
 * @param tables - Array of table metadata from the current database introspection
 * @returns Complete SchemaCache object ready to be saved to disk
 *
 * @remarks
 * - Version field allows for cache format evolution over time
 * - Timestamp enables cache freshness validation
 * - All column metadata is preserved for accurate change detection
 *
 * @example
 * ```typescript
 * const currentTables = await fetchTablesFromDatabase();
 * const cache = buildSchemaCache(currentTables);
 * // cache.tables contains a map of all table metadata
 * // cache.generatedAt is the current ISO timestamp
 * ```
 */
export function buildSchemaCache(tables: TableInfo[]): SchemaCache {
  const cache: SchemaCache = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    tables: {},
  };

  // Build a lookup map of table names to their column metadata
  for (const table of tables) {
    cache.tables[table.tableName] = {
      columns: table.columns,
    };
  }

  return cache;
}

/**
 * Saves the schema cache to disk as formatted JSON
 *
 * Persists the current schema state to a JSON file for use in future
 * generation runs. The file is formatted with 2-space indentation for
 * readability and version control friendliness.
 *
 * @param cacheFile - Absolute path where the cache should be written
 * @param cache - The schema cache object to serialize and save
 *
 * @remarks
 * - Overwrites existing cache file if present
 * - Uses UTF-8 encoding for consistent cross-platform behavior
 * - Pretty-printed JSON (2-space indent) for easier diffing in version control
 * - Parent directories should already exist (ensured by file utilities)
 *
 * @example
 * ```typescript
 * const cache = buildSchemaCache(tables);
 * saveSchemaCache('./generated/.schema-cache.json', cache);
 * console.log('Schema cache saved for next run');
 * ```
 */
export function saveSchemaCache(cacheFile: string, cache: SchemaCache): void {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf-8");
}
