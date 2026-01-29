import { CamelCaseKeys } from "../";

/**
 * Database representation of ticket_action table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface TicketActionRow {
  id: number;
  ticket_id: number;
  action_type: string;
  performed_by_discord_id: string;
  performed_at: Date;
  metadata: Record<string, any> | null;
}

/**
 * Application representation (camelCase)
 */
export type TicketAction = CamelCaseKeys<TicketActionRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
 */
export interface TicketActionApiData {
  id: number;
  ticketId: number;
  actionType: string;
  performedByDiscordId: string;
  performedAt: string;
  metadata: Record<string, any> | null;
}
/**
 * Data required to create a new ticket_action record
 */
export interface TicketActionCreate {
  ticketId: number;
  actionType: string;
  performedByDiscordId: string;
  id?: number;
  performedAt?: Date;
  metadata?: Record<string, any> | null;
}

/**
 * Valid identifiers for querying ticket_action
 */
export type TicketActionIdentifier = { id: number };

/**
 * Filterable fields for ticket_action
 */
import type { FilterValue } from "./base.types";

export type TicketActionFilters = {
  [K in keyof TicketAction]?: FilterValue<TicketAction[K]>;
};
