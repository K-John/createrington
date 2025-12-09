CREATE TABLE users (
    -- Primary identity
    id SERIAL PRIMARY KEY,

    -- Minecraft identity (required after registration)
    mc_uuid UUID NOT NULL UNIQUE,
    mc_name TEXT NOT NULL,
    -- Discord identity (required after registration)
    discord_id TEXT NOT NULL UNIQUE,

    -- Financial data
    balance NUMERIC(20,8) DEFAULT 0 NOT NULL,

    -- Status tracking
    is_online BOOLEAN DEFAULT false NOT NULL,
    last_seen TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    session_start TIMESTAMP WITHOUT TIME ZONE,
    total_playtime BIGINT DEFAULT 0 NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT balance_non_negative CHECK (balance >= 0),
    CONSTRAINT playtime_non_negative CHECK (total_playtime >= 0)
);

-- Indexes
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_users_mc_uuid ON users(mc_uuid);
CREATE INDEX idx_users_online ON users(is_online) WHERE is_online = true;

-- Triggers
-- Auto-update updated_at on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();