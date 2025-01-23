-- Drop existing profiles policies to redefine them
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create policy to allow users to view their own profile and admins to view all profiles
CREATE POLICY "Profile visibility policy"
ON profiles FOR SELECT
USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
