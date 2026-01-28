/**
 * Server status types
 *
 * Shared types for server status endpoints
 * These types should be exported to the shared package for frontend use
 */

/**
 * Basic player information
 */
export interface PlayerInfo {
  uuid: string;
  username: string;
  sessionStart: string; // ISO 8601 timestamp
  secondsPlayed: number;
  metadata?: PlayerMetadata;
}

/**
 * Optional player metadata
 */
export interface PlayerMetadata {
  displayName?: string;
  gamemode?: string;
  dimension?: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  health?: number;
  experienceLevel?: number;
  ipAddress?: string;
}

/**
 * Server status information
 */
export interface ServerStatus {
  serverId: number;
  serverName: string;
  ip: string;
  port: number;
  maxPlayers: number;
  status: "online" | "offline" | "unknown";
  playerCount: number;
  players: PlayerInfo[];
  lastChecked: string; // ISO 8601 timestamp
}

/**
 * Response for GET /api/servers
 */
export interface GetAllServersResponse {
  success: true;
  data: {
    servers: ServerStatus[];
    totalServers: number;
    onlineServers: number;
    totalPlayers: number;
  };
}

/**
 * Response for GET /api/servers/:id
 */
export interface GetServerResponse {
  success: true;
  data: {
    server: ServerStatus;
  };
}

/**
 * Error response
 */
export interface ServerErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    stack?: string;
  };
}
