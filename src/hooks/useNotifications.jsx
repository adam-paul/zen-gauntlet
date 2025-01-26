// src/hooks/useNotifications.jsx

import { useState, useEffect } from 'react';
import { notificationService } from '../services/notifications';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial notifications and setup subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadNotifications = async () => {
      setIsLoading(true);
      const { data, error } = await notificationService.getNotifications(session.user.id);
      if (!error) {
        setNotifications(data || []);
        setUnreadCount((data || []).filter(n => !n.read).length);
      }
      setIsLoading(false);
    };

    // Setup real-time subscription
    const subscription = notificationService.subscribeToUpdates(
      session.user.id,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new, ...prev]);
          if (!payload.new.read) setUnreadCount(c => c + 1);
        }
      }
    );

    loadNotifications();
    return () => subscription.unsubscribe();
  }, [session?.user?.id]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    const { error } = await notificationService.markAsRead(id);
    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? {...n, read: true} : n)
      );
      setUnreadCount(c => Math.max(0, c - 1));
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!session?.user?.id) return;
    
    const { error } = await notificationService.clearAllNotifications(session.user.id);
    if (!error) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    clearAll
  };
}
