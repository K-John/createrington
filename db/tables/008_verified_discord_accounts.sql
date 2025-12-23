CREATE TABLE verified_discord_account (
    discord_id TEXT PRIMARY KEY,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);