-- Drop existing trigger and function
DROP TRIGGER IF EXISTS ticket_created_notification ON tickets;
DROP FUNCTION IF EXISTS handle_ticket_notification();

-- Recreate function without edge function call and with security definer
CREATE OR REPLACE FUNCTION handle_ticket_notification()
RETURNS TRIGGER
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
AS $$
DECLARE
  org_members RECORD;
BEGIN
  -- Get all admins/agents in the organization
  FOR org_members IN
    SELECT user_id 
    FROM user_organization_memberships
    WHERE organization_id = NEW.organization_id
      AND user_role IN ('admin', 'agent')
  LOOP
    INSERT INTO notifications(
      user_id, 
      organization_id,
      ticket_id,
      type,
      message
    ) VALUES (
      org_members.user_id,
      NEW.organization_id,
      NEW.id,
      'ticket_created',
      'New ticket created: ' || NEW.title
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER ticket_created_notification
AFTER INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION handle_ticket_notification(); 