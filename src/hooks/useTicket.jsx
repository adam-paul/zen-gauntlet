import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Ticket from '../models/Ticket'

export function useTicket(orgId) {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Setup subscription and fetch initial data
  useEffect(() => {
    let mounted = true
    setIsLoading(true)

    // Initial fetch
    supabase
      .from('tickets')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!mounted) return
        if (fetchError) {
          setError(fetchError.message)
          return
        }
        setTickets(data.map(t => new Ticket(t)))
        setError(null)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    // Setup real-time subscription
    // Create a unique channel name for the subscription (to avoid conflict with function subscriptions)
    const channelName = `tickets-${orgId}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `organization_id=eq.${orgId}`
        },
        (payload) => {
          if (!mounted) return
          
          switch (payload.eventType) {
            case 'INSERT':
              setTickets(prev => [new Ticket(payload.new), ...prev])
              break
            case 'UPDATE':
              setTickets(prev => 
                prev.map(ticket => 
                  ticket.id === payload.new.id 
                    ? new Ticket(payload.new)
                    : ticket
                )
              )
              break
            case 'DELETE':
              setTickets(prev => 
                prev.filter(ticket => ticket.id !== payload.old.id)
              )
              break
          }
        }
      )

    channel.subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [orgId])

  // Helper for optimistic updates
  const updateTicket = (id, updates) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === id
          ? new Ticket({ ...ticket, ...updates })
          : ticket
      )
    )
  }

  // CRUD operations with optimistic updates
  const createTicket = async (data) => {
    try {
      // Get the admin's UUID for this organization
      const { data: adminData, error: adminError } = await supabase
        .from('user_organization_memberships')
        .select('user_id')
        .eq('organization_id', orgId)
        .eq('user_role', 'admin')
        .single()

      if (adminError) throw adminError

      const ticketData = {
        ...data,
        organization_id: orgId,
        created_at: new Date().toISOString(),
        assigned_to: adminData.user_id
      }

      const { data: newTicket, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single()

      if (error) throw error
      
      const ticket = new Ticket(newTicket)
      setTickets(prev => [ticket, ...prev])
      return ticket
    } catch (err) {
      console.error('Failed to create ticket:', err)
      throw err
    }
  }

  const deleteTicket = async (id) => {
    const oldTickets = tickets
    setTickets(prev => prev.filter(t => t.id !== id))

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      setTickets(oldTickets)
      throw err
    }
  }

  const updateStatus = async (id, status) => {
    const ticket = tickets.find(t => t.id === id)
    if (!ticket) return

    const oldStatus = ticket.status
    updateTicket(id, { status })

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      updateTicket(id, { status: oldStatus })
      throw err
    }
  }

  const updateDifficulty = async (id, difficulty) => {
    const ticket = tickets.find(t => t.id === id)
    if (!ticket) return

    const oldDifficulty = ticket.difficulty
    updateTicket(id, { difficulty })

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ difficulty })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      updateTicket(id, { difficulty: oldDifficulty })
      throw err
    }
  }

  const addTag = async (id, tag) => {
    const ticket = tickets.find(t => t.id === id)
    if (!ticket) return

    const oldTags = ticket.tags
    if (oldTags.includes(tag)) return
    if (oldTags.length >= 5) throw new Error('Maximum of 5 tags allowed')

    updateTicket(id, { tags: [...oldTags, tag] })

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ tags: [...oldTags, tag] })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      updateTicket(id, { tags: oldTags })
      throw err
    }
  }

  const removeTag = async (id, tag) => {
    const ticket = tickets.find(t => t.id === id)
    if (!ticket) return

    const oldTags = ticket.tags
    const newTags = oldTags.filter(t => t !== tag)
    updateTicket(id, { tags: newTags })

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ tags: newTags })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      updateTicket(id, { tags: oldTags })
      throw err
    }
  }

  return {
    tickets,
    isLoading,
    error,
    createTicket,
    deleteTicket,
    updateStatus,
    updateDifficulty,
    addTag,
    removeTag
  }
} 
