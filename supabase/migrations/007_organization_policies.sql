-- Create new migration: 007_organization_policies.sql

-- Drop the existing policy
DROP POLICY IF EXISTS "Only admins can create organizations" ON organizations;

-- Create new policy for organization creation
CREATE POLICY "New admins can create organizations"
ON organizations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.organization_id IS NULL
  )
);

-- Allow admins to update their own organizations
CREATE POLICY "Admins can update their organizations"
ON organizations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.organization_id = organizations.id
  )
);
