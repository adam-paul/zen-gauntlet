// src/hooks/useTickets.js

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// Define valid status values based on our enum
const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export function useTickets(organizationId) {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const { session, getCurrentRole } = useAuth();

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

  async function updateTicketStatus(ticketId, newStatus) {
    // Validate status
    if (!VALID_STATUSES.includes(newStatus)) {
      return { error: new Error('Invalid status value') };
    }

    // Check if user has permission (admin or agent)
    const currentRole = getCurrentRole();
    if (!currentRole || !['admin', 'agent'].includes(currentRole)) {
      return { error: new Error('Insufficient permissions to update ticket status') };
    }

    try {
      // Find the ticket to update
      const ticketToUpdate = tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) {
        throw new Error('Ticket not found');
      }

      // Store old status for rollback
      const oldStatus = ticketToUpdate.status;

      // Optimistically update the UI
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, status: newStatus }
            : ticket
        )
      );

      // Perform the actual update
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) {
        // Rollback on error
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticketId
              ? { ...ticket, status: oldStatus }
              : ticket
          )
        );
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error updating ticket status:', err);
      return { error: err };
    }
  }

  async function updateDifficulty(ticketId, difficulty) {
    try {
      // Find the ticket to update
      const ticketToUpdate = tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) {
        throw new Error('Ticket not found');
      }

      // If clicking the same difficulty, set to null (deselect)
      const newDifficulty = ticketToUpdate.difficulty === difficulty ? null : difficulty;
      
      // Store old difficulty for rollback
      const oldDifficulty = ticketToUpdate.difficulty;

      // Optimistically update the UI
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, difficulty: newDifficulty }
            : ticket
        )
      );

      // Perform the actual update
      const { error } = await supabase
        .from('tickets')
        .update({ difficulty: newDifficulty })
        .eq('id', ticketId);

      if (error) {
        // Rollback on error
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticketId
              ? { ...ticket, difficulty: oldDifficulty }
              : ticket
          )
        );
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Failed to update difficulty:', err);
      return { error: err };
    }
  }

  return {
    tickets,
    error,
    createTicket,
    deleteTicket,
    updateTicketStatus,
    updateDifficulty
  };
}
