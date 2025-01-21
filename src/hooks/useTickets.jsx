// src/hooks/useTickets.js

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Initial fetch
    fetchTickets();

    // Set up realtime subscription
    const channel = supabase
      .channel('tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        () => fetchTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  async function fetchTickets() {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function createTicket({ title, description }) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          title,
          description,
          created_by: session.user.id,
          status: 'open'
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
    } catch (err) {
      console.error('Error deleting ticket:', err);
    }
  }

  return { 
    tickets, 
    isLoading, 
    error, 
    createTicket,
    deleteTicket,
    refresh: fetchTickets 
  };
}
