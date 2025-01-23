// src/hooks/useComments.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const organizeComments = (comments) => {
  const map = new Map();
  const roots = [];
  
  comments.forEach(comment => {
    map.set(comment.id, { ...comment, replies: [] });
    if (!comment.parent_id) roots.push(map.get(comment.id));
  });

  comments.forEach(comment => {
    if (comment.parent_id && map.has(comment.parent_id)) {
      map.get(comment.parent_id).replies.push(map.get(comment.id));
    }
  });

  return roots.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

export function useComments(ticketId) {
  const { profile } = useAuth();
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(id, full_name)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    setComments(organizeComments(data || []));
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel(`comments-${ticketId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `ticket_id=eq.${ticketId}`
      }, fetchComments)
      .subscribe();

    fetchComments();
    return () => supabase.removeChannel(channel);
  }, [ticketId, fetchComments]);

  const addComment = async (content, parentId = null) => {
    if (!profile) {
      console.error('User profile not found. Cannot add comment.');
      return null;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ticket_id: ticketId,
        content,
        parent_id: parentId,
        user_id: profile.id,
        thread_position: parentId ? 
          (comments.find(c => c.id === parentId)?.replies.length || 0) : 0
      })
      .select(`
        *,
        profile:profiles(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    return data;
  };

  return { comments, addComment, fetchComments };
}
