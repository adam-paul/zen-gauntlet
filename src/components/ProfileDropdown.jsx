// src/components/ProfileDropdown.jsx

import { useRef, useState } from 'react';
import { useDropdown } from '../utils/EventHandlers';
import { useAuth } from '../hooks/useAuth';
import { UserCircle } from 'lucide-react';

export default function ProfileDropdown() {
  const { profile, getCurrentRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useDropdown(dropdownRef, () => setIsOpen(false));

  const role = getCurrentRole();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-zen-primary hover:border-zen-hover flex items-center justify-center"
      >
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-white');
            }}
          />
        ) : (
          <UserCircle className="w-8 h-8 text-zen-primary" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zen-element border border-zen-border/30 rounded-md shadow-lg z-20">
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
