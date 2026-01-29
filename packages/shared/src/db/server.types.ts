import { CamelCaseKeys } from "../";

/**
 * Database representation of server table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface ServerRow {
  id: number;
  name: string;
  identifier: string;
  created_at: Date;
}

/**
 * Application representation (camelCase)
 */
export type Server = CamelCaseKeys<ServerRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
 */
export interface ServerApiData {
  id: number;
  name: string;
  identifier: string;
  createdAt: string;
}
/**
 * Data required to create a new server record
 */
export interface ServerCreate {
  name: string;
  identifier: string;
  id?: number;
  createdAt?: Date;
}

/**
 * Valid identifiers for querying server
 */
export type ServerIdentifier = { id: number } | { name: string } | { identifier: string };

/**
 * Filterable fields for server
 */
import type { FilterValue } from "./base.types";

export type ServerFilters = {
  [K in keyof Server]?: FilterValue<Server[K]>;
};
