-- Additional policies needed for proper auth flow

-- Allow users to create their own organization during signup
CREATE POLICY "Users can create their own organization"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Will be restricted by application logic

-- Ensure users can only see organizations they belong to
CREATE POLICY "Users can only view their own organization"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Ensure automatic profile creation works
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
