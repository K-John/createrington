import config from "@/config";

const channels = config.discord.guild.channels;

/**
 * Converts a camelCase string to SCREAMING_SNAKE_CASE at runtime
 *
 * Inserts underscores before capital letters and converts the entire string to uppercase
 *
 * @param str - The camelCase string to convert
 * @returns The converted SCREAMING_SNAKE_CASE string
 *
 * @example
 * toScreamingSnakeCase("adminChat") // Returns "ADMIN_CHAT"
 * toScreamingSnakeCase("generalDiscussion") // Returns "GENERAL_DISCUSSION"
 */
function toScreamingSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
}

/**
 * Type-level utility for converting camelCase string literals to SCREAMING_SNAKE_CASE
 *
 * Recursively processes each character, inserting underscores before uppercase letters
 * and converting all characters to uppercase. Used for type-safe key transformation.
 *
 * @template S - The string literal type to convert
 *
 * @example
 * type Result = ToScreamingSnakeCase<"adminChat">; // "ADMIN_CHAT"
 * type Result2 = ToScreamingSnakeCase<"myChannelName">; // "MY_CHANNEL_NAME"
 */
type ToScreamingSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Uppercase<T>}${ToScreamingSnakeCase<U>}`
    : `${Uppercase<T>}_${ToScreamingSnakeCase<U>}`
  : S;

/**
 * Discord channel IDs mapped with SCREAMING_SNAKE_CASE keys for consistent access
 *
 * Transforms the original channel configuration keys from camelCase to SCREAMING_SNAKE_CASE
 * while preserving type safety and autocomplete functionality. All channel IDs from the
 * configuration are accessible through their converted key names.
 *
 * @example
 * // If config has { adminChat: "123456" }
 * DiscordChannels.ADMIN_CHAT // "123456"
 */
const DiscordChannels = Object.fromEntries(
  Object.entries(channels).map(([key, value]) => [
    toScreamingSnakeCase(key),
    value,
  ])
) as {
  [K in keyof typeof channels as ToScreamingSnakeCase<
    K & string
  >]: (typeof channels)[K];
};

/**
 * Type representing any valid Discord channel ID from the configuration
 *
 * Ensures type safety when working with channel IDs throughout the application.
 * Only channel IDs defined in the configuration are considered valid.
 */
export type DiscordChannelId =
  (typeof DiscordChannels)[keyof typeof DiscordChannels];

export const DiscordChannelsNamespace = {
  ...DiscordChannels,

  /**
   * Validates whether a given string is a configured Discord channel ID
   *
   * Type guard function that checks if the provided ID exists in the channel
   * configuration. Useful for runtime validation of channel IDs from external sources.
   *
   * @param id - The channel ID string to validate
   * @returns True if the ID exists in the channel configuration, false otherwise
   *
   * @example
   * if (isValidChannel(someId)) {
   *   // TypeScript now knows someId is a DiscordChannelId
   *   console.log(getChannelName(someId));
   * }
   */
  isValid(id: string): id is DiscordChannelId {
    return Object.values(DiscordChannels).includes(id as DiscordChannelId);
  },

  /**
   * Formats a Discord channel mention string
   *
   * Creates a Discord mention string that will reference the channel
   * when sent in a message. Does not validate whether the channel exists in the guild.
   *
   * @param channelId - The Discord channel ID to mention
   * @returns The formatted role mention string
   *
   * @example
   * const mention = DiscordChannelsNamespace.mention(Discord.Channels.CHANNEL_ID)
   * await channel.send(`Look here ${mention}`); // "Look here #channel"
   */
  mention(channelId: DiscordChannelId): string {
    return `<#${channelId}>`;
  },

  /**
   * Retrieves the human-readable SCREAMING_SNAKE_CASE name for a given Discord channel ID
   *
   * Performs a reverse lookup to find the configuration key name associated with
   * the provided channel ID. Useful for logging, debugging, and error messages.
   *
   * @param id - The Discord channel ID to look up
   * @returns The SCREAMING_SNAKE_CASE key name of the channel, or "Unknown channel" if not found
   *
   * @example
   * getChannelName(DiscordChannels.ADMIN_CHAT) // Returns "ADMIN_CHAT"
   */
  getChannelName(id: DiscordChannelId): string {
    const entry = Object.entries(DiscordChannels).find(
      ([_, channelId]) => channelId === id
    );
    return entry ? entry[0] : "Unknown channel";
  },
} as const;
