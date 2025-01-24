// src/components/TicketForm.jsx

import { useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import { PlusSquare } from 'lucide-react';

export default function TicketForm({ organizationId }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { createTicket } = useTickets(organizationId);

  async function handleSubmit(e) {
    e.preventDefault();
    await createTicket({ 
      title, 
      description
    });
    setTitle('');
    setDescription('');
    setShowForm(false);
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover"
      >
        <PlusSquare size={18} />
        New Ticket
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zen-bg p-6 space-y-4 border border-zen-border/30">
      <div className="space-y-2">
        <label htmlFor="title" className="block text-zen-secondary font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border border-zen-border/50 bg-white/80 focus:outline-none focus:border-zen-primary"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="block text-zen-secondary font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full p-2 border border-zen-border/50 bg-white/80 h-32 focus:outline-none focus:border-zen-primary"
        />
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 text-zen-primary border border-zen-border/50 hover:bg-white/20"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover"
        >
          Create Ticket
        </button>
      </div>
    </form>
  );
}
