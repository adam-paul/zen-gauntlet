-- Enable full replica identity for realtime
ALTER TABLE comments REPLICA IDENTITY FULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view non-internal comments on their tickets" ON comments;
DROP POLICY IF EXISTS "Users can create comments on their tickets" ON comments;
DROP POLICY IF EXISTS "Comment access policy" ON comments;

-- Create unified policy for comments
CREATE POLICY "comment_access_policy" ON comments
FOR ALL USING (
    -- User created the comment
    user_id = auth.uid()
    OR
    -- User can access the ticket this comment is on
    EXISTS (
        SELECT 1 FROM tickets t
        WHERE t.id = comments.ticket_id
        AND (
            -- User created the ticket
            t.created_by = auth.uid()
            OR 
            -- User is assigned to the ticket
            t.assigned_to = auth.uid()
            OR 
            -- User is an admin/agent in the organization
            EXISTS (
                SELECT 1 FROM user_organization_memberships uom
                WHERE uom.organization_id = t.organization_id
                AND uom.user_id = auth.uid()
                AND uom.user_role IN ('admin', 'agent')
            )
        )
        -- Only show internal comments to staff
        AND (
            NOT comments.is_internal 
            OR 
            EXISTS (
                SELECT 1 FROM user_organization_memberships uom
                WHERE uom.organization_id = t.organization_id
                AND uom.user_id = auth.uid()
                AND uom.user_role IN ('admin', 'agent')
            )
        )
    )
); 