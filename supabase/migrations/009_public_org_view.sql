-- Create a secure function to fetch organizations for signup
CREATE OR REPLACE FUNCTION public.fetch_organizations_for_signup()
RETURNS TABLE (
  id UUID,
  name TEXT
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name 
  FROM organizations 
  ORDER BY created_at DESC;
$$; 