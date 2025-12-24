CREATE OR REPLACE FUNCTION cleanup_old_waitlist_entries()
RETURNS void AS $$
BEGIN
    DELETE FROM waitlist_entry
    WHERE submitted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;