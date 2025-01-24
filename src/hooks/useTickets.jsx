// src/hooks/useTickets.js

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useTickets(organizationId) {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const { session } = useAuth();

  async function fetchTickets() {
    if (!organizationId) {
      setTickets([]);
      return;
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
    } 
  }

  useEffect(() => {
    if (!session?.user?.id || !organizationId) {
      setTickets([]);
      return;
    }
    
    fetchTickets();

    const channel = supabase
      .channel('tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `organization_id=eq.${organizationId}`
        },
        () => fetchTickets()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session?.user?.id, organizationId]);

  async function createTicket({ title, description }) {
    if (!organizationId) {
      throw new Error('Organization ID is required to create a ticket');
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          title,
          description,
          created_by: session.user.id,
          status: 'open',
          organization_id: organizationId
        })
        .select()
        .single();
  
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error creating ticket:', err);
      return { data: null, error: err };
    }
  }

  async function deleteTicket(ticketId) {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error deleting ticket:', err);
      return { error: err };
    }
  }

  return {
    tickets,
    error,
    createTicket,
    deleteTicket
  };
}
