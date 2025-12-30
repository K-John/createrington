CREATE TABLE leaderboard_message (
    id SERIAL PRIMARY KEY,
    leaderboard_type VARCHAR(50) NOT NULL UNIQUE,  -- 'playtime', 'balance', etc.
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    last_refreshed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT uq_leaderboard_type UNIQUE (leaderboard_type)
);

CREATE INDEX idx_leaderboard_type ON leaderboard_message(leaderboard_type);