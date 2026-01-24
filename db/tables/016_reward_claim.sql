-- Reward claim tracking table
CREATE TABLE reward_claim (
    id SERIAL PRIMARY KEY,
    player_minecraft_uuid UUID NOT NULL REFERENCES player(minecraft_uuid) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    amount BIGINT NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Indexes for efficient querying
    CONSTRAINT reward_claim_player_type_claimed UNIQUE (player_minecraft_uuid, reward_type, claimed_at)
);

CREATE INDEX idx_reward_claim_player ON reward_claim(player_minecraft_uuid);
CREATE INDEX idx_reward_claim_type ON reward_claim(reward_type);
CREATE INDEX idx_reward_claim_claimed_at ON reward_claim(claimed_at);
CREATE INDEX idx_reward_claim_player_type ON reward_claim(player_minecraft_uuid, reward_type);