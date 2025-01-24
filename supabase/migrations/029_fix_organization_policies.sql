-- Enable RLS on both tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organization_memberships ENABLE ROW LEVEL SECURITY;

-- Set replica identity for realtime
ALTER TABLE organizations REPLICA IDENTITY FULL;
ALTER TABLE user_organization_memberships REPLICA IDENTITY FULL;

-- Drop existing policies
DROP POLICY IF EXISTS "organization_creation_policy" ON organizations;
DROP POLICY IF EXISTS "organization_access_policy" ON organizations;
DROP POLICY IF EXISTS "membership_creation_policy" ON user_organization_memberships;
DROP POLICY IF EXISTS "membership_access_policy" ON user_organization_memberships;

-- Organizations policies
CREATE POLICY "organization_access_policy" ON organizations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_organization_memberships
        WHERE user_organization_memberships.organization_id = organizations.id
        AND user_organization_memberships.user_id = auth.uid()
    )
);

-- Allow any authenticated user to create an organization
CREATE POLICY "organization_creation_policy" ON organizations
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
);

-- Membership policies
-- Allow users to view memberships for organizations they belong to
CREATE POLICY "membership_access_policy" ON user_organization_memberships
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id 
        FROM user_organization_memberships 
        WHERE user_id = auth.uid()
    )
);

-- Allow users to create memberships under these conditions:
-- 1. Creating their own membership as admin when creating a new org
-- 2. Creating their own membership as customer when joining an existing org
CREATE POLICY "membership_creation_policy" ON user_organization_memberships
FOR INSERT WITH CHECK (
    -- Must be creating membership for themselves
    auth.uid() = user_id
    AND (
        -- Either joining as a customer
        (user_role = 'customer')
        OR
        -- Or creating first membership as admin (for new org)
        (
            user_role = 'admin' 
            AND NOT EXISTS (
                SELECT 1 FROM user_organization_memberships
                WHERE organization_id = user_organization_memberships.organization_id
            )
        )
    )
);

-- Allow admins to update memberships in their organization
CREATE POLICY "membership_update_policy" ON user_organization_memberships
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_organization_memberships admin_check
        WHERE admin_check.organization_id = user_organization_memberships.organization_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.user_role = 'admin'
    )
);

-- Allow admins to delete memberships in their organization
CREATE POLICY "membership_delete_policy" ON user_organization_memberships
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM user_organization_memberships admin_check
        WHERE admin_check.organization_id = user_organization_memberships.organization_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.user_role = 'admin'
    )
); 