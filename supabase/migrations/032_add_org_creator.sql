-- Add created_by to organizations
ALTER TABLE organizations 
ADD COLUMN created_by UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid();

-- Drop existing policies
DROP POLICY IF EXISTS "organization_creation_policy" ON organizations;
DROP POLICY IF EXISTS "membership_creation_policy" ON user_organization_memberships;

-- Allow any authenticated user to create an organization
CREATE POLICY "organization_creation_policy" ON organizations
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
);

-- Allow users to create memberships under these conditions:
-- 1. Creating their own membership as admin if they created the org
-- 2. Creating their own membership as customer when joining any org
CREATE POLICY "membership_creation_policy" ON user_organization_memberships
FOR INSERT WITH CHECK (
    -- Must be creating membership for themselves
    auth.uid() = user_id
    AND (
        -- Either joining as a customer
        (user_role = 'customer')
        OR
        -- Or creating as admin if they created the org
        (
            user_role = 'admin'
            AND EXISTS (
                SELECT 1 FROM organizations
                WHERE id = organization_id
                AND created_by = auth.uid()
            )
        )
    )
); 