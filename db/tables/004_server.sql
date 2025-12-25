CREATE TABLE server (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    identifier TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

INSERT INTO server (name, identifier) VALUES ('Cogs & Steam', 'cogs');