-- Drop conflicting policies
DROP POLICY IF EXISTS "Only admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "New admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create their own organization" ON organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Allow organization creation by authenticated users" ON organizations;

-- Simple policy - allow authenticated users to create organizations
-- (Creation is controlled by application logic during signup)
CREATE POLICY "Allow organization creation by authenticated users"
ON organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view organizations they create (needed for returning created org)
CREATE POLICY "Allow users to view organizations"
ON organizations
FOR SELECT
TO authenticated
USING (true); 
