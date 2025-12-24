import { ButtonBuilder, ButtonStyle } from "discord.js";
import { EmbedColors } from "../../colors";
import { createEmbed } from "../../embed-builder";

interface RegistrationStep {
  name: string;
  completed: boolean;
  error?: string;
}

export const RegistrationEmbedPresets = {
  /**
   * Creates a user-facing registration progress embed
   */
  userProgress(
    username: string,
    steps: RegistrationStep[],
    currentStepIndex: number
  ) {
    const total = steps.length;
    const completed = steps.filter((s) => s.completed).length;
    const percent = Math.round((completed / total) * 100);

    const barLen = 12;
    const filled = Math.round((completed / total) * barLen);
    const bar = "▰".repeat(filled) + "▱".repeat(barLen - filled);

    const stepsText = steps
      .map((s, i) => {
        if (s.completed) {
          return `✓ ${s.name}`;
        } else if (i === currentStepIndex) {
          return `⏳ ${s.name}`;
        } else {
          return `· ${s.name}`;
        }
      })
      .join("\n");

    const embed = createEmbed()
      .title("🔄 Registering your Minecraft account...")
      .description(`**Username:** \`${username}\`\n\n${bar}  **${percent}%**`)
      .field("Progress", stepsText, false)
      .color(EmbedColors.Info);

    return embed;
  },

  /**
   * Creates a successful registration embed with close button
   */
  userSuccess(username: string, uuid: string) {
    const embed = createEmbed()
      .title("✅ Registration Complete!")
      .description(
        `You've been successfully registered and whitelisted as **${username}**.\n\nWelcome aboard! 🚂`
      )
      .field("Minecraft Username", `\`${username}\``, true)
      .field("UUID", `\`${uuid}\``, true)
      .color(EmbedColors.Success)
      .footer("You can now join the server!");

    const closeButton = new ButtonBuilder()
      .setCustomId("registration:close")
      .setLabel("Close")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🗑️");

    return { embed, closeButton };
  },

  /**
   * Creates a registration error embed
   */
  userError(username: string, error: string, step: string) {
    const embed = createEmbed()
      .title("❌ Registration Failed")
      .description(
        `An error occurred while registering **${username}**.\n\n**Step:** ${step}\n**Error:** ${error}\n\nAn admin has been notified and will assist you shortly.`
      )
      .color(EmbedColors.Error)
      .footer("Please wait for admin assistance");

    return embed;
  },

  adminError(
    username: string,
    discordTag: string,
    discordId: string,
    error: string,
    step: string
  ) {
    const embed = createEmbed()
      .title("⚠️ Registration Error")
      .description(
        `Registration failed for **${discordTag}** (\`${discordId}\`)`
      )
      .field("Minecraft Username", `\`${username}\``, true)
      .field("Failed Step", step, true)
      .field("Error", error, false)
      .color(EmbedColors.Error)
      .timestamp();

    return embed;
  },
};
