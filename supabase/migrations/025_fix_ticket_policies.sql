DROP POLICY IF EXISTS "Customers can create tickets" ON tickets;
DROP POLICY IF EXISTS "Only admins can update ticket difficulty" ON tickets;
DROP POLICY IF EXISTS "Org-scoped ticket access" ON tickets;
DROP POLICY IF EXISTS "Org-scoped ticket updates" ON tickets;
DROP POLICY IF EXISTS "Users can delete their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;

CREATE POLICY "ticket_select_policy" ON tickets FOR SELECT USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_organization_memberships
        WHERE user_organization_memberships.organization_id = tickets.organization_id
        AND user_organization_memberships.user_id = auth.uid()
        AND user_organization_memberships.user_role IN ('admin', 'agent')
    )
);

CREATE POLICY "ticket_insert_policy" ON tickets FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "ticket_update_policy" ON tickets FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_organization_memberships
        WHERE user_organization_memberships.organization_id = tickets.organization_id
        AND user_organization_memberships.user_id = auth.uid()
        AND user_organization_memberships.user_role IN ('admin', 'agent')
    )
);

CREATE POLICY "ticket_delete_policy" ON tickets FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_organization_memberships
        WHERE user_organization_memberships.organization_id = tickets.organization_id
        AND user_organization_memberships.user_id = auth.uid()
        AND user_organization_memberships.user_role = 'admin'
    )
);