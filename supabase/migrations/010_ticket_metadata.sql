-- supabase_migrations/010_ticket_metadata.sql
ALTER TABLE tickets
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN custom_fields JSONB DEFAULT '{}';
