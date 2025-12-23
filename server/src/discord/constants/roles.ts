import config from "@/config";

const roles = config.discord.guild.roles;

/**
 * Discord role IDs mapped with uppercase keys for consistent access
 * Transforms the original role configuration keys to uppercase for standardized reference
 */
export const DiscordRoles = Object.fromEntries(
  Object.entries(roles).map(([key, value]) => [key.toUpperCase(), value])
) as Record<Uppercase<keyof typeof roles>, string>;

/**
 * Type representing any valid Discord role ID from the configuration
 * Ensures type safety when working with role IDs throughout the application
 */
export type DiscordRoleId = (typeof DiscordRoles)[keyof typeof DiscordRoles];

/**
 * Validates whether a given string is configured Discord role ID
 *
 * @param id - The role ID string to validate
 * @returns True if the ID exists in the role configuration, false otherwise
 */
export function isValidRole(id: string): id is DiscordRoleId {
  return Object.values(DiscordRoles).includes(id as DiscordRoleId);
}

/**
 * Retrieves the human-readable name for a given Discord role ID
 *
 * @param id - The Discord role ID to look up
 * @returns The uppercase key name of the role, or "Unknown role" if not found
 */
export function getRoleName(id: DiscordRoleId): string {
  const entry = Object.entries(DiscordRoles).find(
    ([_, roleId]) => roleId === id
  );
  return entry ? entry[0] : "Unknown role";
}
