CREATE TABLE player (
    uuid UUID PRIMARY KEY,
    name TEXT NOT NULL,
    discord_id TEXT NOT NULL,
    online BOOLEAN DEFAULT false NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT uq_player_name UNIQUE (name),
    CONSTRAINT uq_player_discord_id UNIQUE (discord_id)
);

CREATE INDEX idx_player_discord_id ON player(discord_id);
CREATE INDEX idx_player_minecraft_name ON player(name);
CREATE INDEX idx_player_online ON player(online) WHERE online = true;
CREATE INDEX idx_player_last_seen ON player(last_seen);