-- Remove notification trigger and function
DROP TRIGGER IF EXISTS ticket_created_notification ON tickets;
DROP FUNCTION IF EXISTS handle_ticket_notification();

-- Drop notification type and table
DROP TABLE IF EXISTS notifications;
DROP TYPE IF EXISTS notification_type; 