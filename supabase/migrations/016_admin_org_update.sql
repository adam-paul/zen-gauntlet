-- Update admin check to use memberships
DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;
CREATE POLICY "Admins can update their organizations"
ON organizations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_organization_memberships
    WHERE user_organization_memberships.organization_id = organizations.id
    AND user_organization_memberships.user_id = auth.uid()
    AND user_organization_memberships.user_role = 'admin'
  )
);
