import { CamelCaseKeys } from "../";

/**
 * Database representation of ticket table
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 */
export interface TicketRow {
  id: number;
  ticket_number: number;
  type: any;
  creator_discord_id: string;
  channel_id: string;
  status: any;
  created_at: Date;
  closed_at: Date | null;
  closed_by_discord_id: string | null;
  deleted_at: Date | null;
  metadata: Record<string, any> | null;
}

/**
 * Application representation (camelCase)
 */
export type Ticket = CamelCaseKeys<TicketRow>;

/**
 * API representation (dates as ISO strings for JSON serialization) 
 */
export interface TicketApiData {
  id: number;
  ticketNumber: number;
  type: any;
  creatorDiscordId: string;
  channelId: string;
  status: any;
  createdAt: string;
  closedAt: string | null;
  closedByDiscordId: string | null;
  deletedAt: string | null;
  metadata: Record<string, any> | null;
}
/**
 * Data required to create a new ticket record
 */
export interface TicketCreate {
  ticketNumber: number;
  type: any;
  creatorDiscordId: string;
  channelId: string;
  id?: number;
  status?: any;
  createdAt?: Date;
  closedAt?: Date | null;
  closedByDiscordId?: string | null;
  deletedAt?: Date | null;
  metadata?: Record<string, any> | null;
}

/**
 * Valid identifiers for querying ticket
 */
export type TicketIdentifier = { id: number } | { channelId: string };

/**
 * Filterable fields for ticket
 */
import type { FilterValue } from "./base.types";

export type TicketFilters = {
  [K in keyof Ticket]?: FilterValue<Ticket[K]>;
};
