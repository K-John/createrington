import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  Interaction,
  MessageFlags,
} from "discord.js";
import { CommandModule } from "../loaders/command-loader";
import { cooldownManager } from "@/discord/utils/cooldown/cooldown-manager";
import { EmbedPresets } from "@/discord/embeds";

/**
 * Formats a cooldown duration in seconds into a human-readable string
 *
 * @param seconds - The cooldown duration in seconds
 * @returns Formatted string (e.g., "5.0 second(s)", "2 minute(s) and 30 second(s)", "1 hour(s)")
 */
function formatCooldown(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)} second(s)`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes} minute(s) and ${remainingSeconds} second(s)`
      : `${minutes} minute(s)`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours} hour(s) and ${remainingMinutes} minute(s)`
    : `${hours} hour(s)`;
}

/**
 * Checks if a user can bypass the cooldown for a command
 *
 * Users can bypass cooldowns if:
 * - The command has no cooldown configured
 * - Their user ID is in the command's bypassUsers list
 * - They have a role that's in the command's bypassRoles list
 *
 * @param interaction - The chat input interaction
 * @param command - The command module being executed
 * @returns True if the user can bypass the cooldown, false otherwise
 */
function canBypassCooldown(
  interaction: ChatInputCommandInteraction,
  command: CommandModule
): boolean {
  if (!command.cooldown) return true;

  if (command.cooldown.bypassUsers?.includes(interaction.user.id)) {
    return true;
  }

  if (interaction.guild && command.cooldown.bypassRoles) {
    const member = interaction.member;
    if (member && "roles" in member) {
      const memberRoles = member.roles as { cache: Collection<string, any> };
      const hasRole = command.cooldown.bypassRoles.some((roleId) =>
        memberRoles.cache.has(roleId)
      );
      if (hasRole) return true;
    }
  }

  return false;
}

/**
 * Handles execution of slash commands with cooldown management
 *
 * Process:
 * 1. Retrieves the command handler
 * 2. Checks if the command is on cooldown (unless user can bypass)
 * 3. Executes the command if not on cooldown
 * 4. Sets cooldown after successful execution
 * 5. Handles errors with ephemeral error messages
 *
 * @param interaction - The chat input command interaction
 * @param commandHandlers - Collection of registered command handlers
 * @returns Promise that resolves when command handling is complete
 */
async function handleChatCommands(
  interaction: ChatInputCommandInteraction,
  commandHandlers: Collection<string, CommandModule>
): Promise<void> {
  const command = commandHandlers.get(interaction.commandName);

  if (!command) {
    logger.warn(`Unknown command received /${interaction.commandName}`);
    return;
  }

  logger.info(
    `${interaction.user.tag} (${interaction.user.id}) ran /${interaction.commandName}`
  );

  // Check cooldown
  if (command.cooldown && !canBypassCooldown(interaction, command)) {
    const cooldownRemaining = cooldownManager.check(
      interaction.commandName,
      command.cooldown,
      {
        userId: interaction.user.id,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
      }
    );

    if (cooldownRemaining !== null) {
      const cooldownMessage =
        command.cooldown.message ||
        `This command is on cooldown. Please wait ${formatCooldown(
          cooldownRemaining
        )} before using it again.`;

      const cooldownEmbed = EmbedPresets.error(
        "Command on Cooldown",
        cooldownMessage
      )
        .field("Time Remaining", formatCooldown(cooldownRemaining), true)
        .build();

      await interaction.reply({
        embeds: [cooldownEmbed],
        flags: MessageFlags.Ephemeral,
      });

      logger.debug(
        `${interaction.user.tag} tried to use /${
          interaction.commandName
        } but it's on cooldown (${cooldownRemaining.toFixed(1)}s remaining)`
      );
      return;
    }
  }

  try {
    await command.execute(interaction);

    // Set cooldown after successful execution
    if (command.cooldown && !canBypassCooldown(interaction, command)) {
      cooldownManager.set(interaction.commandName, command.cooldown, {
        userId: interaction.user.id,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
      });
    }
  } catch (error) {
    logger.error(`Error executing command ${interaction.commandName}:`, error);

    const replyMethod =
      interaction.replied || interaction.deferred
        ? interaction.followUp
        : interaction.reply;

    await replyMethod.call(interaction, {
      content: "❌ Command failed",
      flags: MessageFlags.Ephemeral,
    });
  }
}

/**
 * Registers the interaction event handler for the Discord client
 *
 * Sets up a listener for the 'interactionCreate' event that routes
 * chat input commands to the appropriate handler
 *
 * @param discordClient - The Discord.js client instance
 * @param commandHandlers - Collection of slash command handlers keyed by command name
 */
export function registerInteractionHandler(
  discordClient: Client,
  commandHandlers: Collection<string, CommandModule>
): void {
  discordClient.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleChatCommands(interaction, commandHandlers);
      return;
    }
  });
}
