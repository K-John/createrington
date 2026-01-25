import type { TableInfo, TableStructure } from "../types";
import { snakeToPascal } from "../utils/naming";

/**
 * Table hierarchy builder for nested query structure
 */

/**
 * Build hierarchical structure from table names with deep nesting support
 */
export function buildTableHierarchy(tables: TableInfo[]): TableStructure[] {
  const tableMap = new Map<string, TableStructure>();
  const roots: TableStructure[] = [];

  // First pass: create all actual tables
  createTableStructures(tables, tableMap);

  // Second pass: build deep hierarchy
  buildHierarchy(tables, tableMap, roots);

  return roots;
}

/**
 * Create table structure objects for all tables
 */
function createTableStructures(
  tables: TableInfo[],
  tableMap: Map<string, TableStructure>
): void {
  for (const table of tables) {
    const structure: TableStructure = {
      tableName: table.tableName,
      className: snakeToPascal(table.tableName),
      children: [],
      depth: 0,
      isNamespaceOnly: false,
    };
    tableMap.set(table.tableName, structure);
  }
}

/**
 * Build the hierarchy by connecting tables through their naming
 */
function buildHierarchy(
  tables: TableInfo[],
  tableMap: Map<string, TableStructure>,
  roots: TableStructure[]
): void {
  for (const table of tables) {
    const parts = table.tableName.split("_");

    if (parts.length === 1) {
      // Root level table
      roots.push(tableMap.get(table.tableName)!);
    } else {
      // Build the full parent chain
      addTableToHierarchy(table.tableName, parts, tableMap, roots);
    }
  }
}

/**
 * Add a table to the hierarchy, creating namespace parents as needed
 */
function addTableToHierarchy(
  tableName: string,
  parts: string[],
  tableMap: Map<string, TableStructure>,
  roots: TableStructure[]
): void {
  let currentParentName = "";
  let currentParent: TableStructure | null = null;

  // Create/find all intermediate parents
  for (let i = 0; i < parts.length - 1; i++) {
    currentParentName = currentParentName
      ? `${currentParentName}_${parts[i]}`
      : parts[i];

    // Check if this level exists as an actual table
    if (tableMap.has(currentParentName)) {
      currentParent = tableMap.get(currentParentName)!;
    } else {
      // Create namespace parent if it doesn't exist
      currentParent = getOrCreateNamespace(
        currentParentName,
        i,
        currentParent,
        tableMap,
        roots
      );
    }
  }

  // Add actual table to its immediate parent
  const actualTable = tableMap.get(tableName)!;
  actualTable.parentTable = currentParentName;
  actualTable.depth = parts.length - 1;

  if (currentParent && !hasChild(currentParent, tableName)) {
    currentParent.children.push(actualTable);
  }
}

/**
 * Get or create a namespace parent
 */
function getOrCreateNamespace(
  name: string,
  depth: number,
  parent: TableStructure | null,
  tableMap: Map<string, TableStructure>,
  roots: TableStructure[]
): TableStructure {
  if (tableMap.has(name)) {
    return tableMap.get(name)!;
  }

  const namespace: TableStructure = {
    tableName: name,
    className: snakeToPascal(name),
    children: [],
    depth,
    isNamespaceOnly: true,
  };

  tableMap.set(name, namespace);

  // Add to parent or roots
  if (parent) {
    if (!hasChild(parent, name)) {
      parent.children.push(namespace);
    }
  } else {
    roots.push(namespace);
  }

  return namespace;
}

/**
 * Check if a structure already has a child with the given name
 */
function hasChild(structure: TableStructure, childName: string): boolean {
  return structure.children.some((c) => c.tableName === childName);
}

/**
 * Collect all structures recursively (for processing)
 */
export function collectAllStructures(
  hierarchy: TableStructure[]
): TableStructure[] {
  const all: TableStructure[] = [];

  function collect(structure: TableStructure) {
    all.push(structure);
    structure.children.forEach(collect);
  }

  hierarchy.forEach(collect);
  return all;
}

/**
 * Get only root-level structures (depth 0)
 */
export function getRootStructures(
  hierarchy: TableStructure[]
): TableStructure[] {
  return hierarchy.filter((t) => t.depth === 0);
}

/**
 * Get only actual table structures (not namespaces)
 */
export function getActualTables(hierarchy: TableStructure[]): TableStructure[] {
  return collectAllStructures(hierarchy).filter((s) => !s.isNamespaceOnly);
}
