CREATE TABLE player_playtime (
    player_uuid UUID NOT NULL REFERENCES player(minecraft_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    server_id INTEGER NOT NULL REFERENCES server(id) ON DELETE CASCADE ON UPDATE CASCADE,
    total_seconds BIGINT DEFAULT 0 NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    PRIMARY KEY (player_uuid, server_id),
    CONSTRAINT chk_playtime_non_negative CHECK (total_seconds >= 0)
);

CREATE INDEX idx_player_playtime_server ON player_playtime(server_id);

CREATE TRIGGER update_player_playtime_updated_at
    BEFORE UPDATE ON player_playtime
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();