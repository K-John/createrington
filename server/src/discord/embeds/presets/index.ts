import { CommandEmbedPresets } from "./commands";
import { CommonEmbedPresets } from "./common";
import { RegistrationEmbedPresets } from "./registration";
import { WaitlistEmbedPresets } from "./waitlist";

export const EmbedPresets = {
  ...CommonEmbedPresets,
  commands: CommandEmbedPresets,
  waitlist: WaitlistEmbedPresets,
  registration: RegistrationEmbedPresets,
};
