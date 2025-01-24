-- Fix admin comment permissions to properly handle organization scope
DROP POLICY IF EXISTS "Comment access policy" ON comments;

CREATE POLICY "Comment access policy"
ON comments FOR INSERT
WITH CHECK (
  -- Admin can comment on any ticket in their organizations
  EXISTS (
    SELECT 1 
    FROM user_organization_memberships m
    JOIN tickets t ON t.organization_id = m.organization_id
    WHERE m.user_id = auth.uid()
      AND m.user_role = 'admin'
      AND t.id = ticket_id
  )
  OR
  -- Regular users can comment on their own tickets or tickets assigned to them
  EXISTS (
    SELECT 1 
    FROM tickets 
    WHERE tickets.id = ticket_id 
      AND (tickets.created_by = auth.uid() OR tickets.assigned_to = auth.uid())
  )
); 