-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "organization_access_policy" ON organizations;
DROP POLICY IF EXISTS "membership_access_policy" ON user_organization_memberships;

-- Organizations policies - simplified to allow access if user is a member
CREATE POLICY "organization_access_policy" ON organizations AS PERMISSIVE
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_organization_memberships
        WHERE user_organization_memberships.organization_id = id
        AND user_organization_memberships.user_id = auth.uid()
    )
);

-- Membership policies - simplified to allow viewing own memberships
CREATE POLICY "membership_access_policy" ON user_organization_memberships AS PERMISSIVE
FOR SELECT USING (
    -- Can view their own memberships
    user_id = auth.uid()
);

-- Enable foreign key reads for organization joins
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE user_organization_memberships FORCE ROW LEVEL SECURITY;

-- Grant references on organizations to authenticated users
GRANT REFERENCES ON organizations TO authenticated; 