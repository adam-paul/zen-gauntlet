// src/components/CommentSection.jsx

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { useEscapeKey } from '../utils/EventHandlers';

export default function CommentSection({ ticket, onClose, isEmbedded = false }) {
  const { comments, addComment } = useComments(ticket.id);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // Only add ESC handler when in sidebar mode (not embedded)
  if (!isEmbedded) {
    useEscapeKey(onClose);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    await addComment(newComment, replyingTo);
    setNewComment('');
    setReplyingTo(null);
  };

  const containerClasses = isEmbedded
    ? 'flex flex-col h-full'
    : 'fixed top-[88px] bottom-0 right-0 w-96 bg-zen-bg border-l border-zen-border/30 shadow-xl p-4 pb-2 z-10 flex flex-col';

  return (
    <div className={containerClasses}>
      {/* Header - only show if not embedded */}
      {!isEmbedded && (
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-zen-border/30">
          <h3 className="text-zen-primary font-medium text-lg">Ticket Discussion</h3>
          <button onClick={onClose} className="text-zen-secondary hover:text-zen-primary">
            <X size={24} />
          </button>
        </div>
      )}

      {/* Comments area */}
      <div className={`flex-1 overflow-y-auto space-y-4 ${isEmbedded ? 'p-4' : 'pr-2'}`}>
        {comments.map(comment => (
          <CommentThread key={comment.id} comment={comment} onReply={setReplyingTo} />
        ))}
      </div>

      {/* Input area */}
      <div className={`mt-4 pt-4 border-t border-zen-border/30 ${isEmbedded ? 'px-4 pb-4' : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) {
                    return; // Allow shift+enter for newline
                  }
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
              className={`w-full ${isEmbedded ? 'p-2' : ''} pr-10 border border-zen-border/50 rounded-md focus:outline-none focus:border-zen-primary focus:ring-1 focus:ring-zen-primary`}
              rows="3"
            />
            <button
              type="submit"
              className={`absolute right-2 ${isEmbedded ? 'bottom-5' : 'top-1/2'} text-zen-secondary hover:text-zen-primary p-1`}
              disabled={!newComment.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommentThread({ comment, onReply }) {
  return (
    <div className="border-l-2 border-zen-border/20 pl-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zen-primary">{comment.profile?.full_name || 'Deleted User'}</span>
            <span className="text-xs text-zen-secondary">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-zen-secondary text-sm mt-1">{comment.content}</p>
          <button 
            onClick={() => onReply(comment.id)} 
            className="text-xs text-zen-primary hover:text-zen-hover mt-1"
          >
            Reply
          </button>
        </div>
      </div>
      
      {comment.replies?.map(reply => (
        <CommentThread key={reply.id} comment={reply} onReply={onReply} />
      ))}
    </div>
  );
}
