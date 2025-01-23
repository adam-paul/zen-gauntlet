// src/components/TicketList.jsx

import { useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import { Inbox, X } from 'lucide-react';
import RankButton from './RankButton';
import CommentSection from './CommentSection';

export default function TicketList({ selectedTicket, onSelectTicket }) {
  const { tickets, deleteTicket } = useTickets();
  const { session, profile } = useAuth();

  const canDeleteTicket = (ticket) => {
    return profile?.role === 'admin' || ticket.created_by === session?.user?.id;
  };

  if (tickets.length === 0) {
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
        <div key={ticket.id} className="bg-zen-bg p-6 border border-zen-border/30 relative">
          {canDeleteTicket(ticket) && (
            <button
              onClick={() => deleteTicket(ticket.id)}
              className="absolute top-2 right-2 text-zen-secondary hover:text-zen-primary transition-colors"
              aria-label="Delete ticket"
            >
              <X size={16} />
            </button>
          )}

          {/* Moved date display */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-zen-primary font-medium">{ticket.title}</h3>
            <span className="text-xs text-zen-secondary">
              {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="text-zen-secondary text-sm mb-4 line-clamp-3">{ticket.description}</p>

          <div className="flex flex-col gap-2">
            <div className="flex justify-start">
              <RankButton ticketId={ticket.id} currentDifficulty={ticket.difficulty} />
            </div>
            
            <div className="flex justify-between items-center text-sm text-zen-secondary">
              <span className="uppercase">{ticket.status || 'open'}</span>
              {/* Chat icon button */}
              <button
                onClick={() => onSelectTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                className="p-1 text-zen-secondary hover:text-zen-primary"
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
