import { createEmbed } from "../embed-builder";
import { EmbedColors } from "../colors";

export const CommonEmbedPresets = {
  success(title: string, description?: string) {
    const embed = createEmbed().title(`✅ ${title}`).color(EmbedColors.Success);

    if (description) {
      embed.description(description);
    }

    return embed;
  },

  error(title: string, description?: string) {
    const embed = createEmbed().title(`❌ ${title}`).color(EmbedColors.Error);

    if (description) {
      embed.description(description);
    }

    return embed;
  },

  info(title: string, description?: string) {
    const embed = createEmbed().title(`ℹ️ ${title}`).color(EmbedColors.Info);

    if (description) {
      embed.description(description);
    }

    return embed;
  },

  loading(message: string = "Processing...") {
    return createEmbed()
      .title("⏳ Please wait")
      .description(message)
      .color(EmbedColors.Info);
  },
};
