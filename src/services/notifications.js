// src/services/notifications.js

import { supabase } from '../lib/supabase';

export const notificationService = {
  async getNotifications(userId) {
    return supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async markAsRead(notificationId) {
    return supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  },

  subscribeToUpdates(userId, callback) {
    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, payload => callback(payload))
      .subscribe();
  }
};
