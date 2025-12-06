import { CommandEmbedPresets } from "./commands";
import { CommonEmbedPresets } from "./common";

export const EmbedPresets = {
  ...CommonEmbedPresets,
  commands: CommandEmbedPresets,
};
