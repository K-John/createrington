import { ColorResolvable } from "discord.js";

export interface ColorsConfig {
  GREEN: ColorResolvable;
  RED: ColorResolvable;
  BLUE: ColorResolvable;
  GOLD: ColorResolvable;
  PURPLE: ColorResolvable;
  ORANGE: ColorResolvable;
  YELLOW: ColorResolvable;
  CYAN: ColorResolvable;
  PINK: ColorResolvable;
  DARK_BLUE: ColorResolvable;
  DARK_GREEN: ColorResolvable;
  DARK_RED: ColorResolvable;
  DARK_PURPLE: ColorResolvable;
  DARK_GOLD: ColorResolvable;
  GRAY: ColorResolvable;
  DARK_GRAY: ColorResolvable;
  WHITE: ColorResolvable;
  BLACK: ColorResolvable;
}

const config = {
  GREEN: 0x00ff00,
  RED: 0xff0000,
  BLUE: 0x0099ff,
  GOLD: 0xffd700,
  PURPLE: 0x9b59b6,
  ORANGE: 0xff8800,
  YELLOW: 0xffff00,
  CYAN: 0x00ffff,
  PINK: 0xff69b4,
  DARK_BLUE: 0x0066cc,
  DARK_GREEN: 0x008000,
  DARK_RED: 0x8b0000,
  DARK_PURPLE: 0x663399,
  DARK_GOLD: 0xb8860b,
  GRAY: 0x808080,
  DARK_GRAY: 0x404040,
  WHITE: 0xffffff,
  BLACK: 0x000000,
} satisfies ColorsConfig;

export default config;
