CREATE TABLE discord_guild_member_leave (
    id SERIAL PRIMARY KEY,
    discord_id TEXT NOT NULL UNIQUE,
    minecraft_uuid UUID NOT NULL,
    minecraft_username TEXT NOT NULL,
    departed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    notification_message_id TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_discord_guild_member_leave_discord_id ON discord_guild_member_leave(discord_id);
CREATE INDEX idx_discord_guild_member_leave_departed_at ON discord_guild_member_leave(departed_at);
CREATE INDEX idx_discord_guild_member_leave_deleted_at ON discord_guild_member_leave(departed_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_discord_guild_member_leave_minecraft_uuid ON discord_guild_member_leave(minecraft_uuid);