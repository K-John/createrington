CREATE TABLE player_playtime_summary (
    player_minecraft_uuid UUID NOT NULL REFERENCES player(minecraft_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    server_id INTEGER NOT NULL REFERENCES server(id) ON DELETE CASCADE ON UPDATE CASCADE,
    total_seconds BIGINT DEFAULT 0 NOT NULL,
    total_sessions INTEGER DEFAULT 0 NOT NULL,
    first_seen TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE,
    avg_session_seconds BIGINT GENERATED ALWAYS AS (
        CASE WHEN total_sessions > 0 THEN total_seconds / total_sessions ELSE 0 END
    ) STORED,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    PRIMARY KEY (player_minecraft_uuid, server_id)
);

CREATE INDEX idx_player_playtime_summary_total ON player_playtime_summary(total_seconds DESC);