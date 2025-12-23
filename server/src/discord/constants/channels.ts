import config from "@/config";

const channels = config.discord.guild.channels;

/**
 * Discord channel IDs for the guild
 *
 * Derived from config
 */
export const DiscordChannels = {
  WELCOME: channels.welcome,
} as const;

export type DiscordChannelId =
  (typeof DiscordChannels)[keyof typeof DiscordChannels];

export function isValidChannelId(id: string): id is DiscordChannelId {
  return Object.values(DiscordChannels).includes(id as DiscordChannelId);
}

export function getChannelName(id: DiscordChannelId): string {
  const entry = Object.entries(DiscordChannels).find(
    ([_, channelId]) => channelId === id
  );
  return entry ? entry[0] : "Unknown channel";
}
