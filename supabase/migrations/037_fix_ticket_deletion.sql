-- Drop existing foreign key constraint
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_ticket_id_fkey;

-- Re-add with CASCADE
ALTER TABLE notifications 
ADD CONSTRAINT notifications_ticket_id_fkey 
FOREIGN KEY (ticket_id) 
REFERENCES tickets(id) 
ON DELETE CASCADE; 