-- Drop existing tables
DROP TABLE IF EXISTS player_balance_transaction CASCADE;
DROP TABLE IF EXISTS player_balance CASCADE;

-- Player balance with 3 decimal precision stored as BIGINT
CREATE TABLE player_balance (
    minecraft_uuid UUID PRIMARY KEY,
    balance BIGINT DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0),
    CONSTRAINT fk_player FOREIGN KEY (minecraft_uuid) 
        REFERENCES player(minecraft_uuid) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

COMMENT ON TABLE player_balance IS 'Player balance with 3 decimal precision';
COMMENT ON COLUMN player_balance.balance IS 'Balance in smallest unit (3 decimal places). Divide by 1,000 for display. Example: 1000 = 1.000, 200 = 0.200';

CREATE INDEX idx_player_balance_uuid ON player_balance(minecraft_uuid);
CREATE INDEX idx_player_balance_amount ON player_balance(balance DESC);

-- Transaction log with 3 decimal precision
CREATE TABLE player_balance_transaction (
    id SERIAL PRIMARY KEY,
    player_minecraft_uuid UUID NOT NULL,
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    related_player_uuid UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT fk_player FOREIGN KEY (player_minecraft_uuid) 
        REFERENCES player(minecraft_uuid) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_related_player FOREIGN KEY (related_player_uuid) 
        REFERENCES player(minecraft_uuid) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

COMMENT ON TABLE player_balance_transaction IS 'Complete audit trail of all balance changes with 3 decimal precision';
COMMENT ON COLUMN player_balance_transaction.amount IS 'Amount changed (positive for credit, negative for debit) in smallest unit';
COMMENT ON COLUMN player_balance_transaction.balance_before IS 'Balance before transaction';
COMMENT ON COLUMN player_balance_transaction.balance_after IS 'Balance after transaction';
COMMENT ON COLUMN player_balance_transaction.transaction_type IS 'Type of transaction for categorization';
COMMENT ON COLUMN player_balance_transaction.related_player_uuid IS 'Related player (e.g., sender/receiver in transfers)';
COMMENT ON COLUMN player_balance_transaction.metadata IS 'Additional context (item_id, admin_id, etc.)';

CREATE INDEX idx_balance_transaction_player ON player_balance_transaction(player_minecraft_uuid);
CREATE INDEX idx_balance_transaction_created ON player_balance_transaction(created_at DESC);
CREATE INDEX idx_balance_transaction_type ON player_balance_transaction(transaction_type);
CREATE INDEX idx_balance_transaction_related ON player_balance_transaction(related_player_uuid) WHERE related_player_uuid IS NOT NULL;

-- Triggers
CREATE TRIGGER update_player_balance_updated_at
    BEFORE UPDATE ON player_balance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();