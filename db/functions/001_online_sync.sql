CREATE OR REPLACE FUNCTION sync_player_online_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Player started a session
    IF NEW.session_start IS NOT NULL THEN
        UPDATE player
        SET online = true,
            last_seen = NOW()
        WHERE uuid = NEW.player_uuid;

    -- Player ended a session
    ELSIF OLD.session_start IS NOT NULL AND NEW.session_start IS NULL THEN
        -- Check if player is still online on any other server
        IF NOT EXISTS (
            SELECT 1 FROM player_playtime
            WHERE player_uuid = NEW.player_uuid
            AND session_start IS NOT NULL
            AND server_id != NEW.server_id  -- Different server, same player
        ) THEN
            UPDATE player
            SET online = false,
                last_seen = NOW()
            WHERE uuid = NEW.player_uuid;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_player_online
AFTER INSERT OR UPDATE ON player_playtime
FOR EACH ROW
EXECUTE FUNCTION sync_player_online_status();