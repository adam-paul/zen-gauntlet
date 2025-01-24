// src/components/ProfileDropdown.jsx

import { useRef, useState } from 'react';
import { useDropdown } from '../utils/EventHandlers';
import { useAuth } from '../hooks/useAuth';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666666'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

export default function ProfileDropdown() {
  const { profile, getCurrentRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useDropdown(dropdownRef, () => setIsOpen(false));

  const role = getCurrentRole();
  const avatarUrl = profile?.avatar_url || DEFAULT_AVATAR;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-zen-primary hover:border-zen-hover"
      >
        <img 
          src={avatarUrl} 
          alt="Profile" 
          className="w-full h-full object-cover"
          onError={(e) => e.target.src = DEFAULT_AVATAR}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-zen-border/30 rounded-md shadow-lg z-20">
          <div className="p-4 border-b border-zen-border/30">
            <p className="font-medium text-zen-primary">{profile?.full_name || 'User'}</p>
            <p className="text-sm text-zen-secondary capitalize">{role}</p>
          </div>
          <div className="p-2">
            {role === 'admin' && (
              <button className="w-full px-4 py-2 text-left text-sm text-zen-secondary hover:bg-zen-bg">
                Admin Settings
              </button>
            )}
            <button className="w-full px-4 py-2 text-left text-sm text-zen-secondary hover:bg-zen-bg">
              User Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
