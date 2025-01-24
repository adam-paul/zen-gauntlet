// src/components/TicketList.jsx

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Inbox, X, Plus } from 'lucide-react';
import RankButton from './RankButton';
import CommentSection from './CommentSection';
import StatusDropdown from './StatusDropdown';

export default function TicketList({ 
  selectedTicket, 
  onSelectTicket, 
  tickets, 
  onDeleteTicket,
  addTag: addTagFromHook,
  removeTag: removeTagFromHook
}) {
  const { session, getCurrentRole } = useAuth();
  const [showTagInput, setShowTagInput] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState(null);

  const canDeleteTicket = (ticket) => {
    const currentRole = getCurrentRole();
    return currentRole === 'admin' || ticket.created_by === session?.user?.id;
  };

  if (!tickets?.length) {
    return (
      <div className="text-center py-12">
        <Inbox className="mx-auto text-zen-primary/70 mb-4" size={48} />
        <p className="text-zen-secondary">
          No tickets yet. Create your first ticket to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tickets.map(ticket => (
        <div key={ticket.id} className="bg-zen-bg p-6 border border-zen-border/30 relative flex flex-col min-h-[200px]">
          {canDeleteTicket(ticket) && (
            <button
              onClick={() => onDeleteTicket(ticket.id)}
              className="absolute top-2 right-2 text-zen-secondary hover:text-zen-primary transition-colors"
              aria-label="Delete ticket"
            >
              <X size={16} />
            </button>
          )}

          <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-zen-primary font-medium">{ticket.title}</h3>
              <span className="text-xs text-zen-secondary">
                {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-zen-secondary text-sm mb-4 line-clamp-3">{ticket.description}</p>

            {/* Controls */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-start">
                <RankButton 
                  ticketId={ticket.id} 
                  currentDifficulty={ticket.difficulty}
                  organizationId={ticket.organization_id}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm text-zen-secondary">
                <StatusDropdown
                  ticketId={ticket.id}
                  currentStatus={ticket.status}
                  organizationId={ticket.organization_id}
                />
              </div>
            </div>
          </div>

          {/* Footer with tags and chat */}
          <div className="mt-4 flex justify-between items-end">
            {/* Tags section */}
            <div className="flex-1 flex flex-wrap gap-1.5">
              {ticket.tags?.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-white/50 text-zen-secondary"
                >
                  {tag}
                  {(getCurrentRole() === 'admin' || getCurrentRole() === 'agent') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTagFromHook(ticket.id, tag);
                      }}
                      className="hover:text-zen-primary"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
              
              {(getCurrentRole() === 'admin' || getCurrentRole() === 'agent') && (
                showTagInput === ticket.id ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const tagToAdd = newTag.trim();
                    if (!tagToAdd) return;
                    
                    // Reset error state
                    setTagError(null);
                    
                    // Check tag limit in UI
                    if ((ticket.tags || []).length >= 5) {
                      setTagError('Maximum of 5 tags allowed');
                      return;
                    }
                    
                    // Reset UI state immediately
                    setNewTag('');
                    setShowTagInput(null);
                    
                    // Then perform the async operation
                    const { error } = await addTagFromHook(ticket.id, tagToAdd);
                    if (error) {
                      setTagError(error.message);
                      setShowTagInput(ticket.id); // Show input again on error
                    }
                  }} className="inline-flex relative">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onBlur={() => {
                        if (!newTag.trim()) {
                          setShowTagInput(null);
                          setTagError(null);
                        }
                      }}
                      placeholder="Add tag..."
                      className={`w-24 px-2 py-0.5 text-xs rounded-md border focus:outline-none focus:border-zen-primary ${
                        tagError ? 'border-red-300' : 'border-zen-border/50'
                      }`}
                      autoFocus
                      maxLength={15}
                    />
                    {tagError && (
                      <div className="absolute left-0 -bottom-6 text-xs text-red-500 whitespace-nowrap">
                        {tagError}
                      </div>
                    )}
                  </form>
                ) : (
                  (ticket.tags || []).length < 5 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTagInput(ticket.id);
                        setTagError(null);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-white/50 text-zen-secondary hover:text-zen-primary"
                    >
                      <Plus size={12} />
                      Add Tag
                    </button>
                  )
                )
              )}
            </div>

            {/* Chat button */}
            <button
              onClick={() => onSelectTicket(selectedTicket?.id === ticket.id ? null : ticket)}
              className="ml-4 p-1 text-zen-primary hover:opacity-80"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>

          {selectedTicket?.id === ticket.id && (
            <CommentSection 
              ticket={ticket} 
              onClose={() => onSelectTicket(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
