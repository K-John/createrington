CREATE TABLE daily_playtime (
    player_minecraft_uuid UUID NOT NULL REFERENCES player(minecraft_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    server_id INTEGER NOT NULL REFERENCES server(id) ON DELETE CASCADE ON UPDATE CASCADE,
    play_date DATE NOT NULL,
    seconds_played BIGINT DEFAULT 0 NOT NULL,

    PRIMARY KEY (player_minecraft_uuid, server_id, play_date)
);

CREATE INDEX idx_daily_playtime_date ON daily_playtime(play_date);