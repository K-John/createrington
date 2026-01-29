import { CamelCaseKeys } from "../";

/**
 * Database representation of admin table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface AdminRow {
  discord_id: string;
  created_at: Date | null;
  vanished: boolean | null;
}

/**
 * Application representation (camelCase)
 */
export type Admin = CamelCaseKeys<AdminRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
 */
export interface AdminApiData {
  discordId: string;
  createdAt: string | null;
  vanished: boolean | null;
}
/**
 * Data required to create a new admin record
 */
export interface AdminCreate {
  discordId?: string;
  createdAt?: Date | null;
  vanished?: boolean | null;
}

/**
 * Valid identifiers for querying admin
 */
export type AdminIdentifier = { discordId: string };

/**
 * Filterable fields for admin
 */
import type { FilterValue } from "./base.types";

export type AdminFilters = {
  [K in keyof Admin]?: FilterValue<Admin[K]>;
};
