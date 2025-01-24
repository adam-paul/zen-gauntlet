-- supabase/migrations/024_ticket_notification_trigger.sql
CREATE OR REPLACE FUNCTION handle_ticket_notification()
RETURNS TRIGGER AS $$
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
    
    -- Email notification (edge function template)
    PERFORM supabase.invoke(
      'send-notification-email',
      json_build_object(
        'user_id', org_members.user_id,
        'type', 'ticket_created',
        'ticket_id', NEW.id
      )
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_created_notification
AFTER INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION handle_ticket_notification();
