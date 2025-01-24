// src/components/NotificationDropdown.jsx
import { useState, useRef } from 'react';
import { useDropdown } from '../utils/EventHandlers';
import { useNotifications } from '../hooks/useNotifications';
import { formatTimeAgo } from '../utils/DatetimeUtils';
import { X, Bell, CheckCircle, Loader } from 'lucide-react';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, isLoading, markAsRead } = useNotifications();
  useDropdown(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-zen-secondary hover:text-zen-primary relative"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
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
            <h3 className="font-medium text-zen-primary">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zen-secondary hover:text-zen-primary"
              aria-label="Close notifications"
            >
              <X size={20} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-zen-secondary">
                <Loader className="animate-spin inline-block" size={20} />
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-zen-secondary">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-zen-border/30 hover:bg-zen-bg/50 transition-colors ${
                    !notification.read ? 'bg-zen-bg' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zen-primary break-words">
                        {notification.message}
                      </p>
                      <p className="text-xs text-zen-secondary mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                      {notification.tickets?.title && (
                        <p className="text-xs text-zen-primary/80 mt-1 truncate">
                          Re: {notification.tickets.title}
                        </p>
                      )}
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-zen-secondary hover:text-zen-primary shrink-0"
                        aria-label="Mark as read"
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
