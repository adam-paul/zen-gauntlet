-- Update ticket RLS policies
DROP POLICY IF EXISTS "Customers can view their own tickets" ON tickets;
CREATE POLICY "Org-scoped ticket access"
ON tickets FOR SELECT
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_organization_memberships
    WHERE user_organization_memberships.organization_id = tickets.organization_id
    AND user_organization_memberships.user_id = auth.uid()
    AND user_organization_memberships.user_role IN ('agent', 'admin')
  )
);

DROP POLICY IF EXISTS "Agents and admins can update tickets" ON tickets;
CREATE POLICY "Org-scoped ticket updates"
ON tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_organization_memberships
    WHERE user_organization_memberships.organization_id = tickets.organization_id
    AND user_organization_memberships.user_id = auth.uid()
    AND user_organization_memberships.user_role IN ('agent', 'admin')
  )
);
