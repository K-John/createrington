import config from "@/config";

const { GREEN, RED, ORANGE, BLUE, GRAY, DARK_RED, PURPLE, GOLD } =
  config.discord.embeds.colors;

export const EmbedColors = {
  Success: GREEN,
  Error: RED,
  Warning: ORANGE,
  Info: BLUE,
  Loading: GRAY,
  Moderation: DARK_RED,
  System: PURPLE,
  Premium: GOLD,
} as const;
