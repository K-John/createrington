import type { Config } from "./types";
import { env, envMode } from "./env/env.config";

const config: Config = {
  envMode,

  meta: {
    name: "Createrington",
    version: "1.21.1",
    author: {
      name: "saunhardy",
      email: "matejhozlarzadek8ii@gmail.com",
      discord: "matejhoz",
    },
    links: {
      discordInvite: "https://discord.gg/7PAptNgqk2",
      website: "https://create-rington.com",
    },
  },

  app: {
    port: env.PORT,
  },

  utils: {
    logger: {
      logDir: "logs",
      keepDays: 7,
    },
  },

  database: {
    pool: {
      user: env.DB_USER,
      host: env.DB_HOST,
      database: env.DB_DATABASE,
      password: env.DB_PASSWORD,
      port: env.DB_PORT,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    },
  },

  discord: {
    bots: {
      main: {
        id: env.DISCORD_MAIN_BOT_ID,
        token: env.DISCORD_MAIN_BOT_TOKEN,
      },
    },

    guild: {
      id: env.DISCORD_GUILD_ID,
      roles: {
        staff: {
          owner: "1447340667767361670",
          admin: "1447343808147750952",
        },
      },
    },

    embeds: {
      colors: {
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
      },
    },

    events: {
      onGuildMemberAdd: {
        welcome: {
          channelId: "1446998934428848238",
          enabled: true,
          imageConfig: {
            backgroundColor: "#2C2F33",
            accentColor: "#7289DA",
            textColor: "#FFFFFF",
            secondaryTextColor: "#99AA5B",
            backgroundImageURL:
              "https://market-assets.create-rington.com/welcome/welcome.png",
          },
        },
        autoRole: {
          roleId: "1447307459449327616",
          enabled: true,
        },
      },
    },
  },

  servers: {
    cogs: {
      ip: env.COGS_AND_STEAM_SERVER_IP,
      port: env.COGS_AND_STEAM_SERVER_PORT,
      rcon: {
        host: env.COGS_AND_STEAM_SERVER_IP,
        port: env.COGS_AND_STEAM_RCON_PORT,
        password: env.COGS_AND_STEAM_RCON_PASSWORD,
      },
    },
    test: {
      ip: env.TEST_SERVER_IP,
      port: env.TEST_SERVER_PORT,
      rcon: {
        host: env.TEST_SERVER_IP,
        port: env.TEST_RCON_PORT,
        password: env.TEST_RCON_PASSWORD,
      },
    },
  },

  email: {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE,
    auth: {
      user: env.EMAIL_ADDRESS,
      pass: env.EMAIL_PASS,
    },
  },
} as const;

export default config;
