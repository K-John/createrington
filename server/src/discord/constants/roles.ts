import config from "@/config";

const roles = config.discord.guild.roles;

/**
 * Discord role IDs for the guild
 *
 * These are derived from the config
 * This provides a convenient, type-safe way to access role IDs throughout the codebase
 */
export const DiscordRoles = {
  // Staff
  OWNER: roles.staff.owner,
  ADMIN: roles.staff.admin,
  UNVERIFIED: roles.auth.unverified,
} as const;

/**
 * Type-safe role ID type derived from the DiscordRoles object
 */
export type DiscordRoleId = (typeof DiscordRoles)[keyof typeof DiscordRoles];

/**
 * Helper to check if a string is a valid Discord role ID
 */
export function isValidRoleId(id: string): id is DiscordRoleId {
  return Object.values(DiscordRoles).includes(id as DiscordRoleId);
}

/**
 * Get role name from ID
 */
export function getRoleName(id: DiscordRoleId): string {
  const entry = Object.entries(DiscordRoles).find(
    ([_, roleId]) => roleId === id
  );
  return entry ? entry[0] : "Unknown role";
}
