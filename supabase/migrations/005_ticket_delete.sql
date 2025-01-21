-- Add delete policy for tickets
CREATE POLICY "Users can delete their own tickets"
ON tickets
FOR DELETE
USING (
  auth.uid() = created_by 
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
); 