import config from "@/config";

const channels = config.discord.guild.channels;

/**
 * Discord channel IDs mapped with uppercase keys for consistent access
 * Transforms the original channel configuration keys to uppercase for standardized reference
 */
export const DiscordChannels = Object.fromEntries(
  Object.entries(channels).map(([key, value]) => [key.toUpperCase(), value])
) as Record<Uppercase<keyof typeof channels>, string>;

/**
 * Type representing any valid Discord channel ID from the configuration
 * Ensures type safety when working with channel IDs throughout the application
 */
export type DiscordChannelId =
  (typeof DiscordChannels)[keyof typeof DiscordChannels];

/**
 * Validates whether a given string is configured Discord channel ID
 *
 * @param id - The channel ID string to validate
 * @returns True if the ID exists in the channel configuration, false otherwise
 */
export function isValidChannel(id: string): id is DiscordChannelId {
  return Object.values(DiscordChannels).includes(id as DiscordChannelId);
}

/**
 * Retrieves the human-readable name for a given Discord channel ID
 *
 * @param id - The Discord channel ID to look up
 * @returns The uppercase key name of the channel, or "Unknown channel" if not found
 */
export function getChannelName(id: DiscordChannelId): string {
  const entry = Object.entries(DiscordChannels).find(
    ([_, channelId]) => channelId === id
  );
  return entry ? entry[0] : "Unknown channel";
}
