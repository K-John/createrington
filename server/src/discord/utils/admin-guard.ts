import { admin } from "@/db";
import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { EmbedPresets } from "../embeds";

/**
 * Checks if the user is an admin
 * Replies with error if not and returns false
 *
 * @param interaction - The command interaction
 * @returns True if admin, false otherwise
 */
export async function requireAdmin(
  interaction: ChatInputCommandInteraction
): Promise<boolean> {
  const isAdmin = await admin.exists({ discordId: interaction.user.id });

  if (!isAdmin) {
    const embed = EmbedPresets.error(
      "Permission denied",
      "This command requires administrator privileges"
    );
    await interaction.reply({
      embeds: [embed.build()],
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}

/**
 * Throws an error if user is not an admin
 * Used for error handling to catch it
 *
 * @param interaction - The command interaction
 * @throws Error if user is not an admin
 */
export async function assertAdmin(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const isAdmin = await admin.exists({ discordId: interaction.user.id });

  if (!isAdmin) {
    throw new Error("User is not an admin");
  }
}
