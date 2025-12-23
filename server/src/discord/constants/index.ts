/**
 * Re-export everything under a namespace
 *
 * This acts as a convenient wrapper around config values,
 * providing better autocomplete organization
 */
import { DiscordRoles, getRoleName, isValidRole } from "./roles";
import { DiscordChannels, getChannelName, isValidChannel } from "./channels";

// Unified namespace for better autocomplete
export const Discord = {
  Roles: DiscordRoles,
  Channels: DiscordChannels,

  // Validation helpers
  isValidRole: isValidRole,
  isValidChannel: isValidChannel,

  // Name lookups
  getRoleName,
  getChannelName,
};

export * from "./roles";
export * from "./channels";
