-- First, clean up any potentially conflicting policies
DROP POLICY IF EXISTS "Allow organization creation" ON organizations;
DROP POLICY IF EXISTS "Allow organization creation by authenticated users" ON organizations;
DROP POLICY IF EXISTS "Users can create memberships" ON user_organization_memberships;
DROP POLICY IF EXISTS "Users can view memberships" ON user_organization_memberships;
DROP POLICY IF EXISTS "Users can update their memberships" ON user_organization_memberships;

-- Ensure the basic organization creation policy exists
CREATE POLICY "Allow organization creation by authenticated users"
ON organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure we have the single comprehensive membership policy
DROP POLICY IF EXISTS "Users can manage their memberships" ON user_organization_memberships;
CREATE POLICY "Users can manage their memberships"
ON user_organization_memberships
FOR ALL
USING (user_id = auth.uid()); 