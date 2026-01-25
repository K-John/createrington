import { EmbedPresets } from "@/discord/embeds";
import { ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { ConfirmationFlow } from ".";

export interface AdminChangeConfirmation {
  interaction: ChatInputCommandInteraction;
  title: string;
  description?: string;
  changes: Array<{ name: string; oldValue: string; newValue: string }>;
  warnings?: string[];
  reason: string;
  onConfirm: () => Promise<void>;
  onCancel?: () => Promise<void>;
  timeout?: number;
  isDeferred?: boolean;
}

export async function confirmAdminChange(
  options: AdminChangeConfirmation
): Promise<void> {
  const {
    interaction,
    title,
    description,
    changes,
    warnings = [],
    reason,
    onConfirm,
    onCancel,
    timeout = 2 * 60 * 1000,
    isDeferred = false,
  } = options;

  const confirmEmbed = EmbedPresets.confirmation.create({
    title,
    description,
    changes,
    warnings,
    footer: `Reason: ${reason}`,
  });

  await ConfirmationFlow.create(interaction, {
    embed: confirmEmbed,
    buttons: [
      {
        label: "Confirm",
        style: ButtonStyle.Success,
        emoji: "✅",
        customId: "confirm",
        handler: async (btnInteraction) => {
          await btnInteraction.deferUpdate();
          await onConfirm();
        },
      },
      {
        label: "Cancel",
        style: ButtonStyle.Secondary,
        emoji: "❌",
        customId: "cancel",
        handler: async (btnInteraction) => {
          const cancelEmbed = EmbedPresets.info(
            "Cancelled",
            "Action cancelled. No changes were made."
          );

          await btnInteraction.update({
            embeds: [cancelEmbed.build()],
            components: [],
          });

          if (onCancel) {
            await onCancel();
          }
        },
      },
    ],
    timeout,
    ephemeral: true,
    authorOnly: true,
    isDeferred,
  });
}
