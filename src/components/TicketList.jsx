// src/components/TicketList.jsx

import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import { Inbox, X } from 'lucide-react';
import RankButton from './RankButton';

export default function TicketList() {
  const { tickets, deleteTicket } = useTickets();
  const { session, profile } = useAuth();

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

  const canDeleteTicket = (ticket) => {
    return profile?.role === 'admin' || ticket.created_by === session?.user?.id;
  };

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
          <h3 className="text-zen-primary font-medium mb-2">{ticket.title}</h3>
          <p className="text-zen-secondary text-sm mb-4 line-clamp-3">{ticket.description}</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-end">
              <RankButton ticketId={ticket.id} currentDifficulty={ticket.difficulty} />
            </div>
            <div className="flex justify-between items-center text-sm text-zen-secondary">
              <span className="uppercase">{ticket.status || 'open'}</span>
              <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
