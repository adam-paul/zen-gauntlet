-- supabase/migrations/023_notifications.sql
CREATE TYPE notification_type AS ENUM ('ticket_created', 'mention', 'status_change');

CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  organization_id UUID REFERENCES organizations NOT NULL,
  ticket_id UUID REFERENCES tickets,
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB
);

CREATE POLICY "Users can manage their notifications" ON notifications 
FOR ALL USING (auth.uid() = user_id);
