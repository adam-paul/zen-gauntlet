-- supabase/migrations/011_enhanced_comments.sql
ALTER TABLE comments
ADD COLUMN parent_id UUID REFERENCES comments(id),
ADD COLUMN thread_position INT DEFAULT 0,
ADD COLUMN metadata JSONB DEFAULT '{}',
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'edited', 'deleted'));

CREATE INDEX idx_comments_ticket_parent ON comments(ticket_id, parent_id);
