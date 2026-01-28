import { Client, GatewayIntentBits, Partials } from "discord.js";

/**
 * Web Discord bot client instance
 *
 * NOTE: This is just the client definition.
 * Login happens in services/bootstrap.ts
 */
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
