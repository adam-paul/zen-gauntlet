// src/components/TicketList.jsx

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Inbox, X } from 'lucide-react';
import RankButton from './RankButton';
import CommentSection from './CommentSection';
import StatusDropdown from './StatusDropdown';
import TicketModal from './TicketModal';
import TicketTags from './TicketTags';

export default function TicketList({ 
  selectedTicket, 
  onSelectTicket, 
  tickets, 
  onDeleteTicket,
  addTag: addTagFromHook,
  removeTag: removeTagFromHook,
  viewMode = 'default'
}) {
  const { session, getCurrentRole } = useAuth();
  const [modalTicket, setModalTicket] = useState(null);

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

  const containerClass = viewMode === 'compact' 
    ? 'flex flex-col gap-0 border border-zen-border bg-[#f7f6f3] overflow-hidden' 
    : 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-min';

  const ticketClass = viewMode === 'compact'
    ? 'p-4 border-b last:border-b-0 border-zen-border bg-[#f7f6f3] hover:bg-[#f0efe9] transition-colors group relative'
    : 'p-6 border border-zen-border relative flex flex-col min-h-[200px] bg-[#f7f6f3]';

  return (
    <div className={containerClass}>
      {tickets.map(ticket => (
        <div key={ticket.id} className={ticketClass}>
          {canDeleteTicket(ticket) && (
            <button
              onClick={() => onDeleteTicket(ticket.id)}
              className={`${viewMode === 'compact' 
                ? 'opacity-0 group-hover:opacity-100 absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-200'
                : 'absolute top-2 right-2'} text-zen-secondary hover:text-zen-primary transition-colors`}
              aria-label="Delete ticket"
            >
              <X size={16} />
            </button>
          )}

          <div className={viewMode === 'compact' ? 'flex items-center gap-4 pr-8' : 'flex-1'}>
            {/* Header */}
            <div className={viewMode === 'compact' ? 'flex-1 flex items-center gap-4' : 'mb-2'}>
              {viewMode === 'compact' ? (
                <>
                  <h3 
                    onClick={() => {
                      onSelectTicket(null);
                      setModalTicket(ticket);
                    }}
                    className="text-zen-primary font-medium cursor-pointer hover:text-zen-primary/80 truncate max-w-[200px]"
                  >
                    {ticket.title}
                  </h3>
                  <div className="h-5 w-px bg-zen-border/50" />
                  <p className="text-zen-secondary text-sm">
                    {ticket.description.length > 30 
                      ? `${ticket.description.substring(0, 30)}...`
                      : ticket.description}
                  </p>
                  <div className="h-5 w-px bg-zen-border/50" />
                  <span className="text-xs text-zen-secondary whitespace-nowrap">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  <div className="ml-auto group-hover:mr-6 transition-all">
                    <TicketTags
                      ticketId={ticket.id}
                      initialTags={ticket.tags || []}
                      onAddTag={addTagFromHook}
                      onRemoveTag={removeTagFromHook}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <h3 
                      onClick={() => {
                        onSelectTicket(null);
                        setModalTicket(ticket);
                      }}
                      className="text-zen-primary font-medium cursor-pointer hover:text-zen-primary/80"
                    >
                      {ticket.title}
                    </h3>
                    <span className="text-xs text-zen-secondary whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zen-secondary text-sm mb-4 line-clamp-3">{ticket.description}</p>
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
                </>
              )}
            </div>

            {/* Footer with tags and chat - only shown in default view */}
            {viewMode === 'default' && (
              <div className="mt-4 flex justify-between items-end">
                <TicketTags
                  ticketId={ticket.id}
                  initialTags={ticket.tags || []}
                  onAddTag={addTagFromHook}
                  onRemoveTag={removeTagFromHook}
                />

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
            )}
          </div>

          {selectedTicket?.id === ticket.id && (
            <CommentSection 
              ticket={ticket} 
              onClose={() => onSelectTicket(null)}
            />
          )}
        </div>
      ))}

      {modalTicket && (
        <TicketModal
          ticket={modalTicket}
          isOpen={!!modalTicket}
          onClose={() => setModalTicket(null)}
          onDeleteTicket={onDeleteTicket}
          canDeleteTicket={canDeleteTicket(modalTicket)}
          addTag={addTagFromHook}
          removeTag={removeTagFromHook}
        />
      )}
    </div>
  );
}
