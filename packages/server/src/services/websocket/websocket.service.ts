import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer, Socket } from "socket.io";
import {
  JoinServerPayload,
  MessageDeletePayload,
  MessageUpdatePayload,
  NewMessagePayload,
  ServerStatusPayload,
  SocketEvent,
  WebSocketServiceConfig,
} from "./types";
import { MessageCacheService } from "../discord/message/cache";

/**
 * WebSocket service for real-time communication with clients
 *
 * Features:
 * - Real-time message broadcasting from Discord
 * - Server-specific room management
 * - Integration with MessageCacheService
 * - Type-safe event handling
 * - CORS support
 *
 * Architecture:
 * - Uses Socket.IO for WebSocket communication
 * - Clients join server-specific rooms
 * - Events are broadcast only to relevant rooms
 * - Integrates with Discord message cache via EventEmitter
 */
export class WebSocketService {
  private io: SocketIOServer;
  private isInitialized = false;

  constructor(
    httpServer: HttpServer,
    private config: WebSocketServiceConfig = {},
  ) {
    this.io = new SocketIOServer(httpServer, {
      cors: config.cors || {
        origin: "*",
        credentials: true,
      },
      path: config.path || "/socket.io",
    });

    this.setupSocketHandlers();
  }

  /**
   * Initialize the WebSocket service and connect to message cache
   *
   * @param messageCacheService - Message cache service to listen to
   */
  async initialize(messageCacheService: MessageCacheService): Promise<void> {
    if (this.isInitialized) {
      logger.warn("WebSocketService already initialized");
      return;
    }

    this.connectToMessageCache(messageCacheService);
    this.isInitialized = true;

    logger.info("WebSocketService initialized");
  }

  /**
   * Set up Socket.IO connection and event handlers
   *
   * @private
   */
  private setupSocketHandlers(): void {
    this.io.on(SocketEvent.CONNECTION, (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on(SocketEvent.JOIN_SERVER, (payload: JoinServerPayload) => {
        this.handleJoinServer(socket, payload);
      });

      socket.on(SocketEvent.LEAVE_SERVER, (payload: JoinServerPayload) => {
        this.handleLeaveServer(socket, payload);
      });

      socket.on(SocketEvent.DISCONNECT, () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      socket.on(SocketEvent.ERROR, (error: Error) => {
        logger.error(`Socket error for ${socket.id}:`, error);
      });
    });

    logger.debug("Socket.IO handlers registered");
  }

  /**
   * Connect to message cache service and listen for events
   *
   * @param messageCacheService - Message cache service instance
   *
   * @private
   */
  private connectToMessageCache(
    messageCacheService: MessageCacheService,
  ): void {
    // Listen for new messages
    messageCacheService.on("messageCreate", (serverId, message) => {
      this.broadcastNewMessage(serverId, message);
    });

    // Listen for message updates
    messageCacheService.on("messageUpdate", (serverId, message) => {
      this.broadcastMessageUpdate(serverId, message);
    });

    // Listen for message deletes
    messageCacheService.on("messageDelete", (serverId, messageId) => {
      this.broadcastMessageDelete(serverId, messageId);
    });

    logger.debug("Connected to MessageCacheService events");
  }

  /**
   * Handle client joining
   *
   * @param socket - Client socket
   * @param payload - Join server payload
   *
   * @private
   */
  private handleJoinServer(socket: Socket, payload: JoinServerPayload): void {
    const roomName = this.getServerRoom(payload.serverId);
    socket.join(roomName);

    logger.debug(`Client ${socket.id} joined server room: ${roomName}`);

    socket.emit("joined", {
      serverId: payload.serverId,
      roomName,
    });
  }

  /**
   * Handle client leaving a server room
   *
   * @param socket - Client socket
   * @param payload - Leave server payload
   *
   * @private
   */
  private handleLeaveServer(socket: Socket, payload: JoinServerPayload): void {
    const roomName = this.getServerRoom(payload.serverId);
    socket.leave(roomName);

    logger.debug(`Client ${socket.id} left server room: ${roomName}`);

    socket.emit("left", {
      serverId: payload.serverId,
      roomName,
    });
  }

  /**
   * Get room name for server
   *
   * @param serverId - Server ID
   * @returns Room name
   *
   * @private
   */
  private getServerRoom(serverId: number): string {
    return `server:${serverId}`;
  }

  /**
   * Broadcast new message to clients in server room
   *
   * @param serverId - Server ID
   * @param message - Cached message
   */
  private broadcastNewMessage(serverId: number, message: any): void {
    const payload: NewMessagePayload = {
      serverId,
      message,
    };

    const roomName = this.getServerRoom(serverId);
    this.io.to(roomName).emit(SocketEvent.NEW_MESSAGE, payload);

    logger.debug(`Broadcast new message to ${roomName}: ${message.messageId}`);
  }

  /**
   * Broadcast message update to clients in server room
   *
   * @param serverId - Server ID
   * @param message - Updated cached message
   */
  private broadcastMessageUpdate(serverId: number, message: any): void {
    const payload: MessageUpdatePayload = {
      serverId,
      messageId: message.messageId,
      message,
    };

    const roomName = this.getServerRoom(serverId);
    this.io.to(roomName).emit(SocketEvent.MESSAGE_UPDATE, payload);

    logger.debug(
      `Broadcast message update to ${roomName}: ${message.messageId}`,
    );
  }

  /**
   * Broadcast message deletion to clients in server room
   *
   * @param serverId - Server ID
   * @param messageId - Deleted message ID
   */
  private broadcastMessageDelete(serverId: number, messageId: string): void {
    const payload: MessageDeletePayload = {
      serverId,
      messageId,
    };

    const roomName = this.getServerRoom(serverId);
    this.io.to(roomName).emit(SocketEvent.MESSAGE_DELETE, payload);

    logger.debug(`Broadcast message delete to ${roomName}: ${messageId}`);
  }

  /**
   * Broadcast status update to clients in server room
   *
   * @param payload - Server status payload
   */
  public broadcastServerStatus(payload: ServerStatusPayload): void {
    const roomName = this.getServerRoom(payload.serverId);
    this.io.to(roomName).emit(SocketEvent.SERVER_STATUS, payload);

    logger.debug(`Broadcast server status to ${roomName}`);
  }

  /**
   * Get count of connected clients
   *
   * @returns Number of connected clients
   */
  public getConnectedCount(): number {
    return this.io.sockets.sockets.size;
  }

  /**
   * Get count of clients in a specific server room
   *
   * @param serverId - Server ID
   * @returns Number of clients in room
   */
  public async getRoomCount(serverId: number): Promise<number> {
    const roomName = this.getServerRoom(serverId);
    const sockets = await this.io.to(roomName).fetchSockets();
    return sockets.length;
  }

  /**
   * Get service status and statistics
   *
   * @returns Service status object
   */
  public async getStatus(): Promise<{
    isInitialized: boolean;
    connectedClients: number;
    rooms: Record<number, number>;
  }> {
    const rooms: Record<number, number> = {};

    // TODO

    return {
      isInitialized: this.isInitialized,
      connectedClients: this.getConnectedCount(),
      rooms,
    };
  }

  /**
   * Close the WebSocket service
   */
  public async close(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    await this.io.close();
    this.isInitialized = false;

    logger.info("WebSocketService closed");
  }
}
