-- Add status_change to notification_type if it doesn't exist
DO $$ 
BEGIN
    ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'status_change';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to handle status change notifications
CREATE OR REPLACE FUNCTION handle_ticket_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    ticket_creator_name TEXT;
    org_name TEXT;
BEGIN
    -- Only proceed if status actually changed
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get organization name
    SELECT name INTO org_name
    FROM organizations
    WHERE id = NEW.organization_id;

    -- Get the name of who changed the status
    SELECT COALESCE(full_name, 'A user') INTO ticket_creator_name
    FROM profiles
    WHERE id = auth.uid();

    -- Notify ticket creator if they're not the one who made the change
    IF NEW.created_by != auth.uid() THEN
        INSERT INTO notifications(
            user_id,
            organization_id,
            ticket_id,
            type,
            message,
            metadata
        ) VALUES (
            NEW.created_by,
            NEW.organization_id,
            NEW.id,
            'status_change',
            ticket_creator_name || ' changed the status of your ticket "' || NEW.title || '" from ' || OLD.status || ' to ' || NEW.status,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'changed_by', auth.uid(),
                'org_name', org_name
            )
        );
    END IF;

    -- Notify assigned user if they exist and aren't the one who made the change
    IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != auth.uid() THEN
        INSERT INTO notifications(
            user_id,
            organization_id,
            ticket_id,
            type,
            message,
            metadata
        ) VALUES (
            NEW.assigned_to,
            NEW.organization_id,
            NEW.id,
            'status_change',
            ticket_creator_name || ' changed the status of ticket "' || NEW.title || '" from ' || OLD.status || ' to ' || NEW.status,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'changed_by', auth.uid(),
                'org_name', org_name
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS ticket_status_change_notification ON tickets;
CREATE TRIGGER ticket_status_change_notification
AFTER UPDATE OF status ON tickets
FOR EACH ROW
EXECUTE FUNCTION handle_ticket_status_change();

-- Update RLS policy to explicitly handle status updates
DROP POLICY IF EXISTS "ticket_status_update_policy" ON tickets;
CREATE POLICY "ticket_status_update_policy" ON tickets
FOR UPDATE
USING (
    -- Allow admins and agents in the organization to update status
    EXISTS (
        SELECT 1 FROM user_organization_memberships
        WHERE user_organization_memberships.organization_id = tickets.organization_id
        AND user_organization_memberships.user_id = auth.uid()
        AND user_organization_memberships.user_role IN ('admin', 'agent')
    )
); 