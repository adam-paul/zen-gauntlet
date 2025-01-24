-- Create join table for organization memberships
CREATE TABLE user_organization_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations ON DELETE CASCADE NOT NULL,
  user_role user_role DEFAULT 'customer'::user_role NOT NULL,
  UNIQUE (user_id, organization_id)
);

-- Add trigger for updated_at
CREATE TRIGGER set_memberships_updated_at
BEFORE UPDATE ON user_organization_memberships
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Deprecate old organization_id column
ALTER TABLE profiles 
  ALTER COLUMN organization_id DROP NOT NULL,
  ALTER COLUMN role DROP DEFAULT;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
CREATE POLICY "Users can view their organizations"
ON organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_organization_memberships
    WHERE user_organization_memberships.organization_id = organizations.id
    AND user_organization_memberships.user_id = auth.uid()
  )
);

-- Membership table RLS
ALTER TABLE user_organization_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their memberships"
ON user_organization_memberships
FOR ALL
USING (user_id = auth.uid());
