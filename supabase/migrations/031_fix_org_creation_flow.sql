-- Drop existing policies
DROP POLICY IF EXISTS "organization_creation_policy" ON organizations;
DROP POLICY IF EXISTS "membership_creation_policy" ON user_organization_memberships;

-- Allow any authenticated user to create an organization
CREATE POLICY "organization_creation_policy" ON organizations
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
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
        -- Or creating as admin (for new org)
        (
            user_role = 'admin'
            AND (
                -- Either this is the first member of the org
                NOT EXISTS (
                    SELECT 1 FROM user_organization_memberships
                    WHERE organization_id = user_organization_memberships.organization_id
                )
                OR
                -- Or they are already an admin in another org (trusted user)
                EXISTS (
                    SELECT 1 FROM user_organization_memberships
                    WHERE user_id = auth.uid()
                    AND user_role = 'admin'
                )
            )
        )
    )
); 