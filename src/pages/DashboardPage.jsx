// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import TicketList from '../components/TicketList';
import CreateTicketForm from '../components/CreateTicketForm';

export default function DashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const { user, profile, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      let query = supabase.from('tickets').select('*');
      if (profile?.role === 'customer') {
        query = query.eq('created_by', user.id);
      }
      const { data } = await query;
      setTickets(data || []);
      setTicketsLoading(false);
    };

    if (user) fetchTickets();
  }, [user, profile]);

  if (authLoading || ticketsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
        {profile?.role === 'customer' && (
          <CreateTicketForm onTicketCreated={() => window.location.reload()} />
        )}
      </div>
      <TicketList tickets={tickets} onTicketUpdated={() => window.location.reload()} />
    </div>
  );
}
