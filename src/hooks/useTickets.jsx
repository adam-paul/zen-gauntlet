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

    // Create a unique channel name for the subscription (to avoid conflict with function subscriptions)
    const channelName = `tickets-${organizationId}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
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

    // Subscribe and log status
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, organizationId]);

  async function createTicket({ title, description, tags }) {
    if (!organizationId) {
      throw new Error('Organization ID is required to create a ticket');
    }

    try {
      // Create new ticket object with default values
      const newTicket = {
        title,
        description,
        tags: tags || [],
        created_by: session.user.id,
        status: 'open',
        organization_id: organizationId,
        created_at: new Date().toISOString(),
        difficulty: null
      };

      // Optimistically update UI
      setTickets(prevTickets => [newTicket, ...prevTickets]);

      const { data, error } = await supabase
        .from('tickets')
        .insert(newTicket)
        .select()
        .single();
  
      if (error) {
        // Rollback on error
        setTickets(prevTickets => prevTickets.slice(1)); // Remove optimistic ticket
        throw error;
      }

      // Update with real server data
      setTickets(prevTickets => [data, ...prevTickets.slice(1)]);

      return { data, error: null };
    } catch (err) {
      console.error('Error creating ticket:', err);
      return { data: null, error: err };
    }
  }

  async function deleteTicket(ticketId) {
    try {
      // Store ticket for potential rollback
      const ticketToDelete = tickets.find(t => t.id === ticketId);
      if (!ticketToDelete) {
        throw new Error('Ticket not found');
      }

      // Optimistically update UI
      setTickets(prevTickets => prevTickets.filter(t => t.id !== ticketId));

      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) {
        // Rollback on error
        setTickets(prevTickets => [...prevTickets, ticketToDelete]);
        throw error;
      }

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

  async function updateTags(ticketId, newTags) {
    const currentRole = getCurrentRole();
    if (!currentRole || !['admin', 'agent'].includes(currentRole)) {
      return { error: new Error('Insufficient permissions to update tags') };
    }

    try {
      const ticketToUpdate = tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) {
        throw new Error('Ticket not found');
      }

      // Store old tags for rollback
      const oldTags = ticketToUpdate.tags || [];

      // Optimistically update the UI
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, tags: newTags }
            : ticket
        )
      );

      // Perform the actual update
      const { error } = await supabase
        .from('tickets')
        .update({ tags: newTags })
        .eq('id', ticketId);

      if (error) {
        // Rollback on error
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticketId
              ? { ...ticket, tags: oldTags }
              : ticket
          )
        );
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error updating tags:', err);
      return { error: err };
    }
  }

  async function addTag(ticketId, tag) {
    const currentRole = getCurrentRole();
    if (!currentRole || !['admin', 'agent'].includes(currentRole)) {
      return { error: new Error('Insufficient permissions to add tags') };
    }

    try {
      const ticketToUpdate = tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) {
        throw new Error('Ticket not found');
      }

      const currentTags = ticketToUpdate.tags || [];
      if (currentTags.includes(tag)) {
        return { error: null }; // Tag already exists
      }

      // Check tag limit
      if (currentTags.length >= 5) {
        return { error: new Error('Maximum of 5 tags allowed') };
      }

      const newTags = [...currentTags, tag];
      
      // Optimistically update UI
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, tags: newTags }
            : ticket
        )
      );

      // Perform the actual update
      const { error } = await supabase
        .from('tickets')
        .update({ tags: newTags })
        .eq('id', ticketId);

      if (error) {
        // Rollback on error
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticketId
              ? { ...ticket, tags: currentTags }
              : ticket
          )
        );
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error adding tag:', err);
      return { error: err };
    }
  }

  async function removeTag(ticketId, tagToRemove) {
    const currentRole = getCurrentRole();
    if (!currentRole || !['admin', 'agent'].includes(currentRole)) {
      return { error: new Error('Insufficient permissions to remove tags') };
    }

    try {
      const ticketToUpdate = tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) {
        throw new Error('Ticket not found');
      }

      const currentTags = ticketToUpdate.tags || [];
      const newTags = currentTags.filter(tag => tag !== tagToRemove);
      
      if (newTags.length === currentTags.length) {
        return { error: null }; // Tag didn't exist
      }

      // Optimistically update UI
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, tags: newTags }
            : ticket
        )
      );

      // Perform the actual update
      const { error } = await supabase
        .from('tickets')
        .update({ tags: newTags })
        .eq('id', ticketId);

      if (error) {
        // Rollback on error
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticketId
              ? { ...ticket, tags: currentTags }
              : ticket
          )
        );
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error removing tag:', err);
      return { error: err };
    }
  }

  return {
    tickets,
    error,
    createTicket,
    deleteTicket,
    updateTicketStatus,
    updateDifficulty,
    updateTags,
    addTag,
    removeTag,
    setTickets
  };
}
