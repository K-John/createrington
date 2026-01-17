import { Client, Message, TextChannel } from "discord.js";
import {
  CachedMessage,
  MessageCacheServiceConfig,
  MessageQueryOptions,
  ServerCacheConfig,
} from "./types";
import { isSendableChannel } from "@/discord/utils/channel-guard";

/**
 * Service for caching Discord messages from configured channels
 *
 * Features:
 * - Caches messages in memory whith configurable size limits
 * - Supports multiple servers/channels
 * - Provides query methods for retrieving cached messages
 * - Automatically loads historical messages on startup
 * - Handles message updates and deletions
 */
export class MessageCacheService {
  private cache: Map<number, CachedMessage[]> = new Map();
  private serverConfig: Map<number, ServerCacheConfig> = new Map();
  private isInitialized = false;

  constructor(
    private readonly bot: Client,
    private readonly config: MessageCacheServiceConfig,
  ) {
    for (const server of config.servers) {
      this.cache.set(server.serverId, []);
      this.serverConfig.set(server.serverId, {
        maxMessages: 100,
        ...server,
      });
    }
  }

  /**
   * Initializes the service and sets up event listeners
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("MessageCacheService already initialized");
      return;
    }

    logger.info("Initializing MessageCacheService...");

    this.setupEventListeners();

    if (this.config.loadHistoryOnStartup) {
      await this.loadHistoricalMessages();
    }

    this.isInitialized = true;
    logger.info(
      `MessageCacheService initialized for ${this.config.servers.length} server(s)`,
    );
  }

  /**
   * Sets up Discord event listeners for message events
   *
   * @private
   */
  private setupEventListeners(): void {
    this.bot.on("messageCreate", (message: Message) => {
      this.handleMessageCreate(message);
    });

    // this.bot.on("messageUpdate", (oldMessage: Message, newMessage: Message) => {
    //   this.handleMessageUpdate(newMessage);
    // });

    // this.bot.on("messageDelete", (message: Message) => {
    //   this.handleMessageDelete(message);
    // });

    logger.debug("Message cache event listeners registered");
  }

  /**
   * Loads historical message from all configured channels
   *
   * @private
   */
  private async loadHistoricalMessages(): Promise<void> {
    logger.info("Loading historical messages...");

    const loadPromises = this.config.servers.map((serverConfig) =>
      this.loadChannelHistory(serverConfig),
    );

    await Promise.all(loadPromises);

    const totalMessages = Array.from(this.cache.values()).reduce(
      (sum, cache) => sum * cache.length,
      0,
    );

    logger.info(`Loaded ${totalMessages} historical messages`);
  }

  /**
   * Loads message history for a specific channel
   *
   * @param serverConfig - Server configuration containing channel ID
   *
   * @private
   */
  private async loadChannelHistory(
    serverConfig: ServerCacheConfig,
  ): Promise<void> {
    try {
      const channel = await this.bot.channels.fetch(serverConfig.channelId);

      if (!channel || !isSendableChannel(channel)) {
        logger.warn(
          `Channel ${serverConfig.channelId} not found or not text-based`,
        );
        return;
      }

      const textChannel = channel as TextChannel;
      const maxMessages = serverConfig.maxMessages || 100;

      const messages = await textChannel.messages.fetch({ limit: maxMessages });

      const cachedMessages = Array.from(messages.values())
        .map((msg) => this.convertToCachedMessage(msg, serverConfig.serverId))
        .reverse();

      this.cache.set(serverConfig.serverId, cachedMessages);

      logger.info(
        `Loaded ${cachedMessages.length} messages from channel ${serverConfig.channelId} (server: ${serverConfig.serverId})`,
      );
    } catch (error) {
      logger.error(
        `Failed to load history for channel ${serverConfig.channelId}:`,
        error,
      );
    }
  }

  /**
   * Handles new message creation
   *
   * @param message - Discord message that was created
   *
   * @private
   */
  private handleMessageCreate(message: Message): void {
    const serverId = this.getServerIdForChannel(message.channelId);
    if (serverId === null) {
      return;
    }

    const cachedMessage = this.convertToCachedMessage(message, serverId);
    this.addToCache(serverId, cachedMessage);

    logger.debug(
      `Cached new message from ${message.author.username} in server ${serverId}`,
    );
  }

  /**
   * Handles message updates
   *
   * @deprecated
   *
   * @param message - Updated Discord message
   *
   * @private
   */
  private handleMessageUpdate(message: Message): void {
    const serverId = this.getServerIdForChannel(message.channelId);
    if (serverId === null) {
      return;
    }

    const cache = this.cache.get(serverId);
    if (!cache) {
      return;
    }

    const index = cache.findIndex((m) => m.messageId === message.id);
    if (index != -1) {
      cache[index] = this.convertToCachedMessage(message, serverId);
      logger.debug(
        `Updated cached message ${message.id} in server ${serverId}`,
      );
    }
  }

