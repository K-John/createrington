import { createEmbed } from "../../embed-builder";
import { EmbedColors } from "../../colors";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { ButtonPresets } from "../buttons";

export const WaitlistEmbedPresets = {
  /**
   * Admin notification for new waitlist submission
   */
  adminNotification(data: { id: number; discordName: string; email: string }) {
    const embed = createEmbed()
      .title("📥 New Waitlist Submission")
      .color(EmbedColors.Info)
      .field("🆔 Submission ID", data.id.toString())
      .field("💬 Discord", data.discordName)
      .field("📧 Email", data.email)
      .build();

    // Use reusable button presets
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ButtonPresets.waitlist.accept(data.id),
      ButtonPresets.waitlist.decline(data.id)
    );

    const linkRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ButtonPresets.links.adminPanel()
    );

    return { embed, components: [actionRow, linkRow] };
  },

  /**
   * Auto-invite notification (no action buttons, just admin panel link)
   */
  autoInviteNotification(data: {
    id: number;
    discordName: string;
    email: string;
    success: boolean;
    botMention: string;
  }) {
    const embed = createEmbed()
      .title("📥 New Waitlist Submission")
      .color(data.success ? EmbedColors.Success : EmbedColors.Error)
      .field("🆔 Submission ID", data.id.toString())
      .field("💬 Discord", data.discordName)
      .field("📧 Email", data.email)
      .build();

    const linkRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ButtonPresets.links.adminPanel()
    );

    const content = data.success
      ? `✅ Accepted by ${data.botMention}`
      : "Auto-invite attempted — please review.";

    return { embed, components: [linkRow], content };
  },
};
