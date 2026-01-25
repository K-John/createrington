/**
 * Naming convention utilities
 */

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert snake_case to PascalCase
 */
export function snakeToPascal(str: string): string {
  return str
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(camelCase: string): string {
  return camelCase.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
