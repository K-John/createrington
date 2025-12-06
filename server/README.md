# Vi-Link Discord Bot

A TypeScript Discord bot with slash commands, cooldowns, and embed builder with presets.

## Setup

### 1. Prerequisites

- Node.js v20+
- Discord Bot Token ([Get one here](https://discord.com/developers/applications))

### 2. Installation

```bash
cd server
npm install
```

### 3. Configuration

Create `.env` file in the `server` directory:

```env
PORT=your-port
NODE_ENV=development

DISCORD_GUILD_ID=your_guild_id_here
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_BOT_ID=your_bot_id_here
```

**Getting Discord Credentials:**

- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Create/select your application
- **Bot Token**: Bot section → Reset Token
- **Bot ID**: OAuth2 section → Copy Client ID
- **Guild ID**: Enable Developer Mode in Discord → Right-click server → Copy Server ID

### 4. Deploy Commands

```bash
npm run util:deploy-commands
```

### 5. Start Bot

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

## Docker

```bash
docker-compose up -d
```

## Project Structure

```
server/src/
├── discord/
│   ├── bots/main/interactions/slash-commands/   # Add commands here
│   ├── embeds/                                  # Embed builders
│   └── utils/cooldown/                          # Cooldown system
├── config/                                      # Configuration
└── server.ts                                    # Entry point
```

## Creating Commands

Create a file in `src/discord/bots/main/interactions/slash-commands/`:

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { EmbedPresets } from "@/discord/embeds";

export const data = new SlashCommandBuilder()
  .setName("hello")
  .setDescription("Says hello");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = EmbedPresets.success("Hello!", "Welcome to the bot").build();
  await interaction.reply({ embeds: [embed] });
}
```

Then deploy:

```bash
npm run util:deploy-commands
```

## Available Scripts

```bash
npm run dev                   # Start with hot reload
npm run build                 # Build for production
npm start                     # Run production build
npm run typecheck             # Type check
npm run util:deploy-commands  # Deploy slash commands
```

## Features

- Slash commands
- Cooldown system (user/global/channel/guild)
- Embed builder with presets
- Daily rotating logs
- Docker ready
- Full TypeScript

## License

No license set for now, will change in the future

All Rights Reserved
