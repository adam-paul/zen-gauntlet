-- Enable full replica identity for tickets table
ALTER TABLE tickets REPLICA IDENTITY FULL;

-- Drop existing policies
DROP POLICY IF EXISTS "ticket_select_policy" ON tickets;
DROP POLICY IF EXISTS "ticket_insert_policy" ON tickets;
DROP POLICY IF EXISTS "ticket_update_policy" ON tickets;
DROP POLICY IF EXISTS "ticket_delete_policy" ON tickets;

-- Create unified policy for both realtime and regular access
CREATE POLICY "ticket_access_policy" ON tickets
FOR ALL USING (
    -- User created the ticket
    created_by = auth.uid()
    OR 
    -- User is assigned to the ticket
    assigned_to = auth.uid()
    OR 
    -- User is an admin/agent in the organization
    EXISTS (
        SELECT 1 FROM user_organization_memberships
        WHERE user_organization_memberships.organization_id = tickets.organization_id
        AND user_organization_memberships.user_id = auth.uid()
        AND user_organization_memberships.user_role IN ('admin', 'agent')
    )
); 