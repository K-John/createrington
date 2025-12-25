--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 15.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cleanup_old_waitlist_entries(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_old_waitlist_entries() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM waitlist_entry
    WHERE submitted_at < NOW() - INTERVAL '30 days';
END;
$$;


ALTER FUNCTION public.cleanup_old_waitlist_entries() OWNER TO postgres;

--
-- Name: sync_player_online_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_player_online_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Player started a session
    IF NEW.session_start IS NOT NULL THEN
        UPDATE player
        SET online = true,
            last_seen = NOW()
        WHERE uuid = NEW.player_uuid;

    -- Player ended a session
    ELSIF OLD.session_start IS NOT NULL AND NEW.session_start IS NULL THEN
        -- Check if player is still online on any other server
        IF NOT EXISTS (
            SELECT 1 FROM player_playtime
            WHERE player_uuid = NEW.player_uuid
            AND session_start IS NOT NULL
            AND server_id != NEW.server_id  -- Different server, same player
        ) THEN
            UPDATE player
            SET online = false,
                last_seen = NOW()
            WHERE uuid = NEW.player_uuid;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.sync_player_online_status() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    discord_id text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    vanished boolean DEFAULT false
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- Name: daily_playtime; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_playtime (
    player_uuid uuid NOT NULL,
    server_id integer NOT NULL,
    play_date date NOT NULL,
    seconds_played bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.daily_playtime OWNER TO postgres;

--
-- Name: guild_member_join; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guild_member_join (
    join_number integer NOT NULL,
    user_id character varying(32) NOT NULL,
    username character varying(32) NOT NULL,
    joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.guild_member_join OWNER TO postgres;

--
-- Name: TABLE guild_member_join; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.guild_member_join IS 'Tracks guild member join order with persistent sequential numbers';


--
-- Name: COLUMN guild_member_join.join_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.guild_member_join.join_number IS 'Unique sequential number assigned to each member (shown in welcome image)';


--
-- Name: COLUMN guild_member_join.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.guild_member_join.user_id IS 'Discord user snowflake ID';


--
-- Name: COLUMN guild_member_join.username; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.guild_member_join.username IS 'Username at the time of joining (for historical reference)';


--
-- Name: COLUMN guild_member_join.joined_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.guild_member_join.joined_at IS 'Timestamp when the member joined the guild';


--
-- Name: guild_member_join_join_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guild_member_join_join_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.guild_member_join_join_number_seq OWNER TO postgres;

--
-- Name: guild_member_join_join_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guild_member_join_join_number_seq OWNED BY public.guild_member_join.join_number;


--
-- Name: player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player (
    uuid uuid NOT NULL,
    name text NOT NULL,
    discord_id text NOT NULL,
    online boolean DEFAULT false NOT NULL,
    last_seen timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.player OWNER TO postgres;

--
-- Name: player_balance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_balance (
    player_uuid uuid NOT NULL,
    balance numeric(20,8) DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_balance_non_negative CHECK ((balance >= (0)::numeric))
);


ALTER TABLE public.player_balance OWNER TO postgres;

--
-- Name: player_playtime; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_playtime (
    player_uuid uuid NOT NULL,
    server_id integer NOT NULL,
    total_seconds bigint DEFAULT 0 NOT NULL,
    session_start timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_playtime_non_negative CHECK ((total_seconds >= 0))
);


ALTER TABLE public.player_playtime OWNER TO postgres;

--
-- Name: server; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server (
    id integer NOT NULL,
    name text NOT NULL,
    identifier text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.server OWNER TO postgres;

--
-- Name: server_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.server_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.server_id_seq OWNER TO postgres;

--
-- Name: server_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.server_id_seq OWNED BY public.server.id;


--
-- Name: waitlist_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.waitlist_entry (
    id integer NOT NULL,
    email text NOT NULL,
    discord_name text NOT NULL,
    discord_id text,
    token text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    discord_message_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    joined_discord boolean DEFAULT false NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    registered boolean DEFAULT false NOT NULL,
    joined_minecraft boolean DEFAULT false NOT NULL,
    accepted_at timestamp with time zone,
    accepted_by text,
    CONSTRAINT waitlist_entry_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'completed'::text])))
);


ALTER TABLE public.waitlist_entry OWNER TO postgres;

--
-- Name: TABLE waitlist_entry; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.waitlist_entry IS 'Stores waitlist entries with progress tracking for new player onboarding';


--
-- Name: COLUMN waitlist_entry.discord_message_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.waitlist_entry.discord_message_id IS 'Discord message ID for the admin notification, used to update progress embed';


--
-- Name: COLUMN waitlist_entry.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.waitlist_entry.status IS 'Current status: pending (waiting for admin), accepted (invite sent), declined (rejected), completed (fully onboarded)';


--
-- Name: COLUMN waitlist_entry.joined_discord; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.waitlist_entry.joined_discord IS 'True when user joins the Discord server';


--
-- Name: COLUMN waitlist_entry.verified; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.waitlist_entry.verified IS 'True when user runs /verify command';


--
-- Name: COLUMN waitlist_entry.registered; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.waitlist_entry.registered IS 'True when user account is created in the system';


--
-- Name: COLUMN waitlist_entry.joined_minecraft; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.waitlist_entry.joined_minecraft IS 'True when user joins the Minecraft server for the first time';


--
-- Name: COLUMN waitlist_entry.accepted_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.waitlist_entry.accepted_by IS 'Discord ID of the admin who accepted the entry';


--
-- Name: waitlist_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.waitlist_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.waitlist_entry_id_seq OWNER TO postgres;

--
-- Name: waitlist_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.waitlist_entry_id_seq OWNED BY public.waitlist_entry.id;


--
-- Name: guild_member_join join_number; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guild_member_join ALTER COLUMN join_number SET DEFAULT nextval('public.guild_member_join_join_number_seq'::regclass);


--
-- Name: server id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server ALTER COLUMN id SET DEFAULT nextval('public.server_id_seq'::regclass);


--
-- Name: waitlist_entry id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist_entry ALTER COLUMN id SET DEFAULT nextval('public.waitlist_entry_id_seq'::regclass);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (discord_id);


--
-- Name: daily_playtime daily_playtime_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_playtime
    ADD CONSTRAINT daily_playtime_pkey PRIMARY KEY (player_uuid, server_id, play_date);


--
-- Name: guild_member_join guild_member_join_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guild_member_join
    ADD CONSTRAINT guild_member_join_pkey PRIMARY KEY (join_number);


--
-- Name: guild_member_join idx_user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guild_member_join
    ADD CONSTRAINT idx_user_id UNIQUE (user_id);


--
-- Name: player_balance player_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_balance
    ADD CONSTRAINT player_balance_pkey PRIMARY KEY (player_uuid);


--
-- Name: player player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_pkey PRIMARY KEY (uuid);


--
-- Name: player_playtime player_playtime_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_playtime
    ADD CONSTRAINT player_playtime_pkey PRIMARY KEY (player_uuid, server_id);


--
-- Name: server server_identifier_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server
    ADD CONSTRAINT server_identifier_key UNIQUE (identifier);


--
-- Name: server server_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server
    ADD CONSTRAINT server_name_key UNIQUE (name);


--
-- Name: server server_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server
    ADD CONSTRAINT server_pkey PRIMARY KEY (id);


--
-- Name: waitlist_entry uq_discord_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist_entry
    ADD CONSTRAINT uq_discord_id UNIQUE (discord_id);


--
-- Name: player uq_player_discord_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT uq_player_discord_id UNIQUE (discord_id);


--
-- Name: player uq_player_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT uq_player_name UNIQUE (name);


--
-- Name: waitlist_entry uq_waitlist_discord_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist_entry
    ADD CONSTRAINT uq_waitlist_discord_name UNIQUE (discord_name);


--
-- Name: waitlist_entry uq_waitlist_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist_entry
    ADD CONSTRAINT uq_waitlist_email UNIQUE (email);


--
-- Name: waitlist_entry waitlist_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist_entry
    ADD CONSTRAINT waitlist_entry_pkey PRIMARY KEY (id);


--
-- Name: idx_daily_playtime_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_daily_playtime_date ON public.daily_playtime USING btree (play_date);


--
-- Name: idx_guild_member_join_joined_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guild_member_join_joined_at ON public.guild_member_join USING btree (joined_at DESC);


--
-- Name: idx_player_discord_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_player_discord_id ON public.player USING btree (discord_id);


--
-- Name: idx_player_last_seen; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_player_last_seen ON public.player USING btree (last_seen);


--
-- Name: idx_player_minecraft_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_player_minecraft_name ON public.player USING btree (name);


--
-- Name: idx_player_online; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_player_online ON public.player USING btree (online) WHERE (online = true);


--
-- Name: idx_player_playtime_server; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_player_playtime_server ON public.player_playtime USING btree (server_id);


--
-- Name: idx_waitlist_discord_message_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_waitlist_discord_message_id ON public.waitlist_entry USING btree (discord_message_id);


--
-- Name: idx_waitlist_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_waitlist_status ON public.waitlist_entry USING btree (status);


--
-- Name: idx_waitlist_submitted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_waitlist_submitted_at ON public.waitlist_entry USING btree (submitted_at);


--
-- Name: idx_waitlist_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_waitlist_token ON public.waitlist_entry USING btree (token);


--
-- Name: player_playtime trigger_sync_player_online; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_sync_player_online AFTER INSERT OR UPDATE ON public.player_playtime FOR EACH ROW EXECUTE FUNCTION public.sync_player_online_status();


--
-- Name: player_balance update_player_balance_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_player_balance_updated_at BEFORE UPDATE ON public.player_balance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: player_playtime update_player_playtime_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_player_playtime_updated_at BEFORE UPDATE ON public.player_playtime FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: player update_player_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_player_updated_at BEFORE UPDATE ON public.player FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin admin_discord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_discord_id_fkey FOREIGN KEY (discord_id) REFERENCES public.player(discord_id);


--
-- Name: daily_playtime daily_playtime_player_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_playtime
    ADD CONSTRAINT daily_playtime_player_uuid_fkey FOREIGN KEY (player_uuid) REFERENCES public.player(uuid) ON DELETE CASCADE;


--
-- Name: daily_playtime daily_playtime_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_playtime
    ADD CONSTRAINT daily_playtime_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.server(id) ON DELETE CASCADE;


--
-- Name: player_balance player_balance_player_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_balance
    ADD CONSTRAINT player_balance_player_uuid_fkey FOREIGN KEY (player_uuid) REFERENCES public.player(uuid) ON DELETE CASCADE;


--
-- Name: player_playtime player_playtime_player_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_playtime
    ADD CONSTRAINT player_playtime_player_uuid_fkey FOREIGN KEY (player_uuid) REFERENCES public.player(uuid) ON DELETE CASCADE;


--
-- Name: player_playtime player_playtime_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_playtime
    ADD CONSTRAINT player_playtime_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.server(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

