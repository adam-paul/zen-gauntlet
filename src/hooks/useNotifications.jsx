// src/hooks/useNotifications.jsx

import { useState, useEffect } from 'react';
import { notificationService } from '../services/notifications';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadInitial = async () => {
      const { data } = await notificationService.getNotifications(session.user.id);
      setNotifications(data || []);
      updateUnreadCount(data || []);
    };

    const subscription = notificationService.subscribeToUpdates(
      session.user.id,
      (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        if (!payload.new.read) setUnreadCount(c => c + 1);
      }
    );

    loadInitial();
    return () => subscription.unsubscribe();
  }, [session?.user?.id]);

  const updateUnreadCount = (notifs) => {
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  const markAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? {...n, read: true} : n)
    );
    setUnreadCount(c => c - 1);
  };

  return { notifications, unreadCount, markAsRead };
}
