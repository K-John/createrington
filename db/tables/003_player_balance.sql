CREATE TABLE player_balance (
    player_uuid UUID PRIMARY KEY REFERENCES player(uuid) ON DELETE CASCADE,
    balance NUMERIC(20,8) DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0)
);