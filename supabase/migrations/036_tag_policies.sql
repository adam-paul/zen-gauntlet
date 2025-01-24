-- Add policy for tag updates
CREATE POLICY "tag_update_policy" ON tickets
FOR UPDATE USING (
    -- Allow admins and agents in the organization to update tags
    EXISTS (
        SELECT 1 FROM user_organization_memberships
        WHERE user_organization_memberships.organization_id = tickets.organization_id
        AND user_organization_memberships.user_id = auth.uid()
        AND user_organization_memberships.user_role IN ('admin', 'agent')
    )
); 