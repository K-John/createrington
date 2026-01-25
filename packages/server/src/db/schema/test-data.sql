-- init.sql - Test data for Minecraft server Discord bot database

-- Clean up existing data (in correct order due to foreign keys)
TRUNCATE TABLE admin_log_action CASCADE;
TRUNCATE TABLE player_session CASCADE;
TRUNCATE TABLE player_playtime_hourly CASCADE;
TRUNCATE TABLE player_playtime_daily CASCADE;
TRUNCATE TABLE player_playtime_summary CASCADE;
TRUNCATE TABLE player_balance CASCADE;
TRUNCATE TABLE admin CASCADE;
TRUNCATE TABLE waitlist_entry CASCADE;
TRUNCATE TABLE discord_guild_member_join CASCADE;
TRUNCATE TABLE player CASCADE;
TRUNCATE TABLE server CASCADE;

-- Reset sequences
ALTER SEQUENCE server_id_seq RESTART WITH 1;
ALTER SEQUENCE player_id_seq RESTART WITH 1;
ALTER SEQUENCE player_session_id_seq RESTART WITH 1;
ALTER SEQUENCE waitlist_entry_id_seq RESTART WITH 1;
ALTER SEQUENCE discord_guild_member_join_join_number_seq RESTART WITH 1;
ALTER SEQUENCE admin_log_action_id_seq RESTART WITH 1;

-- ============================================================================
-- SERVERS
-- ============================================================================

INSERT INTO server (name, identifier, created_at) VALUES
('Cogs SMP', 'cogs', NOW() - INTERVAL '6 months'),
('Test Server', 'test', NOW() - INTERVAL '3 months');

-- ============================================================================
-- PLAYERS
-- ============================================================================

