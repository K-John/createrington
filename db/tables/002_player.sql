CREATE TABLE player (
    id SERIAL PRIMARY KEY,
    minecraft_uuid UUID UNIQUE NOT NULL,
    minecraft_username TEXT NOT NULL,
    discord_id TEXT NOT NULL,
    online BOOLEAN DEFAULT false NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT uq_player_minecraft_uuid UNIQUE (minecraft_uuid),
    CONSTRAINT uq_player_minecraft_username UNIQUE (minecraft_username),
    CONSTRAINT uq_player_discord_id UNIQUE (discord_id)
);

CREATE INDEX idx_player_discord_id ON player(discord_id);
CREATE INDEX idx_player_minecraft_username ON player(minecraft_username);
CREATE INDEX idx_player_minecraft_uuid ON player(minecraft_uuid);
CREATE INDEX idx_player_online ON player(online) WHERE online = true;
CREATE INDEX idx_player_last_seen ON player(last_seen);

CREATE TRIGGER update_player_updated_at
    BEFORE UPDATE ON player
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();