import config from "@/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";

const BOT_TOKEN = config.discord.bots.web.token;

export const webBot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

webBot.once("clientReady", () => {
  logger.info("Logged in as", webBot.user?.tag);
});

/**
 * Gets the web Discord bot client instance
 *
 * Throws an error if the client is not initialized yet (before login)
 *
 * @returns The Discord client instance
 * @throws Error if client is not ready
 */
export function getWebClient(): Client {
  if (!webBot.isReady()) {
    throw Error("Discord client is not ready yet");
  }
  return webBot;
}

/**
 * Ensures the web bot is logged in and ready
 *
 * Useful for utilities that may run before the bot has finished connecting
 *
 * @returns Promise resolving to the ready Discord client
 */
export async function ensureWebClientReady(): Promise<Client> {
  if (!webBot.isReady()) {
    await webBot.login(BOT_TOKEN);
    await new Promise<void>((resolve) => {
      webBot.once("clientReady", () => resolve());
    });
  }
  return webBot;
}
