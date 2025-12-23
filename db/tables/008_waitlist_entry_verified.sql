CREATE TABLE waitlist_entry_verified (
    discord_id TEXT PRIMARY KEY,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);