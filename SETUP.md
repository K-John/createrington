# Createrington Development Setup Guide

Complete setup guide for developers and admins working on the Createrington Discord bot and web dashboard.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Database Setup](#database-setup)
- [Discord Configuration](#discord-configuration)
- [Running the Project](#running-the-project)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)

   ```bash
   node --version  # Should be v18.x.x or higher
   ```

   Download from: https://nodejs.org/

2. **Docker Desktop**
   - Windows/Mac: https://www.docker.com/products/docker-desktop/
   - Linux: Follow your distribution's Docker installation guide

   Verify installation:

   ```bash
   docker --version
   docker-compose --version
   ```

3. **Git**
   ```bash
   git --version
   ```

### Recommended Tools

- **VSCode** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Docker (for managing containers)
- **pgAdmin** (optional - already included in Docker setup)
  - Access via: http://localhost:5050
  - Credentials will be provided in the next section

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd createrington
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for all workspaces (server, client, shared).

### 3. Environment Configuration

**Get the `.env` file from the project admin via Discord.**

Place the `.env` file in the **project root directory** (same level as `package.json`).

Your `.env` should contain:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=<your-bot-token>
DISCORD_CLIENT_ID=<your-client-id>
DISCORD_GUILD_ID=<your-guild-id>

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=createrington_db
DB_PASSWORD=postgres
DB_PORT=5432
DB_URL=postgresql://postgres:postgres@localhost:5432/createrington_db

# RCON Configuration (for Minecraft servers)
# ... additional configs will be provided
```

**⚠️ IMPORTANT:** Never commit `.env` files to Git! They are already in `.gitignore`.

---

## Database Setup

The project uses PostgreSQL running in Docker with pre-populated test data.

### Start the Database

```bash
npm run db:up
```

This command:

- Builds the PostgreSQL Docker image
- Creates the database schema with all tables, functions, and triggers
- Loads test data from db/data/

### Verify Database Setup

Check the logs to ensure successful initialization:

```bash
npm run db:logs
```

Look for these success messages:

```
NOTICE:  Data generation complete!
NOTICE:  Summary records: 15
NOTICE:  Daily records: 336
NOTICE:  Hourly records: 3395
NOTICE:  Active sessions: 5
NOTICE:  Completed sessions: 897
```

Press `Ctrl+C` to stop following logs.

### Access the Database

**Option 1: Command Line (psql)**

```bash
npm run db:shell
```

Once connected, try these commands:

```sql
-- List all tables
\dt

-- View player count
SELECT COUNT(*) FROM player;

-- View admin list
SELECT p.minecraft_username, a.discord_id
FROM admin a
JOIN player p ON a.discord_id = p.discord_id;

-- Exit
\q
```

**Option 2: pgAdmin (GUI)**

1. Start pgAdmin:

   ```bash
   npm run pgadmin
   ```

2. Open browser to: http://localhost:5050

3. Login credentials:
   - Email: `admin@createrington.com`
   - Password: `admin`

4. Add server connection:
   - Host: `postgres` (use the Docker service name)
   - Port: `5432`
   - Database: `createrington_db`
   - Username: `postgres`
   - Password: `postgres`

### Database Management Commands

```bash
# Start database
npm run db:up

# Stop database (keeps data)
npm run db:down

# Reset database (deletes all data and recreates)
npm run db:reset

# View logs
npm run db:logs

# Access database shell
npm run db:shell
```

---

## Discord Configuration

### 1. Scrape Discord Server Data

The bot needs information about Discord roles, channels, and categories.

**⚠️ You must be in the Discord server with appropriate permissions!**

```bash
npm run scrape-discord
```

This command:

- Connects to the Discord server
- Extracts roles, channels, and categories
- Saves data to `packages/server/src/config/discord/`
- Generates TypeScript types for Discord entities

You should see output like:

```
✓ Scraped 25 roles
✓ Scraped 40 channels
✓ Scraped 8 categories
✓ Generated discord-entities.json
✓ Generated discord.types.ts
```

### 2. Deploy Slash Commands

Register the bot's slash commands with Discord:

```bash
npm run deploy-commands
```

This registers commands like `/admin`, `/balance`, `/playtime`, etc.

---

## Running the Project

### Full Setup (First Time Only)

Run the complete setup sequence:

```bash
npm run setup
```

This command:

1. Scrapes Discord server data
2. Starts the database
3. Runs type checking to verify everything compiles

### Development Mode

**Option 1: Run Both Server and Client**

```bash
npm run dev
```

This starts:

- **Backend Server** on `http://localhost:3000`
- **Frontend Client** on `http://localhost:5173`

**Option 2: Run Separately**

Terminal 1 (Backend):

```bash
npm run dev:server
```

Terminal 2 (Frontend):

```bash
npm run dev:client
```

### What You Should See

**Backend (Server):**

```
[rcon/index][INFO] Loaded RCON configs for 2 server(s): [ 'cogs', 'test' ]
[discord/bot][INFO] Discord bot logged in as: Createrington#1234
[server][INFO] Express server listening on port 3000
[websocket][INFO] WebSocket server started
```

**Frontend (Client):**

```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Development Workflow

### Project Structure

```
createrington-test/
├── packages/
│   ├── server/          # Backend (Discord bot, API, WebSocket)
│   │   ├── src/
│   │   │   ├── discord/      # Discord bot logic
│   │   │   ├── services/     # Business logic services
│   │   │   ├── db/           # Database queries
│   │   │   ├── config/       # Configuration
│   │   │   └── server.ts     # Entry point
│   │   └── generated/        # Auto-generated database types
│   │
│   ├── client/          # Frontend (React web dashboard)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── App.tsx
│   │   └── index.html
│   │
│   └── shared/          # Shared types and utilities
│       └── src/
│           └── types/
│
├── db/                  # Database files
│   ├── schema/          # SQL schema files
│   ├── data/            # Test data
│   ├── tables/          # Individual table definitions
│   ├── functions/       # Database functions
│   └── docker-compose.yml
│
└── .env                 # Environment variables (not in Git)
```

### Type Generation

Whenever you modify the database schema:

```bash
# 1. Dump the schema from database
npm run dump-schema

# 2. Regenerate TypeScript types
npm run generate
```

This creates type-safe database query functions in `packages/server/generated/`.

### Type Checking

Before committing code, always run:

```bash
npm run typecheck
```

This checks TypeScript types across all packages (server, client, shared).

### Building for Production

```bash
npm run build
```

This:

1. Generates database types
2. Builds shared package
3. Builds client
4. Builds server

---

## Troubleshooting

### Database Connection Errors

**Error:** `password authentication failed for user "postgres"`

**Solutions:**

1. Check `.env` file has correct credentials:

   ```env
   DB_PASSWORD=postgres
   ```

2. Restart the database:

   ```bash
   npm run db:down
   npm run db:up
   ```

3. Check if container is running:

   ```bash
   docker ps
   ```

4. View container logs:
   ```bash
   npm run db:logs
   ```

### Database Not Initializing

**Error:** Schema files not found or initialization errors

**Solution:**

1. Ensure `db/Dockerfile` points to correct files:

   ```dockerfile
   COPY ./schema/init-docker.sql /docker-entrypoint-initdb.d/01-schema.sql
   COPY ./data/test-data.sql /docker-entrypoint-initdb.d/02-test-data.sql
   ```

2. Reset database completely:
   ```bash
   npm run db:down
   docker volume rm db_postgres_data
   npm run db:up
   ```

### Discord Bot Not Connecting

**Error:** `Invalid token` or `Privileged intent provided is not enabled`

**Solutions:**

1. Verify `.env` has correct `DISCORD_BOT_TOKEN`

2. Check Discord Developer Portal:
   - Go to https://discord.com/developers/applications
   - Select your application
   - Enable required intents:
     - ✅ Presence Intent
     - ✅ Server Members Intent
     - ✅ Message Content Intent

3. Regenerate token if compromised

### Port Already in Use

**Error:** `Port 5432 is already in use`

**Solution:**

1. Check what's using the port:

   ```bash
   # Windows
   netstat -ano | findstr :5432

   # Mac/Linux
   lsof -i :5432
   ```

2. Stop the conflicting service or change ports in `docker-compose.yml`

### TypeScript Errors After Database Changes

**Error:** Type errors in database queries

**Solution:**

```bash
# Regenerate types
npm run generate

# Verify types are correct
npm run typecheck
```

---

## Useful Commands

### Database

```bash
npm run db:up           # Start database
npm run db:down         # Stop database
npm run db:reset        # Reset database (delete all data)
npm run db:logs         # View database logs
npm run db:shell        # Open PostgreSQL shell
npm run pgadmin         # Start pgAdmin GUI
npm run dump-schema     # Export database schema
```

### Development

```bash
npm run dev             # Run both client and server
npm run dev:server      # Run only backend
npm run dev:client      # Run only frontend
npm run generate        # Generate database types
npm run typecheck       # Check TypeScript types
npm run build           # Build for production
```

### Discord

```bash
npm run scrape-discord    # Scrape Discord server data
npm run deploy-commands   # Deploy slash commands
```

### Setup & Cleanup

```bash
npm run setup           # Complete setup (scrape + db + typecheck)
npm run shutdown        # Stop all services
```

---

## Next Steps

After completing setup:

1. ✅ Verify Discord bot is online in your server
2. ✅ Test slash commands (e.g., `/ping`, `/admin panel`)
3. ✅ Open the web dashboard at http://localhost:5173
4. ✅ Check database has test data via pgAdmin or db:shell
5. ✅ Review the codebase structure

### Getting Help

- **Discord:** Ask in the development channel
- **Issues:** Check existing GitHub issues or create a new one
- **Documentation:** See `README.md` for additional info

---

## Common Development Tasks

### Adding a New Database Table

1. Create migration SQL file in `db/tables/`
2. Apply to local database manually or via reset
3. Run `npm run dump-schema` to export
4. Run `npm run generate` to update TypeScript types
5. Use generated types in your code

### Adding a New Discord Command

1. Create command file in `packages/server/src/discord/commands/`
2. Implement `SlashCommand` interface
3. Export from `packages/server/src/discord/commands/index.ts`
4. Run `npm run deploy-commands`
5. Test in Discord server

### Modifying Discord Entities

1. Update roles/channels in Discord server
2. Run `npm run scrape-discord`
3. New TypeScript types auto-generated
4. Restart dev server to use new types

---

## Production Deployment

**Coming Soon** - Production deployment guide will be added here.

For now, development setup is complete! 🎉

---

_Last Updated: January 26, 2026_
_Maintained by: Createrington Development Team_
