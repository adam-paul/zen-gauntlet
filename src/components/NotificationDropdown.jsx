// src/components/NotificationDropdown.jsx
import { useState, useRef } from 'react';
import { useDropdown } from '../utils/EventHandlers';
import { useNotifications } from '../hooks/useNotifications';
import { X, Bell, CheckCircle } from 'lucide-react';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  useDropdown(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-zen-secondary hover:text-zen-primary relative"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-zen-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-zen-border/30 rounded-md shadow-lg z-20">
          <div className="p-4 border-b border-zen-border/30 flex justify-between items-center">
            <h3 className="font-medium text-zen-primary">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zen-secondary hover:text-zen-primary"
            >
              <X size={20} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-zen-secondary">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-zen-border/30 ${
                    !notification.read ? 'bg-zen-bg' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-zen-primary">
                        {notification.message}
                      </p>
                      <p className="text-xs text-zen-secondary mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-zen-secondary hover:text-zen-primary ml-2"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
