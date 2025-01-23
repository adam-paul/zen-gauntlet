-- supabase/migrations/012_add_user_id_fk_to_comments.sql

-- Add foreign key from comments.user_id to profiles.id
ALTER TABLE comments
ADD CONSTRAINT fk_comments_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE; 