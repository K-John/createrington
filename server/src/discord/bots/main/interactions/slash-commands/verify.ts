import { Q, waitlistRepo } from "@/db";
import { Discord } from "@/discord/constants";
import { CooldownType } from "@/discord/utils/cooldown";
import { RoleManager } from "@/discord/utils/roles/role-manager";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

/**
 * Slash commmand definition for the verify command
 * Authentication command that verifies user token from email invitation
 */
export const data = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Verify your token from the email invitation")
  .addStringOption((option) =>
    option
      .setName("token")
      .setDescription("Your unique verification token")
      .setRequired(true)
  );

/**
 * Cooldown configuration for the verify command
 *
 * - duration: 1 minute
 * - type: "user" - Each user has their own cooldown
 * - message: Custom message shown when user is on cooldown
 */
export const cooldown = {
  duration: 60,
  type: CooldownType.USER,
  message: "Please wait before trying to verify again!",
};

/**
 * Whether this command should only be available in production
 * Set to false to allow usage in development mode
 */
export const prodOnly = false;

/**
 * Executes the verify command to verify a user invitation token
 *
 * @param interaction - The chat input command interaction
 * @returns Promise resolving when the command execution is completed
 */
export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const token = interaction.options.getString("token", true);
  const discordId = interaction.user.id;
  const member = await interaction.guild!.members.fetch(interaction.user.id);

  if (
    !member ||
    typeof member.roles === "string" ||
    Array.isArray(member.roles)
  ) {
    await interaction.reply({
      content: "❌ Could not verify your roles. Please try again.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const hasUnverified = RoleManager.has(member, Discord.Roles.UNVERIFIED);

  if (!hasUnverified) {
    await interaction.reply({
      content: "❌ You are already verified or not eligible to register.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const entry = await Q.waitlist.find({ token });

    if (!entry) {
      await interaction.reply({
        content: `❌ Invalid or expired token.\n${Discord.Roles.mention(
          Discord.Roles.ADMIN
        )}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (entry.discordId && entry.discordId !== discordId) {
      await interaction.reply({
        content: `❌ This token has already been used by another Discord account.\n${Discord.Roles.mention(
          Discord.Roles.ADMIN
        )}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await Q.waitlist.update(
      { id: entry.id },
      {
        discordId,
        verified: true,
        joinedDiscord: true,
      }
    );

    await waitlistRepo.updateProgressEmbed(entry.id);

    logger.info(
      `User ${interaction.user.tag} (${discordId}) verified within token waitlist entry ${entry.id}`
    );

    await interaction.reply({
      content:
        "✅ Token verified! You may now use `/register <mc_name>` to join the server.",
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error("/verify failed:", error);
    await interaction.reply({
      content: "⚠️ Something went wrong. Please try again later.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
