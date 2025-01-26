// src/services/notifications.js

import { supabase } from '../lib/supabase';

export const notificationService = {
  // Core data operations
  getNotifications(userId) {
    return supabase
      .from('notifications')
      .select(`
        *,
        tickets (
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  markAsRead(notificationId) {
    return supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  },

  // Real-time subscription
  subscribeToUpdates(userId, callback) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  // Clear all notifications for a user
  clearAllNotifications(userId) {
    return supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
  }
};
