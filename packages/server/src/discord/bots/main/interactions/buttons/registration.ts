import { EmbedPresets } from "@/discord/embeds";
import { isSendableChannel } from "@/discord/utils/channel-guard";
import {
  type ButtonInteraction,
  type GuildChannel,
  MessageFlags,
} from "discord.js";

/**
 * Handles registration-related buttons
 * Pattern: registration:action
 */
export const pattern = "registration:*";

/**
 * Whether these buttons should be handled in production only
 */
export const prodOnly = false;

/**
 * Parses the button customId
 */
function parseCustomId(customId: string): { action: string } | null {
  const [, action] = customId.split(":");
  if (!action) return null;
  return { action };
}

export async function execute(interaction: ButtonInteraction): Promise<void> {
  const parsed = parseCustomId(interaction.customId);

  if (!parsed) {
    await interaction.reply({
      content: "Invalid button format",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const { action } = parsed;

  if (action === "close") {
    try {
      const channel = interaction.channel;

      if (!channel || !isSendableChannel(channel) || channel.isDMBased()) {
        await interaction.reply({
          content: "❌ Channel not found or invalid",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const guildChannel = channel as GuildChannel & { name: string };
      const channelName = guildChannel.name;

      const deleteEmbed = EmbedPresets.channelDeletion();

      await interaction.update({
        embeds: [deleteEmbed.build()],
        components: [],
      });

      setTimeout(async () => {
        try {
          await channel.delete(
            `Registration completed - closed by ${interaction.user.tag}`,
          );
          logger.info(
            `Deleted registration channel ${channelName} - closed by ${interaction.user.tag}`,
          );
        } catch (error) {
          logger.error("Failed to delete registration channel:", error);
        }
      }, 5000);
    } catch (error) {
      logger.error("Failed to handle registration close button:", error);
    }
  }
}
