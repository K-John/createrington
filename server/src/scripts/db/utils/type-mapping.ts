/**
 * PostgreSQL to TypeScript type mapping utilities
 */

/**
 * Convert PostgreSQL type to TypeScript type
 */
export function pgTypeToTsType(
  udtName: string,
  isNullable: boolean,
  numericPrecision: number | null,
  numericScale: number | null,
): string {
  const baseType = getBaseType(udtName, numericPrecision, numericScale);
  return isNullable ? `${baseType} | null` : baseType;
}

/**
 * Get base TypeScript type for PostgreSQL type
 */
function getBaseType(
  udtName: string,
  numericPrecision: number | null,
  numericScale: number | null,
): string {
  if (udtName === "numeric") {
    return getNumericType(numericPrecision, numericScale);
  }

  const typeMap: Record<string, string> = {
    int2: "number",
    int4: "number",
    int8: "bigint",
    float4: "number",
    float8: "number",
    text: "string",
    varchar: "string",
    bpchar: "string",
    uuid: "string",
    bool: "boolean",
    timestamp: "Date",
    timestamptz: "Date",
    date: "Date",
    json: "Record<string, any>",
    jsonb: "Record<string, any>",
  };

  return typeMap[udtName] || "any";
}

/**
 * Determine TypeScript type for numeric columns
 */
function getNumericType(
  precision: number | null,
  scale: number | null,
): string {
  // If has decimal places, use string to avoid precision loss
  if (scale !== null && scale > 0) {
    return "string";
  }

  // If precision is very large, use string to avoid overflow
  if (precision !== null && precision > 15) {
    return "string";
  }

  return "number";
}

/**
 * Get type comment for numeric columns
 */
export function getNumericComment(
  udtName: string,
  precision: number | null,
  scale: number | null,
): string {
  if (udtName === "numeric" && precision !== null && scale !== null) {
    return ` // numeric(${precision}, ${scale})`;
  }
  return "";
}
