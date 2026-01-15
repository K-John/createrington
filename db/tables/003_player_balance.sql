CREATE TABLE player_balance (
    minecraft_uuid UUID PRIMARY KEY REFERENCES player(minecraft_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    balance NUMERIC(20,8) DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0)
);

CREATE TRIGGER update_player_balance_updated_at
    BEFORE UPDATE ON player_balance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();