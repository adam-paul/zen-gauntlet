-- Create custom type for ticket difficulty
CREATE TYPE ticket_difficulty AS ENUM ('easy', 'moderate', 'hard');

-- Add difficulty column to tickets table
ALTER TABLE tickets
ADD COLUMN difficulty ticket_difficulty;

-- Only admins can update the difficulty
CREATE POLICY "Only admins can update ticket difficulty"
ON tickets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
); 