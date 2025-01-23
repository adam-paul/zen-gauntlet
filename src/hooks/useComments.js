// src/hooks/useComments.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

  return roots.sort((a, b) => a.thread_position - b.thread_position);
};

export function useComments(ticketId) {
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles(id, full_name)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

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
    const { data } = await supabase
      .from('comments')
      .insert({
        ticket_id: ticketId,
        content,
        parent_id: parentId,
        thread_position: parentId ? 
          (comments.find(c => c.id === parentId)?.replies.length || 0) : 0
      })
      .select('*, author:profiles(id, full_name)');

    return data?.[0];
  };

  return { comments, addComment, fetchComments };
}
