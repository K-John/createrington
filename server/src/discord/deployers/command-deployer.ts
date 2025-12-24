import config from "@/config";
import {
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits,
} from "discord.js";
import logger from "@/logger";

const BOT_TOKEN = config.discord.bots.main.token;
const BOT_ID = config.discord.bots.main.id;
const GUILD_ID = config.discord.guild.id;

/**
 * Array of SlashCommandBuilder instances defining bot commands
 */
type CommandBuilderLike = { toJSON(): RESTPostAPIApplicationCommandsJSONBody };

const commandBuilders: CommandBuilderLike[] = [
  new SlashCommandBuilder().setName("ping").setDescription("Check bot latency"),

  new SlashCommandBuilder()
    .setName("cooldown")
    .setDescription("Manage command cooldowns")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("reset")
        .setDescription("Reset cooldown for a user")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("User to reset cooldowns for")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("reset-command")
        .setDescription("Reset all cooldowns for a specific command")
        .addStringOption((opt) =>
          opt
            .setName("command")
            .setDescription("Command name to reset")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("stats").setDescription("View cooldown statistics")
    ),

  new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify your token from the email invitation")
    .addStringOption((option) =>
      option
        .setName("token")
        .setDescription("Your unique verification token")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register to Createrington")
    .addStringOption((option) =>
      option
        .setName("mc_name")
        .setDescription("Your exact Minecraft username (case doesn't matter)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete up to 100 recent messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Number of messages to delete (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
];

/**
 * JSON representation of slash commands ready for API submission
 * Converted to SlashCommandBuilder instances
 */
const commands: RESTPostAPIApplicationCommandsJSONBody[] = commandBuilders.map(
  (cmd) => cmd.toJSON()
);

/**
 * Discord REST API client configured with bot token
 */
const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

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
    console.log("Registering slash commands in GUILD:", GUILD_ID);

    const data = (await rest.put(
      Routes.applicationGuildCommands(BOT_ID, GUILD_ID),
      { body: commands }
    )) as Array<{ name: string }>;

    console.log("Commands registered:");
    data.forEach((cmd) => console.log(` - /${cmd.name}`));
  } catch (error) {
    logger.error("Failed to register commands:", error);
  }
}

registerCommands();
