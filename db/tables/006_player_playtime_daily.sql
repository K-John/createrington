CREATE TABLE player_playtime_daily (
    player_minecraft_uuid UUID NOT NULL REFERENCES player(minecraft_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    server_id INTEGER NOT NULL REFERENCES server(id) ON DELETE CASCADE ON UPDATE CASCADE,
    play_date DATE NOT NULL,
    seconds_played BIGINT DEFAULT 0 NOT NULL,

    PRIMARY KEY (player_minecraft_uuid, server_id, play_date)
);

CREATE INDEX idx_player_playtime_daily_date ON player_playtime_daily(play_date);
