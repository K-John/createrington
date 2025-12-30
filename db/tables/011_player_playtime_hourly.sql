CREATE TABLE player_playtime_hourly (
    player_minecraft_uuid UUID NOT NULL REFERENCES player(minecraft_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    server_id INTEGER NOT NULL REFERENCES server(id) ON DELETE CASCADE ON UPDATE CASCADE,
    play_hour TIMESTAMP WITH TIME ZONE NOT NULL, 
    seconds_played BIGINT DEFAULT 0 NOT NULL,

    PRIMARY KEY (player_minecraft_uuid, server_id, play_hour)
);

CREATE INDEX idx_player_playtime_hourly_date ON player_playtime_hourly(play_hour);
CREATE INDEX idx_player_playtime_hourly_player_date ON player_playtime_hourly(player_minecraft_uuid, play_hour);