import "@/logger.global";
import config from "@/config";
import {
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CommandModule } from "../bots/common/loaders/command-loader";

const BOT_TOKEN = config.discord.bots.main.token;
const BOT_ID = config.discord.bots.main.id;
const GUILD_ID = config.discord.guild.id;
const isDev = config.envMode.isDev;

/**
 * Discord REST API client configured with bot token
 */
const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

/**
 * Dynamically loads command data from slash command files
 *
 * Scans the slash-commands directory and extracts the `data` export
 * from each command module for deployment
 *
 * @returns Promise resolving to an array of command JSON data
 */
async function loadCommandData(): Promise<
  RESTPostAPIApplicationCommandsJSONBody[]
> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const commandsPath = path.join(
    __dirname,
    "..",
    "bots",
    "main",
    "interactions",
    "slash-commands",
  );

  if (!fs.existsSync(commandsPath)) {
    logger.warn("Commands directory not found");
    return [];
  }

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => (isDev ? file.endsWith(".ts") : file.endsWith(".js")));

  const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const commandModule = (await import(
        pathToFileURL(filePath).href
      )) as CommandModule;

      if (!commandModule.data) {
        logger.warn(`Skipped ${file}: missing 'data' export`);
        continue;
      }

      if (typeof commandModule.data.toJSON !== "function") {
        logger.warn(`Skipped ${file}: 'data' does not have toJSON method`);
        continue;
      }

      commands.push(commandModule.data.toJSON());
      logger.debug(`Loaded command data from ${file}`);
    } catch (error) {
      logger.error(`Failed to load command data from ${file}:`, error);
    }
  }

  return commands;
}

/**
 * Registers all defined slash commands to the configured guild
 *
 * This function submits the commands array to Discord's API, replacing
 * any existing guild commands. Registration is guild-specific
 *
 * @returns Promise resolving when registration is completed
 */
async function registerCommands(): Promise<void> {
  try {
    logger.info("Loading command definitions...");
    const commands = await loadCommandData();

    logger.info(
      `Registering ${commands.length} slash command(s) in GUILD: ${GUILD_ID}`,
    );

    const data = (await rest.put(
      Routes.applicationGuildCommands(BOT_ID, GUILD_ID),
      {
        body: commands,
      },
    )) as Array<{ name: string }>;

    logger.info("Commands registered successfully:");
    data.forEach((cmd) => logger.info(` - /${cmd.name}`));
    process.exit(0);
  } catch (error) {
    logger.error("Failed to register commands:", error);
    process.exit(1);
  }
}

registerCommands();
