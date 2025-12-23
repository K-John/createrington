import config from "@/config";
import { Discord } from "@/discord/constants";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  MessageFlags,
} from "discord.js";

/**
 * Checks if user is an admin (has admin role or is in admin database)
 */
async function isAdmin(interaction: ButtonInteraction): Promise<boolean> {
  const ADMIN_ROLE_ID = Discord.Roles.ADMIN;

  if (!interaction.guild || !interaction.member) {
    return false;
  }

  const member = interaction.member;
  if (member && "roles" in member) {
    if (typeof member.roles !== "string" && !Array.isArray(member.roles)) {
      const hasAdminRole = member.roles.cache.has(ADMIN_ROLE_ID);
      if (hasAdminRole) return true;
    }
  }

  // TODO: Add database check
  return false;
}

/**
 * Disables all non-link buttons in the message components
 */
function disableNonLinkButtons(
  interaction: ButtonInteraction
): ActionRowBuilder<ButtonBuilder>[] {
  return interaction.message.components.map((row) => {
    const newRow = new ActionRowBuilder<ButtonBuilder>();
    if ("components" in row) {
      row.components.forEach((component) => {
        if (component.type === 2) {
          const button = ButtonBuilder.from(component);
          if (button.data.style !== ButtonStyle.Link) {
            button.setDisabled(true);
          }
          newRow.addComponents(button);
        }
      });
    }
    return newRow;
  });
}

/**
 * Parses the waitlist button customId
 * Format: waitlist:action:id
 */
function parseCustomId(customId: string): {
  action: "accept" | "decline";
  id: string;
} | null {
  const [, action, id] = customId.split(":");

  if (!action || !id) return null;
  if (action !== "accept" && action !== "decline") return null;

  return { action, id };
}

/**
 * Waitlist button handler
 *
 * Handles buttons with pattern: waitlist:accept:<id> or waitlist:decline<id>
 */
export const pattern = "waitlist:*";

export const prodOnly = false;

export const permissionDeniedMessage = "You must be an admin to do that.";

export async function checkPermission(
  interaction: ButtonInteraction
): Promise<boolean> {
  return isAdmin(interaction);
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

  const { action, id } = parsed;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    if (action === "accept") {
      // TODO: Import and use sendInvite function

      // Simulate for now
      const result = { ok: true };

      if (!result.ok) {
        await interaction.editReply("Could not send invite: Unknown error");
        return;
      }

      await interaction.message.edit({
        components: disableNonLinkButtons(interaction),
        content: `✅ Accepted by <@${interaction.user.id}>`,
        embeds: interaction.message.embeds,
      });

      await interaction.editReply("Invite sent successfully");
      logger.info(`Waitlist entry ${id} accepted by ${interaction.user.tag}`);
    } else if (action === "decline") {
      await interaction.message.edit({
        components: disableNonLinkButtons(interaction),
        content: `❌ Declined by <@${interaction.user.id}>`,
        embeds: interaction.message.embeds,
      });

      await interaction.editReply("Declined");
      logger.info(`Waitlist entry ${id} declined by ${interaction.user.tag}`);
    } else {
      await interaction.editReply("Unknown action.");
    }
  } catch (error) {
    logger.error(`Error handling waitlist button (${action}:${id}):`, error);

    try {
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply("There was an error handling that action");
      }
    } catch (error) {
      logger.error("Failed to send error response:", error);
    }
  }
}
