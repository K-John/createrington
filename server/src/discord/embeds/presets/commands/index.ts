import { CooldownStats } from "@/discord/utils/cooldown/cooldown-manager";
import { createEmbed } from "../../embed-builder";
import { EmbedColors } from "../../colors";

export const CommandEmbedPresets = {
  cooldownStats(stats: CooldownStats) {
    const embed = createEmbed()
      .title("📊 Cooldown Statistics")
      .color(EmbedColors.Info)
      .field("Total Active Cooldowns", stats.totalCooldowns.toString(), true)
      .field("Commands with Cooldowns", stats.totalCommands.toString(), true);

    if (Object.keys(stats.byCommand).length > 0) {
      const commandList = Object.entries(stats.byCommand)
        .map(([cmd, count]) => `\`/${cmd}\`: ${count}`)
        .join("\n");

      embed.field("By Command", commandList || "None");
    }

    return embed;
  },
};
