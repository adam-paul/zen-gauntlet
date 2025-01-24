-- supabase/migrations/022_profile_avatar.sql
ALTER TABLE profiles 
ADD COLUMN avatar_url TEXT;

CREATE POLICY "Users can update their avatar"
ON profiles FOR UPDATE
USING (auth.uid() = id);
