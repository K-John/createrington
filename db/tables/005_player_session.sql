CREATE TABLE player_session (
    id SERIAL PRIMARY KEY,
    player_minecraft_uuid UUID NOT NULL REFERENCES player(minecraft_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    server_id INTEGER NOT NULL REFERENCES server(id) ON DELETE CASCADE ON UPDATE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    seconds_played BIGINT GENERATED ALWAYS AS (
        CASE 
            WHEN session_end IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (session_end - session_start))::BIGINT
            ELSE NULL
        END
    ) STORED,
    
    CONSTRAINT chk_session_end_after_start CHECK (session_end IS NULL OR session_end >= session_start)
);

CREATE INDEX idx_player_session_player ON player_session(player_minecraft_uuid);
CREATE INDEX idx_player_session_server ON player_session(server_id);
CREATE INDEX idx_player_session_start ON player_session(session_start);
CREATE INDEX idx_player_session_active ON player_session(player_minecraft_uuid, server_id) WHERE session_end IS NULL;
CREATE INDEX idx_player_session_date_range ON player_session(player_minecraft_uuid, session_start, session_end);