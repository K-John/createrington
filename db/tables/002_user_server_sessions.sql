CREATE TABLE user_server_sessions (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    server_id INTEGER NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT false NOT NULL,
    session_start TIMESTAMP WITHOUT TIME ZONE,
    last_activity TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, server_id)
);

CREATE INDEX idx_user_server_sessions_online ON user_server_sessions(server_id, is_online) 
    WHERE is_online = true;