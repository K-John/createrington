CREATE TABLE admin_log_action (
    id SERIAL PRIMARY KEY,
    admin_discord_id TEXT NOT NULL,
    admin_discord_username TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'UPDATE_PLAYER', "UPDATE_DATABASE", "UPDATE_PLAYTIME",
    target_player_uuid UUID NOT NULL,
    target_player_name TEXT NOT NULL,
    table_name TEXT NOT NULL, -- 'player', 'player_balance', 'player_playtime'
    field_name TEXT NOT NULL, -- e.g., 'name', 'uuid', 'balance', 'total_seconds'
    old_value TEXT, -- Stored as JSON string for complex types
    new_value TEXT, -- Stored as JSON string for complex types
    reason TEXT, -- Admin's reason for the change
    server_id INTEGER REFERENCES server(id) ON DELETE CASCADE, -- For playtime changes
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    metadata JSONB -- Additional conext (IP, command, used, etc.)
);

CREATE INDEX idx_log_actions_admin ON admin_log_action(admin_discord_id);
CREATE INDEX idx_log_actions_target ON admin_log_action(target_player_uuid);
CREATE INDEX idx_log_actions_performed_at ON admin_log_action(performed_at DESC);
CREATE INDEX idx_log_actions_action_type ON admin_log_action(action_type);
CREATE INDEX idx_log_actions_table_name ON admin_log_action(table_name);

-- View for easy audit log reading
CREATE VIEW admin_log_action_readable AS
SELECT 
    al.id,
    al.admin_discord_username,
    al.action_type,
    al.target_player_name,
    al.table_name,
    al.field_name,
    al.old_value,
    al.new_value,
    al.reason,
    s.name as server_name,
    al.performed_at,
    al.metadata
FROM admin_log_action al
LEFT JOIN server s ON al.server_id = s.id
ORDER BY al.performed_at DESC;