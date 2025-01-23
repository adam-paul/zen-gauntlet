-- Drop any existing comment policies
DROP POLICY IF EXISTS "Comment access policy" ON comments;

-- Create new policy that allows:
-- 1. Admins to comment on any ticket
-- 2. Regular users to comment on their own tickets
CREATE POLICY "Comment access policy"
ON comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      role = 'admin' 
      OR EXISTS (
        SELECT 1 FROM tickets 
        WHERE tickets.id = comments.ticket_id 
        AND tickets.created_by = auth.uid()
      )
    )
  )
); 