INSERT INTO player (minecraft_uuid, minecraft_username, discord_id, online, last_seen, created_at, current_server_id) VALUES
-- Active players (online now)
('550e8400-e29b-41d4-a716-446655440001', 'Steve', '123456789012345678', true, NOW(), NOW() - INTERVAL '90 days', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Alex', '123456789012345679', true, NOW(), NOW() - INTERVAL '85 days', 1),
('550e8400-e29b-41d4-a716-446655440003', 'Notch', '123456789012345680', true, NOW(), NOW() - INTERVAL '80 days', 1),

-- Recently active players (offline)
('550e8400-e29b-41d4-a716-446655440004', 'Herobrine', '123456789012345681', false, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '75 days', NULL),
('550e8400-e29b-41d4-a716-446655440005', 'Jeb', '123456789012345682', false, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '70 days', NULL),
('550e8400-e29b-41d4-a716-446655440006', 'Dream', '123456789012345683', false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '65 days', NULL),

-- Regular players
('550e8400-e29b-41d4-a716-446655440007', 'Technoblade', '123456789012345684', false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '60 days', NULL),
('550e8400-e29b-41d4-a716-446655440008', 'Philza', '123456789012345685', false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '55 days', NULL),
('550e8400-e29b-41d4-a716-446655440009', 'Mumbo', '123456789012345686', false, NOW() - INTERVAL '7 days', NOW() - INTERVAL '50 days', NULL),
('550e8400-e29b-41d4-a716-446655440010', 'Grian', '123456789012345687', false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '45 days', NULL),

-- Inactive players
('550e8400-e29b-41d4-a716-446655440011', 'Scar', '123456789012345688', false, NOW() - INTERVAL '30 days', NOW() - INTERVAL '40 days', NULL),
('550e8400-e29b-41d4-a716-446655440012', 'Iskall', '123456789012345689', false, NOW() - INTERVAL '45 days', NOW() - INTERVAL '35 days', NULL),

-- New players (joined recently)
('550e8400-e29b-41d4-a716-446655440013', 'Newbie1', '123456789012345690', false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NULL),
('550e8400-e29b-41d4-a716-446655440014', 'Newbie2', '123456789012345691', false, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 day', NULL);

-- ============================================================================
-- PLAYER BALANCES
-- ============================================================================

INSERT INTO player_balance (player_uuid, balance, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1250.50000000, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 3420.75000000, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 8999.99000000, NOW()),
('550e8400-e29b-41d4-a716-446655440004', 567.25000000, NOW()),
('550e8400-e29b-41d4-a716-446655440005', 2100.00000000, NOW()),
('550e8400-e29b-41d4-a716-446655440006', 4567.80000000, NOW()),
('550e8400-e29b-41d4-a716-446655440007', 6789.50000000, NOW()),
('550e8400-e29b-41d4-a716-446655440008', 3210.25000000, NOW()),
('550e8400-e29b-41d4-a716-446655440009', 1890.00000000, NOW()),
('550e8400-e29b-41d4-a716-446655440010', 2345.60000000, NOW()),
('550e8400-e29b-41d4-a716-446655440011', 890.00000000, NOW()),
('550e8400-e29b-41d4-a716-446655440012', 450.50000000, NOW()),
('550e8400-e29b-41d4-a716-446655440013', 100.00000000, NOW()),
('550e8400-e29b-41d4-a716-446655440014', 50.00000000, NOW());

-- ============================================================================
-- ADMINS
-- ============================================================================

INSERT INTO admin (discord_id, created_at, vanished) VALUES
('123456789012345678', NOW() - INTERVAL '90 days', false),  -- Steve
('123456789012345680', NOW() - INTERVAL '80 days', false),  -- Notch
('123456789012345684', NOW() - INTERVAL '60 days', true);   -- Technoblade (vanished)

-- ============================================================================
-- PLAYER SESSIONS (Historical + Current)
-- ============================================================================

-- Helper function to generate sessions over the past 30 days
DO $$
DECLARE
    player_uuid UUID;
    player_name TEXT;
    day_offset INT;
    session_count INT;
    session_start TIMESTAMP WITH TIME ZONE;
    session_duration INT;
BEGIN
    -- Generate sessions for active players
    FOR player_uuid, player_name IN 
        SELECT minecraft_uuid, minecraft_username 
        FROM player 
        WHERE minecraft_username IN ('Steve', 'Alex', 'Notch', 'Herobrine', 'Jeb', 'Dream')
    LOOP
        -- Generate sessions over the past 30 days
        FOR day_offset IN 0..29 LOOP
            -- Random number of sessions per day (0-3)
            session_count := floor(random() * 4)::INT;
            
            FOR i IN 1..session_count LOOP
                -- Random session start time during the day
                session_start := (NOW() - INTERVAL '1 day' * day_offset) + 
                                (random() * INTERVAL '20 hours') + 
                                INTERVAL '6 hours';
                
                -- Random session duration (15 min to 6 hours)
                session_duration := (900 + floor(random() * 20700))::INT;
                
                INSERT INTO player_session (
                    player_minecraft_uuid, 
                    server_id, 
                    session_start, 
                    session_end
                ) VALUES (
                    player_uuid,
                    1, -- Cogs server
                    session_start,
                    session_start + (session_duration || ' seconds')::INTERVAL
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Add some active sessions (currently online players)
INSERT INTO player_session (player_minecraft_uuid, server_id, session_start, session_end) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, NOW() - INTERVAL '2 hours', NULL),  -- Steve online for 2 hours
('550e8400-e29b-41d4-a716-446655440002', 1, NOW() - INTERVAL '45 minutes', NULL),  -- Alex online for 45 min
('550e8400-e29b-41d4-a716-446655440003', 1, NOW() - INTERVAL '3 hours', NULL);  -- Notch online for 3 hours

-- Add a few sessions for other players
INSERT INTO player_session (player_minecraft_uuid, server_id, session_start, session_end)
SELECT 
    minecraft_uuid,
    1,
    NOW() - (random() * INTERVAL '7 days'),
    NOW() - (random() * INTERVAL '7 days') + (random() * INTERVAL '4 hours')
FROM player
WHERE minecraft_username IN ('Technoblade', 'Philza', 'Mumbo', 'Grian', 'Scar', 'Iskall')
ORDER BY random()
LIMIT 20;

-- ============================================================================
-- DISCORD GUILD MEMBER JOINS
-- ============================================================================

INSERT INTO discord_guild_member_join (user_id, username, joined_at) VALUES
('123456789012345678', 'steve_official', NOW() - INTERVAL '90 days'),
('123456789012345679', 'alex_plays', NOW() - INTERVAL '85 days'),
('123456789012345680', 'notch', NOW() - INTERVAL '80 days'),
('123456789012345681', 'herobrine_legend', NOW() - INTERVAL '75 days'),
('123456789012345682', 'jeb_', NOW() - INTERVAL '70 days'),
('123456789012345683', 'dream', NOW() - INTERVAL '65 days'),
('123456789012345684', 'technoblade', NOW() - INTERVAL '60 days'),
('123456789012345685', 'philza', NOW() - INTERVAL '55 days'),
('123456789012345686', 'mumbojumbo', NOW() - INTERVAL '50 days'),
('123456789012345687', 'grian', NOW() - INTERVAL '45 days'),
('123456789012345688', 'goodtimeswithscar', NOW() - INTERVAL '40 days'),
('123456789012345689', 'iskall85', NOW() - INTERVAL '35 days'),
('123456789012345690', 'newplayer1', NOW() - INTERVAL '2 days'),
('123456789012345691', 'newplayer2', NOW() - INTERVAL '1 day');

-- ============================================================================
-- WAITLIST ENTRIES
-- ============================================================================

INSERT INTO waitlist_entry (
    email, 
    discord_name, 
    discord_id, 
    token, 
    submitted_at, 
    discord_message_id, 
    status, 
    joined_discord, 
    verified, 
    registered, 
    joined_minecraft,
    accepted_at,
    accepted_by
) VALUES
-- Completed entries
('steve@example.com', 'steve_official', '123456789012345678', 'token_steve_001', NOW() - INTERVAL '91 days', '111111111111111111', 'completed', true, true, true, true, NOW() - INTERVAL '90 days', '123456789012345680'),
('alex@example.com', 'alex_plays', '123456789012345679', 'token_alex_002', NOW() - INTERVAL '86 days', '111111111111111112', 'completed', true, true, true, true, NOW() - INTERVAL '85 days', '123456789012345680'),

-- Accepted, in progress
('newbie1@example.com', 'newplayer1', '123456789012345690', 'token_new1_013', NOW() - INTERVAL '3 days', '111111111111111113', 'accepted', true, true, true, false, NOW() - INTERVAL '2 days', '123456789012345678'),
('newbie2@example.com', 'newplayer2', '123456789012345691', 'token_new2_014', NOW() - INTERVAL '2 days', '111111111111111114', 'accepted', true, false, false, false, NOW() - INTERVAL '1 day', '123456789012345678'),

-- Pending entries
('pending1@example.com', 'pending_user1', NULL, 'token_pend_015', NOW() - INTERVAL '5 hours', '111111111111111115', 'pending', false, false, false, false, NULL, NULL),
('pending2@example.com', 'pending_user2', NULL, 'token_pend_016', NOW() - INTERVAL '2 hours', '111111111111111116', 'pending', false, false, false, false, NULL, NULL),
('pending3@example.com', 'pending_user3', NULL, 'token_pend_017', NOW() - INTERVAL '30 minutes', '111111111111111117', 'pending', false, false, false, false, NULL, NULL),

-- Declined entry
('declined@example.com', 'declined_user', NULL, 'token_decl_018', NOW() - INTERVAL '10 days', '111111111111111118', 'declined', false, false, false, false, NULL, NULL);

-- ============================================================================
-- ADMIN LOG ACTIONS
-- ============================================================================

INSERT INTO admin_log_action (
    admin_discord_id,
    admin_discord_username,
    action_type,
    target_player_uuid,
    target_player_name,
    table_name,
    field_name,
    old_value,
    new_value,
    reason,
    server_id,
    performed_at,
    metadata
) VALUES
-- Player edits
('123456789012345678', 'steve_official', 'player_edit', '550e8400-e29b-41d4-a716-446655440004', 'Herobrine', 'player', 'minecraft_username', 'Hero_Brine', 'Herobrine', 'Username format correction', 1, NOW() - INTERVAL '5 days', '{"approved_by": "admin_team"}'),
('123456789012345680', 'notch', 'player_edit', '550e8400-e29b-41d4-a716-446655440005', 'Jeb', 'player', 'discord_id', '999999999999999999', '123456789012345682', 'Discord ID correction', 1, NOW() - INTERVAL '10 days', NULL),

-- Balance adjustments
('123456789012345678', 'steve_official', 'balance_adjustment', '550e8400-e29b-41d4-a716-446655440002', 'Alex', 'player_balance', 'balance', '3000.75', '3420.75', 'Competition prize', 1, NOW() - INTERVAL '3 days', '{"event": "build_competition", "prize_tier": "1st_place"}'),
('123456789012345680', 'notch', 'balance_adjustment', '550e8400-e29b-41d4-a716-446655440007', 'Technoblade', 'player_balance', 'balance', '6500.00', '6789.50', 'Quest completion bonus', 1, NOW() - INTERVAL '7 days', '{"quest_id": "dragon_slayer"}'),

-- Waitlist actions
('123456789012345678', 'steve_official', 'waitlist_accept', '550e8400-e29b-41d4-a716-446655440013', 'Newbie1', 'waitlist_entry', 'status', 'pending', 'accepted', 'Application approved', NULL, NOW() - INTERVAL '2 days', '{"application_score": 95}'),
('123456789012345678', 'steve_official', 'waitlist_accept', '550e8400-e29b-41d4-a716-446655440014', 'Newbie2', 'waitlist_entry', 'status', 'pending', 'accepted', 'Good application', NULL, NOW() - INTERVAL '1 day', '{"application_score": 88}'),

-- Administrative actions
('123456789012345680', 'notch', 'admin_grant', '550e8400-e29b-41d4-a716-446655440001', 'Steve', 'admin', 'discord_id', NULL, '123456789012345678', 'Promoted to admin', NULL, NOW() - INTERVAL '90 days', '{"role": "moderator"}'),
('123456789012345680', 'notch', 'player_edit', '550e8400-e29b-41d4-a716-446655440008', 'Philza', 'player', 'minecraft_username', 'Ph1lza', 'Philza', 'Name change approved', 1, NOW() - INTERVAL '15 days', NULL);

-- ============================================================================
-- VERIFY DATA INTEGRITY
-- ============================================================================

-- Check that triggers worked correctly for playtime aggregates
DO $$
DECLARE
    summary_count INT;
    daily_count INT;
    hourly_count INT;
BEGIN
    SELECT COUNT(*) INTO summary_count FROM player_playtime_summary;
    SELECT COUNT(*) INTO daily_count FROM player_playtime_daily;
    SELECT COUNT(*) INTO hourly_count FROM player_playtime_hourly;
    
    RAISE NOTICE 'Data generation complete!';
    RAISE NOTICE 'Summary records: %', summary_count;
    RAISE NOTICE 'Daily records: %', daily_count;
    RAISE NOTICE 'Hourly records: %', hourly_count;
    RAISE NOTICE 'Active sessions: %', (SELECT COUNT(*) FROM player_session WHERE session_end IS NULL);
    RAISE NOTICE 'Completed sessions: %', (SELECT COUNT(*) FROM player_session WHERE session_end IS NOT NULL);
END $$;

-- Show some sample stats
SELECT 
    p.minecraft_username,
    pps.total_sessions,
    ROUND(pps.total_seconds / 3600.0, 2) AS total_hours,
    ROUND(pps.avg_session_seconds / 60.0, 2) AS avg_session_minutes
FROM player_playtime_summary pps
JOIN player p ON p.minecraft_uuid = pps.player_minecraft_uuid
WHERE pps.server_id = 1
ORDER BY pps.total_seconds DESC
LIMIT 10;