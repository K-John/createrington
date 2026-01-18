import config from "@/config";
import { ServerStatsConfig } from "./types";
import { Discord } from "@/discord/constants";

/**
 * Server stats updater configuration
 *
 * Defines which channels to modify
 */
export const SERVER_STATS_CONFIG: ServerStatsConfig = {
  guildId: config.discord.guild.id,
  botsChannelId: Discord.Channels.BOTS_STAT,
  membersChannelId: Discord.Channels.MEMBERS_STAT,
  totalMembersChannelId: Discord.Channels.ALL_STAT,
};
