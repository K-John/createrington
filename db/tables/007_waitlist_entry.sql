CREATE TABLE waitlist_entry (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    discord_name TEXT NOT NULL,
    token TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT uq_waitlist_email UNIQUE (email),
    CONSTRAINT uq_waitlist_discord_name UNIQUE (discord_name)
);

CREATE INDEX idx_waitlist_token ON waitlist_entry(token);
CREATE INDEX ifx_waitlist_submitted_at ON waitlist_entry(submitted_at);