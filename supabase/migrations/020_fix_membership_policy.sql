-- Drop the existing policy
DROP POLICY IF EXISTS "Users can manage their memberships" ON user_organization_memberships;

-- Create a fixed version that includes WITH CHECK for INSERT operations
CREATE POLICY "Users can manage their memberships"
ON user_organization_memberships
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid()); 