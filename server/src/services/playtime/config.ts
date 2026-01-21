import config from "@/config";

/**
 * Server information for IP-based detection
 */
export interface ServerInfo {
  serverId: number;
  serverName: string;
  ip: string;
  port: number;
}

/**
 * IP-to-Server mapping for automatic server detection
 *
 * Format: Record<ipAddress, ServerInfo>
 *
 * When a request comes from a specific IP, we automatically
 * know which server it's from.
 */
export const MINECRAFT_SERVER_MAPPING: Record<string, ServerInfo> = {
  // Map each server's IP to its info
  [config.servers.cogs.ip]: {
    serverId: config.servers.cogs.id,
    serverName: config.servers.cogs.name,
    ip: config.servers.cogs.ip,
    port: config.servers.cogs.port,
  },

  // Add more servers here as needed:
  // "192.168.1.101": {
  //   serverId: 2,
  //   serverName: "Creative Server",
  //   ip: "192.168.1.101",
  //   port: 25566,
  // },
};

/**
 * Alternative: List all servers by ID (for explicit serverId in payload)
 *
 * Format: Record<serverId, ServerConfig>
 *
 * This is used when the mod sends an explicit serverId,
 * or for initializing services.
 */
export interface ServerConfig {
  id: number;
  name: string;
  ip: string;
  port: number;
}

export const MINECRAFT_SERVERS: Record<number, ServerConfig> = {
  [config.servers.cogs.id]: {
    id: config.servers.cogs.id,
    name: config.servers.cogs.name || "COGS Server",
    ip: config.servers.cogs.ip,
    port: config.servers.cogs.port,
  },

  // Add more servers here:
  // 2: {
  //   id: 2,
  //   name: "Creative Server",
  //   ip: "192.168.1.101",
  //   port: 25566,
  // },
};

/**
 * Get server info by IP address
 */
export function getServerByIp(ip: string): ServerInfo | undefined {
  return MINECRAFT_SERVER_MAPPING[ip];
}

/**
 * Get server config by ID
 */
export function getServerById(serverId: number): ServerConfig | undefined {
  return MINECRAFT_SERVERS[serverId];
}

/**
 * Get all server IDs
 */
export function getAllServerIds(): number[] {
  return Object.keys(MINECRAFT_SERVERS).map(Number);
}

/**
 * Check if server ID exists
 */
export function isValidServerId(serverId: number): boolean {
  return serverId in MINECRAFT_SERVERS;
}
