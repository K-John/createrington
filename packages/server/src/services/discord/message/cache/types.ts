import { ColorResolvable } from "discord.js";

/**
 * Cached message data with relevant metadata
 */
export interface CachedMessage {
  /** Discord message ID */
  messageId: string;
  /** Channel ID where message was sent */
  channelId: string;
  /** Server ID this channel belongs to */
  serverId: number;
  /** Author's Discord user ID */
  authorId: string;
  /** Author's username */
  authorUsername: string;
  /** Author's server displayname */
  authorDisplayname: string;
  /** Author's avatar url */
  authorAvatarUrl: string;
  /** Author's tag */
  authorTag: string;
  /** Message content */
  content: string;
  /** When the message was created */
  createdAt: Date;
  /** When the message was edited (if applicable) */
  editedAt?: Date;
  /** Attachment URLs */
  attachments: Array<{
    url: string;
    filename: string;
    contentType?: string;
  }>;
  /** Embed data */
  embeds: Array<{
    title?: string;
    description?: string;
    url?: string;
  }>;
  /** Whether message was sent by a bot */
  isBot: boolean;
  /** Referenced message ID (for replies) */
  referenceMessageId?: string;

  source: MessageSource;
  minecraftData?: MinecraftMessageData;
  systemData?: SystemMessageData;
  webData?: WebMessageData;
}

/**
 * Message sources
 */
export enum MessageSource {
  SYSTEM = "system",
  DISCORD = "discord",
  MINECRAFT = "minecraft",
  WEB = "web",
}

/**
 * Parsed embed for web <-> Discord
 */
export interface ParsedEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: ColorResolvable;
  timestamp?: string;
  footer?: {
    text: string;
    iconUrl?: string;
  };
  author?: {
    name: string;
    iconUrl?: string;
    url?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  thumbnail?: {
    url: string;
    width?: number;
    height?: number;
  };
}

/**
 * Parsed attachment
 */
export interface ParsedAttachment {
  url: string;
  filename: string;
  contentType?: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface MinecraftMessageData {
  playerName: string;
}

export interface SystemMessageData {
  title?: string;
  description?: string;
}

export interface WebMessageData {
  originalAuthor: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
}

/**
 * Configuration for a single server's message cache
 */
export interface ServerCacheConfig {
  /** Minecraft server ID */
  serverId: number;
  /** Discord channel ID to monitor */
  channelId: string;
  /** Maximum messages to cache (default: 100) */
  maxMessages?: number;
}

/**
 * Service configuration
 */
export interface MessageCacheServiceConfig {
  /** Array of server configurations */
  servers: ServerCacheConfig[];
  /** Whether to load historical data on startup */
  loadHistoryOnStartup?: boolean;
  /** Bot data */
  botConfig: {
    createringtonBotId: string;
    createringtonWebhookId?: string;
  };
}

/**
 * Query options for retrieving messages
 */
export interface MessageQueryOptions {
  /** Limit number of results */
  limit?: number;
  /** Filter by author ID */
  authorId?: string;
  /** Filter by content (case-insensitive substring match) */
  contentContains?: string;
  /** Get messages after this timestamp */
  after?: Date;
  /** Get messages before this timestamp */
  before?: Date;
}
