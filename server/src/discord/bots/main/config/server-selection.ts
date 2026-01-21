import config from "@/config";
import { Discord } from "@/discord/constants";
import { ServerId } from "@/utils/rcon";

/**
 * Server configuration for role assignment
 */
export interface ServerConfig {
  /** Internal server ID */
  id: ServerId;
  /** Display name for the server */
  label: string;
  /** Description of the server */
  description: string;
  /** Discord role ID to assign */
  roleId: string;
  /** Emoji to display on button */
  emoji: string;
  /** Whether this server is currently active */
  enabled: boolean;
}

/**
 * Server selection configuration
 */
export const SERVER_CONFIGS: ServerConfig[] = [
  {
    id: ServerId.COGS,
    label: "Cogs & Steam",
    description: "Create focused server on NeoForge 1.21.1",
    roleId: Discord.Roles.COGS_AND_STEAM,
    emoji: "⚙️",
    enabled: true,
  },
];

/**
 * Gets all enabled server configuration
 */
export function getEnabledServers(): ServerConfig[] {
  return SERVER_CONFIGS.filter((server) => server.enabled);
}

/**
 * Gets a server config by ID
 */
export function getServerConfig(serverId: string): ServerConfig | undefined {
  return SERVER_CONFIGS.find((server) => server.id === serverId);
}

/**
 * Gets role ID for a server
 */
export function getServerRoleId(serverId: string): string | undefined {
  return getServerConfig(serverId)?.roleId;
}
