import config from "@/config";
import fs from "node:fs";
import { CooldownType } from "@/discord/utils/cooldown";
import {
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
} from "discord.js";
import path from "node:path";
import { pathToFileURL } from "node:url";

const isDev = config.envMode.isDev;

/**
 * Discord command module structure
 */
export interface CommandModule {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  prodOnly?: boolean;

  // Permission configurations
  permissions?: {
    /** Requires admin role to execute */
    requireAdmin?: boolean;
    /** Custom permission check function */
    customCheck?: (
      interaction: ChatInputCommandInteraction,
    ) => Promise<boolean>;
  };

  // Cooldown configuration
  cooldown?: {
    duration: number; // in seconds
    type: CooldownType;
    message?: string; // Custom cooldown message
    bypassRoles?: string[]; // Role IDs that bypass cooldown
    bypassUsers?: string[]; // User IDs that bypass cooldown
  };
}

/**
 * Loads Discord command handlers
 *
 * @returns Promise resolving to the commandHandlers
 */
export async function loadCommandHandlers(
  commandsPath: string,
): Promise<Collection<string, CommandModule>> {
  if (!fs.existsSync(commandsPath)) {
    logger.warn(`Commands directory not found: ${commandsPath}`);
    return new Collection();
  }

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => (isDev ? file.endsWith(".ts") : file.endsWith(".js")));

  const commandHandlers = new Collection<string, CommandModule>();

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

      if (typeof commandModule.execute !== "function") {
        logger.warn(`Skipped ${file}: 'execute' is not a function`);
        continue;
      }

      if (!commandModule.data.name) {
        logger.warn(`Skipped ${file}: command has no name`);
        continue;
      }

      const isProdOnly = commandModule.prodOnly === true;

      if (isDev && isProdOnly) {
        logger.warn(`Skipped loading production-only command: ${file}`);
        continue;
      }

      commandHandlers.set(commandModule.data.name, commandModule);

      if (commandModule.permissions?.requireAdmin) {
        logger.debug(`Command ${commandModule.data.name} requires admin`);
      }

      if (commandModule.cooldown) {
        logger.debug(
          `Command ${commandModule.data.name} has ${commandModule.cooldown.type} cooldown: ${commandModule.cooldown.duration}`,
        );
      }
    } catch (error) {
      logger.error(`Failed to load command ${file}:`, error);
    }
  }

  logger.info(
    `Loaded ${commandHandlers.size} Discord command(s) from ${commandsPath}`,
  );
  return commandHandlers;
}
