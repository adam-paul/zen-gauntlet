// src/components/TicketList.jsx

import { useTickets } from '../hooks/useTickets';
import { Inbox } from 'lucide-react';

export default function TicketList() {
  const { tickets } = useTickets();

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
        <div key={ticket.id} className="bg-zen-bg p-6 border border-zen-border/30">
          <h3 className="text-zen-primary font-medium mb-2">{ticket.title}</h3>
          <p className="text-zen-secondary text-sm mb-4 line-clamp-3">{ticket.description}</p>
          <div className="flex justify-between items-center text-sm text-zen-secondary">
            <span className="uppercase">{ticket.status || 'open'}</span>
            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
