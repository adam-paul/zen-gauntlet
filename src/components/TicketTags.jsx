import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function TicketTags({ 
  ticketId, 
  initialTags = [], 
  onAddTag, 
  onRemoveTag,
  className = ''
}) {
  const { getCurrentRole } = useAuth();
  const currentRole = getCurrentRole();
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState(null);
  const [localTags, setLocalTags] = useState(initialTags);

  const handleAddTag = async (e) => {
    e.preventDefault();
    const tagToAdd = newTag.trim();
    if (!tagToAdd) return;
    
    // Reset error state
    setTagError(null);
    
    // Check tag limit in UI
    if (localTags.length >= 5) {
      setTagError('Maximum of 5 tags allowed');
      return;
    }
    
    // Optimistically update UI
    setLocalTags(prev => [...prev, tagToAdd]);
    
    // Reset input state
    setNewTag('');
    setShowTagInput(false);
    
    // Perform the async operation
    const { error } = await onAddTag(ticketId, tagToAdd);
    if (error) {
      // Rollback on error
      setLocalTags(prev => prev.filter(t => t !== tagToAdd));
      setTagError(error.message);
      setShowTagInput(true);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    // Optimistically update UI
    setLocalTags(prev => prev.filter(t => t !== tagToRemove));
    
    // Perform the async operation
    const { error } = await onRemoveTag(ticketId, tagToRemove);
    if (error) {
      // Rollback on error
      setLocalTags(prev => [...prev, tagToRemove]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {localTags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-zen-bg text-zen-secondary"
        >
          {tag}
          {(currentRole === 'admin' || currentRole === 'agent') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="hover:text-zen-primary"
            >
              <X size={12} />
            </button>
          )}
        </span>
      ))}
      
      {(currentRole === 'admin' || currentRole === 'agent') && (
        showTagInput ? (
          <form onSubmit={handleAddTag} className="inline-flex relative">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onBlur={() => {
                if (!newTag.trim()) {
                  setShowTagInput(false);
                  setTagError(null);
                }
              }}
              placeholder="Add tag..."
              className={`w-24 px-2 py-0.5 text-xs rounded-md border focus:outline-none focus:border-zen-primary ${
                tagError ? 'border-red-300' : 'border-zen-border/50'
              }`}
              autoFocus
              maxLength={15}
            />
            {tagError && (
              <div className="absolute left-0 -bottom-6 text-xs text-red-500 whitespace-nowrap">
                {tagError}
              </div>
            )}
          </form>
        ) : (
          (localTags.length < 5 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTagInput(true);
                setTagError(null);
              }}
              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-zen-bg text-zen-secondary hover:text-zen-primary"
            >
              <Plus size={12} />
              Add Tag
            </button>
          ))
        )
      )}
    </div>
  );
} 