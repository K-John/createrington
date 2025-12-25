CREATE TABLE waitlist_entry (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    discord_name TEXT NOT NULL,
    discord_id TEXT,
    token TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Progress tracking
    discord_message_id TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),

    -- Onboarding steps
    joined_discord BOOLEAN DEFAULT FALSE NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    registered BOOLEAN DEFAULT FALSE NOT NULL,
    joined_minecraft BOOLEAN DEFAULT FALSE NOT NULL,

    -- Acceptance metadata
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by TEXT,

    CONSTRAINT uq_waitlist_email UNIQUE (email),
    CONSTRAINT uq_waitlist_discord_name UNIQUE (discord_name),
    CONSTRAINT uq_discord_id UNIQUE (discord_id),
    CONSTRAINT uq_token UNIQUE (token)
);

CREATE INDEX idx_waitlist_token ON waitlist_entry(token);
CREATE INDEX idx_waitlist_submitted_at ON waitlist_entry(submitted_at);
CREATE INDEX idx_waitlist_status ON waitlist_entry(status);
CREATE INDEX idx_waitlist_discord_message_id ON waitlist_entry(discord_message_id);

-- Comments for documentation
COMMENT ON TABLE waitlist_entry IS 'Stores waitlist entries with progress tracking for new player onboarding';
COMMENT ON COLUMN waitlist_entry.discord_message_id IS 'Discord message ID for the admin notification, used to update progress embed';
COMMENT ON COLUMN waitlist_entry.status IS 'Current status: pending (waiting for admin), accepted (invite sent), declined (rejected), completed (fully onboarded)';
COMMENT ON COLUMN waitlist_entry.joined_discord IS 'True when user joins the Discord server';
COMMENT ON COLUMN waitlist_entry.verified IS 'True when user runs /verify command';
COMMENT ON COLUMN waitlist_entry.registered IS 'True when user account is created in the system';
COMMENT ON COLUMN waitlist_entry.joined_minecraft IS 'True when user joins the Minecraft server for the first time';
COMMENT ON COLUMN waitlist_entry.accepted_by IS 'Discord ID of the admin who accepted the entry';