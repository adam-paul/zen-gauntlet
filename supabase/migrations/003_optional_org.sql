-- Add this to a new migration file: 003_optional_org.sql

-- Make organization_id optional in tickets table
ALTER TABLE tickets 
ALTER COLUMN organization_id DROP NOT NULL;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;

-- Create new policy
CREATE POLICY "Users can view their own tickets"
ON tickets FOR SELECT
USING (
  created_by = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('agent', 'admin')
  )
);

-- Ensure default role is set for new profiles
ALTER TABLE profiles
ALTER COLUMN role SET DEFAULT 'customer'::user_role;
