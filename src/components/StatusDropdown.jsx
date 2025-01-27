import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { ChevronDown } from 'lucide-react';
import { useDropdown } from '../utils/EventHandlers';

const STATUS_COLORS = {
  open: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
  in_progress: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  resolved: 'bg-green-100 hover:bg-green-200 text-green-800',
  closed: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
};

export default function StatusDropdown({ ticketId, currentStatus, organizationId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const dropdownRef = useRef(null);
  const { getCurrentRole } = useAuth();
  const { updateTicketStatus } = useTickets(organizationId);
  const currentRole = getCurrentRole();

  useDropdown(dropdownRef, () => setIsOpen(false));

  // Keep local status in sync with props
  useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  // If not admin/agent, just show the status text
  if (!currentRole || !['admin', 'agent'].includes(currentRole)) {
    return (
      <span className={`px-2 py-1 text-xs rounded-md uppercase ${STATUS_COLORS[localStatus] || STATUS_COLORS.open}`}>
        {localStatus || 'open'}
      </span>
    );
  }

  const handleStatusChange = async (newStatus) => {    
    setError(null);
    setLocalStatus(newStatus); // Optimistic update

    try {
      const { error } = await updateTicketStatus(ticketId, newStatus);
      if (error) throw error;
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.message);
      setLocalStatus(currentStatus); // Rollback on error
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1 px-2 py-1 text-xs rounded-md uppercase transition-colors
          ${STATUS_COLORS[localStatus] || STATUS_COLORS.open}
        `}
      >
        {localStatus || 'open'}
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && (
        <div className="absolute bottom-full left-0 mb-1 w-48 px-2 py-1 text-xs text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-zen-border/30 rounded-md shadow-lg z-20">
          {Object.keys(STATUS_COLORS).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`
                w-full px-3 py-2 text-left text-xs uppercase transition-colors
                ${status === localStatus ? STATUS_COLORS[status] : 'hover:bg-zen-bg'}
              `}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 