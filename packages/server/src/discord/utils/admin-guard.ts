import { admin } from "@/db";
import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
} from "discord.js";
import { EmbedPresets } from "../embeds";
import { isAdminDb } from "@/db/utils";
import { RoleManager } from "./roles/role-manager";
import { Discord } from "../constants";

/**
 * Checks if the user is an admin
 * Replies with error if not and returns false
 *
 * @param interaction - The command interaction
 * @returns True if admin, false otherwise
 */
export async function requireAdmin(
  interaction: ChatInputCommandInteraction,
): Promise<boolean> {
  const isAdmin = await admin.exists({ discordId: interaction.user.id });

  if (!isAdmin) {
    const embed = EmbedPresets.error(
      "Permission denied",
      "This command requires administrator privileges",
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
 * Checks if the user is owner
 * Replies with error if not and returns false
 *
 * @param interaction - The command interaction
 * @returns True if owner, false otherwise
 */
export async function requireOwner(
  interaction: ChatInputCommandInteraction,
): Promise<boolean> {
  const isAdmin = await admin.exists({ discordId: interaction.user.id });

  if (!isAdmin) {
    const embed = EmbedPresets.error(
      "Permission denied",
      "This command requires administrator privileges",
    );
    await interaction.reply({
      embeds: [embed.build()],
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  const member = interaction.member as GuildMember;

  if (
    !member ||
    typeof member.roles === "string" ||
    Array.isArray(member.roles)
  ) {
    return false;
  }

  const isOwner = RoleManager.has(member, Discord.Roles.OWNER);

  return isOwner;
}

/**
 * Throws an error if user is not an admin
 * Used for error handling to catch it
 *
 * @param interaction - The command interaction
 * @throws Error if user is not an admin
 */
export async function assertAdmin(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const isAdmin = await admin.exists({ discordId: interaction.user.id });

  if (!isAdmin) {
    throw new Error("User is not an admin");
  }
}

/**
 * Checks if a user is an admin
 *
 * - Has a role ADMIN in Discord
 *
 * @param member - The Discord guild member
 * @returns Promise resolving to true if user is an admin, false otherwise
 */
export async function isAdminDc(member: GuildMember): Promise<boolean> {
  return RoleManager.has(member, Discord.Roles.ADMIN);
}

/**
 * Checks if a user is an admin in both Discord and Database
 *
 * @param member - The Discord guild member
 */
export async function isAdmin(member: GuildMember): Promise<boolean> {
  if (!isAdminDc(member)) return false;

  return await isAdminDb(member.id);
}
