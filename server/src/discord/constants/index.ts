export * from "./roles";
export * from "./channels";

/**
 * Re-export everything under a namespace
 *
 * This acts as a convenient wrapper around config values,
 * providing better autocomplete organization
 */
import { DiscordRoles } from "./roles";
import { DiscordChannels } from "./channels";

export const Discord = {
  Roles: DiscordRoles,
  Channels: DiscordChannels,
};
