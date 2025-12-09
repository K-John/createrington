-- Daily playtime for granular queries
CREATE TABLE daily_playtime (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    play_date DATE NOT NULL,
    seconds_played INTEGER DEFAULT 0 NOT NULL,
    PRIMARY KEY (user_id, play_date),
    CONSTRAINT seconds_non_negative CHECK (seconds_played >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_daily_playtime_user_date ON daily_playtime(user_id, play_date DESC);
CREATE INDEX idx_daily_playtime_date ON daily_playtime(play_date DESC);

-- Trigger to keep total_playtime_seconds in sync
CREATE OR REPLACE FUNCTION update_total_playtime()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE users
        SET total_playtime = GREATEST(total_playtime - OLD.seconds_played, 0)
        WHERE id = OLD.user_id;
        RETURN OLD;
    ELSE
        UPDATE users
        SET total_playtime = total_playtime + 
            (NEW.seconds_played - COALESCE(OLD.seconds_played, 0))
        WHERE id = NEW.user_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_playtime
AFTER INSERT OR UPDATE OR DELETE ON daily_playtime
FOR EACH ROW
EXECUTE FUNCTION update_total_playtime();