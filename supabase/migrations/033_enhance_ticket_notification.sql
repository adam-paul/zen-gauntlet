-- Drop existing trigger and function
DROP TRIGGER IF EXISTS ticket_created_notification ON tickets;
DROP FUNCTION IF EXISTS handle_ticket_notification();

-- Create enhanced notification handler
CREATE OR REPLACE FUNCTION handle_ticket_notification()
RETURNS TRIGGER AS $$
DECLARE
  org_members RECORD;
  org_name TEXT;
  creator_name TEXT;
BEGIN
  -- Get organization name
  SELECT name INTO org_name
  FROM organizations
  WHERE id = NEW.organization_id;
  
  -- Get creator's name
  SELECT COALESCE(full_name, 'A user') INTO creator_name
  FROM profiles
  WHERE id = NEW.created_by;

  -- Get all admins in the organization
  FOR org_members IN
    SELECT user_id 
    FROM user_organization_memberships
    WHERE organization_id = NEW.organization_id
      AND user_role = 'admin'
      AND user_id != NEW.created_by  -- Don't notify the creator
  LOOP
    INSERT INTO notifications(
      user_id, 
      organization_id,
      ticket_id,
      type,
      message,
      metadata
    ) VALUES (
      org_members.user_id,
      NEW.organization_id,
      NEW.id,
      'ticket_created',
      creator_name || ' created a ticket in ' || org_name || ': ' || NEW.title,
      jsonb_build_object(
        'creator_id', NEW.created_by,
        'org_name', org_name,
        'ticket_title', NEW.title
      )
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER ticket_created_notification
AFTER INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION handle_ticket_notification(); 