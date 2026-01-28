import { CachedMessage } from "../discord/message/cache";

/**
 * WebSocket event types
 */
export enum SocketEvent {
  // Connection lifecycle
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  ERROR = "error",

  // Client actions
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",
  REQUEST_INITIAL_DATA = "request:initial",

  // Server->Client: Initial data responses
  INITIAL_DATA = "initial:data",

  // Server->Client: Real-time updates
  UPDATE_SERVER_STATUS = "update:server:status",
  UPDATE_PLAYERS = "update:players",
  UPDATE_MESSAGE = "update:message",

  // Acknowledgments
  SUBSCRIBED = "subscribed",
  UNSUBSCRIBED = "unsubscribed",
}

/**
 * Subscription types for different data streams
 */
export enum SubscriptionType {
  SERVER_STATUS = "server:status",
  PLAYERS = "players",
  MESSAGES = "messages",
  ALL = "all",
}

/**
 * Room naming convention
 */
export enum RoomType {
  GLOBAL = "global",
  SERVER = "server",
}

/**
 * Server status data
 */
export interface ServerStatus {
  serverId: number;
  serverName: string;
  online: boolean;
  playerCount: number;
  maxPlayers: number;
  lastUpdate: Date;
}

/**
 * Player data for WebSocket transmission
 */
export interface PlayerData {
  uuid: string;
  username: string;
  serverId: number;
  sessionStart: Date;
  sessionDuration: number; // seconds
}

/**
 * Initial data payload containing all current state
 */
export interface InitialDataPayload {
  servers: ServerStatus[];
  players: PlayerData[];
  messages: Record<number, CachedMessage[]>; // serverId -> messages
  timestamp: Date;
}

/**
 * Server-specific initial data
 */
export interface ServerInitialDataPayload {
  serverId: number;
  status: ServerStatus;
  players: PlayerData[];
  messages: CachedMessage[];
  timestamp: Date;
}

/**
 * Server status update payload
 */
export interface ServerStatusUpdatePayload {
  serverId: number;
  online: boolean;
  playerCount: number;
  maxPlayers: number;
  timestamp: Date;
}

/**
 * Players update payload
 */
export interface PlayersUpdatePayload {
  serverId: number;
  type: "join" | "leave" | "sync";
  players?: PlayerData[]; // For sync
  player?: PlayerData; // For join/leave
  timestamp: Date;
}

/**
 * Message update payload
 */
export interface MessageUpdatePayload {
  serverId: number;
  type: "new" | "update" | "delete";
  message?: CachedMessage; // For new/update
  messageId?: string; // For delete
  timestamp: Date;
}

/**
 * Subscription request from client
 */
export interface SubscriptionRequest {
  type: SubscriptionType;
  serverId?: number; // Required for server-specific subscriptions
}

/**
 * Subscription confirmation
 */
export interface SubscriptionConfirmation {
  type: SubscriptionType;
  serverId?: number;
  room: string;
  success: boolean;
  error?: string;
}

/**
 * Initial data request from client
 */
export interface InitialDataRequest {
  serverId?: number; // If provided, only get data for this server
  includeMessages?: boolean;
  messageLimit?: number;
}

/**
 * WebSocket service configuration
 */
export interface WebSocketServiceConfig {
  /** CORS configuration */
  cors?: {
    origin: string | string[];
    credentials?: boolean;
  };
  /** Path for socket.io endpoint */
  path?: string;
  /** Maximum messages to include in initial data per server */
  maxInitialMessages?: number;
}

/**
 * Client socket with metadata
 */
export interface ClientSocket {
  id: string;
  subscriptions: Set<string>; // room names
  connectedAt: Date;
}

/**
 * Service statistics
 */
export interface WebSocketStats {
  connectedClients: number;
  rooms: Record<string, number>; // room name -> client count
  subscriptions: Record<SubscriptionType, number>; // subscription type -> total count
  uptime: number; // seconds
}
