-- Add organization creation policy
DROP POLICY IF EXISTS "Allow organization creation" ON organizations;

CREATE POLICY "Allow organization creation"
ON organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure memberships can be created by authenticated users
DROP POLICY IF EXISTS "Users can create memberships" ON user_organization_memberships;

CREATE POLICY "Users can create memberships"
ON user_organization_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
); 