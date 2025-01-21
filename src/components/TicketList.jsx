// src/components/TicketList.jsx

import React from 'react';
import { format } from 'date-fns';

export default function TicketList({ tickets, onTicketUpdated }) {
  if (!tickets.length) {
    return <p>No tickets found.</p>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                  ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">{ticket.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {format(new Date(ticket.created_at), 'PPP')}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
