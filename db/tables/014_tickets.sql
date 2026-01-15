-- ticket System Database Schema

-- Enum for ticket types (easily expandable)
CREATE TYPE ticket_type AS ENUM ('general', 'report');

-- Enum for ticket status
CREATE TYPE ticket_status AS ENUM ('open', 'closed', 'deleted');

-- Main ticket table
CREATE TABLE ticket (
    id SERIAL PRIMARY KEY,
    ticket_number INTEGER NOT NULL, -- Incremental display number
    type ticket_type NOT NULL,
    creator_discord_id TEXT NOT NULL,
    channel_id TEXT NOT NULL UNIQUE,
    status ticket_status NOT NULL DEFAULT 'open',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    closed_by_discord_id TEXT,
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Indexes
    CONSTRAINT ticket_channel_id_unique UNIQUE (channel_id)
);

-- Index for faster lookups
CREATE INDEX idx_ticket_creator ON ticket(creator_discord_id);
CREATE INDEX idx_ticket_channel ON ticket(channel_id);
CREATE INDEX idx_ticket_status ON ticket(status);
CREATE INDEX idx_ticket_type ON ticket(type);

-- Ticket actions log (for audit trail)
CREATE TABLE ticket_action (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES ticket(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'created', 'closed', 'reopened', 'deleted', 'transcript_generated'
    performed_by_discord_id TEXT NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_ticket_action_ticket ON ticket_action(ticket_id);
CREATE INDEX idx_ticket_action_type ON ticket_action(action_type);

-- Sequence for ticket numbers (global counter)
CREATE SEQUENCE ticket_number_seq START 1;

COMMENT ON TABLE ticket IS 'Stores all Discord support ticket with persistence across bot restarts';
COMMENT ON TABLE ticket_action IS 'Audit log of all actions performed on ticket';