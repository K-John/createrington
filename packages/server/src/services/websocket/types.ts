import { CachedMessage } from "../discord/message/cache";

/**
 * WebSocket event types
 */
export enum SocketEvent {
  // Connection events
  CONNECTION = "connection",
  DISCONNECT = "disconnect",

  // Message events
  NEW_MESSAGE = "message:new",
  MESSAGE_UPDATE = "message:update",
  MESSAGE_DELETE = "message:delete",

  // Server events
  SERVER_STATUS = "server:status",

  // Client events
  JOIN_SERVER = "client:join_server",
  LEAVE_SERVER = "client:leave_server",

  // Error events
  ERROR = "error",
}

/**
 * Payload for new message event
 */
export interface NewMessagePayload {
  serverId: number;
  message: CachedMessage;
}

/**
 * Payload for message update event
 */
export interface MessageUpdatePayload {
  serverId: number;
  messageId: string;
  message: CachedMessage;
}

/**
 * Payload for message delete event
 */
export interface MessageDeletePayload {
  serverId: number;
  messageId: string;
}

/**
 * Payload for server status event
 */
export interface ServerStatusPayload {
  serverId: number;
  onlinePlayers: number;
  maxPlayers: number;
  timestamp: Date;
}

/**
 * Client-to-server event data
 */
export interface JoinServerPayload {
  serverId: number;
}

/**
 * Socket event handlers map
 */
export interface SocketEventHandlers {
  [SocketEvent.NEW_MESSAGE]: (payload: NewMessagePayload) => void;
  [SocketEvent.MESSAGE_UPDATE]: (payload: MessageUpdatePayload) => void;
  [SocketEvent.MESSAGE_DELETE]: (payload: MessageDeletePayload) => void;
  [SocketEvent.SERVER_STATUS]: (payload: ServerStatusPayload) => void;
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
  /** Port to listen on */
  port?: number;
  /** Path for socket.io endpoint */
  path?: string;
}
