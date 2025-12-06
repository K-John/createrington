import { env } from "../env/env.config";

export interface DiscordBotConfig {
  main: {
    /**
     * Discord application/bot ID used for identification
     * Required for registering slash commands and API interactions
     */
    id: string;
    /**
     * Discord bot authentication token
     * Used to authenticate and login the bot to Discord's gateway
     */
    token: string;
    /**
     * Discord prefix for text commands
     * Used to make a global config for text commands (e.g.: !test)
     */
    commandPrefix?: string;
    /**
     * Bot owner ids
     */
    owners?: string[];
    /**
     * Discord status message shown in the members list and bot profile
     */
    statusMessage?: string;
    /**
     * Discord activity type going along-side statusMessage
     * Can be standalone
     */
    activityType?: "PLAYING" | "WATCHING" | "LISTENING";
  };
}

const config: DiscordBotConfig = {
  main: {
    id: env.DISCORD_BOT_ID,
    token: env.DISCORD_BOT_TOKEN,
  },
};

export default config;
