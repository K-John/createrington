import { CooldownType } from "@/discord/utils/cooldown";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

/**
 * Slash command definition for the register command
 * Registers the user into the system
 */
export const data = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Register to Createrington")
  .addStringOption((option) =>
    option
      .setName("mc_name")
      .setDescription("Your exact Minecraft username (case doesn't matter)")
      .setRequired(true)
  );

/**
 * Cooldown configuration for the ping command
 *
 * - duration: 5 seconds
 * - type: "user" - Each user has their own cooldown
 * - message: Custom message shown when user is on cooldown
 */
export const cooldown = {
  duration: 60,
  type: CooldownType.USER,
  message: "Please wait before trying to register again!",
};

/**
 * Whether this command should only be available in production
 * Set to false to allow usage in development
 */
export const prodOnly = false;

/**
 * Executes the register command to register the user
 *
 * @param interaction - The chat input command interaction
 * @returns Promise resolving when the command execution is completed
 */
export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const mcName = interaction.options.getString("mc_name", true);
  const discordId = interaction.user.id;
  const member = interaction.member;
}
