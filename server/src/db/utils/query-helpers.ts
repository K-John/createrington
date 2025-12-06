import { NotFoundError } from "./errors";

/**
 * Formats criteria object into readable string for error messages
 */
export function formatCriteria(criteria: Record<string, any>): string {
  return Object.entries(criteria)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
}

/**
 * Creates a standardized "not found" error
 */
export function createNotFoundError(
  entityName: string,
  criteria: Record<string, any>
): NotFoundError {
  return new NotFoundError(entityName, criteria);
}

/**
 * Extracts the first key-value pair from a criteria object
 * Useful for discriminated union types
 */
export function getFirstCriteria<T extends Record<string, any>>(
  criteria: T
): { key: keyof T; value: T[keyof T] } {
  const key = Object.keys(criteria)[0] as keyof T;
  return { key, value: criteria[key] };
}
