CREATE TABLE admin (
    discord_id TEXT PRIMARY KEY REFERENCES player(discord_id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    vanished BOOLEAN DEFAULT false
);