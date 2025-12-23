import { CamelCaseKeys } from "@/types";

/**
 * Database representation of admin record
 */
export interface AdminRow {
  discord_id: string;
  created_at: Date;
  vanished: boolean;
}

export type Admin = CamelCaseKeys<AdminRow>;

/**
 * Data required to create a new admin record
 */
export interface AdminCreate {
  discordId: string;
}