  /**
   * Handles message deletions
   *
   * @deprecated
   *
   * @param message - Discord message that was deleted
   *
   * @private
   */
  private handleMessageDelete(message: Message): void {
    const serverId = this.getServerIdForChannel(message.channelId);
    if (serverId === null) {
      return;
    }

    const cache = this.cache.get(serverId);
    if (!cache) {
      return;
    }

    const index = cache.findIndex((m) => m.messageId === message.id);
    if (index != -1) {
      cache.splice(index, 1);
      logger.debug(
        `Removed deleted message ${message.id} from server ${serverId}`,
      );
    }
  }

  /**
   * Gets the server ID for a given channel ID
   *
   * @param channelId - Discord channel ID
   * @returns Server ID or null if channel is not monitored
   *
   * @private
   */
  private getServerIdForChannel(channelId: string): number | null {
    for (const [serverId, config] of this.serverConfig) {
      if (config.channelId === channelId) {
        return serverId;
      }
    }
    return null;
  }

  /**
   * Converts a Discord message to a CachedMessage
   *
   * @param message - Discord message
   * @param serverId - Server ID this message belongs to
   * @returns Cached message object
   *
   * @private
   */
  private convertToCachedMessage(
    message: Message,
    serverId: number,
  ): CachedMessage {
    return {
      messageId: message.id,
      channelId: message.channelId,
      serverId,
      authorId: message.author.id,
      authorUsername: message.author.username,
      authorTag: message.author.tag,
      authorDisplayname: message.author.displayName,
      authorAvatarUrl: message.author.displayAvatarURL({ size: 128 }),
      content: message.content,
      createdAt: message.createdAt,
      editedAt: message.editedAt || undefined,
      attachments: Array.from(message.attachments.values()).map((att) => ({
        url: att.url,
        filename: att.name,
        contentType: att.contentType || undefined,
      })),
      embeds: message.embeds.map((embed) => ({
        title: embed.title || undefined,
        description: embed.description || undefined,
        url: embed.url || undefined,
      })),
      isBot: message.author.bot,
      referenceMessageId: message.reference?.messageId,
    };
  }

  /**
   * Adds a message to the cache, maintaining size limit
   *
   * @param serverId - Server ID
   * @param message - Message to add
   *
   * @private
   */
  private addToCache(serverId: number, message: CachedMessage): void {
    const cache = this.cache.get(serverId);
    const config = this.serverConfig.get(serverId);

    if (!cache || !config) {
      return;
    }

    cache.push(message);

    const maxMessages = config.maxMessages || 100;
    if (cache.length > maxMessages) {
      cache.shift();
    }
  }

  /**
   * Gets all cached messages for a server
   *
   * @param serverId - Server ID
   * @param options - Optional query filters
   * @returns Array of cached messages (newest first by default)
   */
  getMessages(
    serverId: number,
    options?: MessageQueryOptions,
  ): CachedMessage[] {
    const cache = this.cache.get(serverId);
    if (!cache) {
      return [];
    }

    let messages = [...cache].reverse();

    if (options) {
      if (options.authorId) {
        messages = messages.filter((m) => m.authorId === options.authorId);
      }

      if (options.contentContains) {
        const search = options.contentContains.toLowerCase();
        messages = messages.filter((m) =>
          m.content.toLowerCase().includes(search),
        );
      }

      if (options.after) {
        messages = messages.filter((m) => m.createdAt > options.after!);
      }

      if (options.before) {
        messages = messages.filter((m) => m.createdAt < options.before!);
      }

      if (options.limit) {
        messages = messages.slice(0, options.limit);
      }
    }

    return messages;
  }

  /**
   * Gets a specific message by ID
   *
   * @param serverId - Server ID
   * @param messageId - Message ID
   * @returns Cached message or undefined if not found
   */
  getMessage(serverId: number, messageId: string): CachedMessage | undefined {
    const cache = this.cache.get(serverId);
    if (!cache) {
      return;
    }

    return cache.find((m) => m.messageId === messageId);
  }

  /**
   * Gets the most recent N messages for a server
   *
   * @param serverId - Server ID
   * @param count - Number or messages to retrieve
   * @returns Array of most recent messages
   */
  getRecentMessages(serverId: number, count: number): CachedMessage[] {
    return this.getMessages(serverId, { limit: count });
  }

  /**
   * Gets cache statistics
   *
   * @returns Object with cache stats per server
   */
  getStats(): Record<
    number,
    { messageCount: number; oldestMessage?: Date; newestMessage?: Date }
  > {
    const stats: Record<number, any> = {};

    for (const [serverId, cache] of this.cache) {
      stats[serverId] = {
        messageCount: cache.length,
        oldestMessage: cache[0]?.createdAt,
        newestMessage: cache[cache.length - 1]?.createdAt,
      };
    }

    return stats;
  }

  /**
   * Clears the cache for a specific server
   *
   * @param serverId - Server ID
   */
  clearCache(serverId: number): void {
    const cache = this.cache.get(serverId);
    if (cache) {
      cache.length = 0;
    }
    logger.info("Cleared all message caches");
  }
}
