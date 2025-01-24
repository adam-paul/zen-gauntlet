import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ 
  tags = [], 
  onChange, 
  disabled = false,
  readOnly = false,
  allowDelete = true,
  className = ''
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Handle input changes and spacebar chunking
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Don't allow spaces at the start
    if (value.startsWith(' ')) return;
    setInputValue(value);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === 'Backspace' && !inputValue && tags.length > 0 && allowDelete) {
      e.preventDefault();
      const newTags = tags.slice(0, -1);
      onChange(newTags);
    }

    // Handle space or enter
    if ((e.key === ' ' || e.key === 'Enter') && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      // Check tag limit
      if (tags.length >= 5) {
        return;
      }
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    if (disabled || !allowDelete) return;
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  // Focus input when clicking container
  const handleContainerClick = () => {
    if (!disabled && !readOnly && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`
        min-h-[38px] p-1.5 bg-white border border-zen-border/50 
        focus-within:border-zen-primary rounded-md flex flex-wrap gap-1.5 
        ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-text'}
        ${className}
      `}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className={`
            flex items-center gap-1 px-2 py-0.5 text-xs rounded-md
            ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-zen-bg text-zen-secondary'}
          `}
        >
          {tag}
          {allowDelete && !disabled && !readOnly && (
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-zen-primary focus:outline-none"
            >
              <X size={14} />
            </button>
          )}
        </span>
      ))}
      
      {!readOnly && tags.length < 5 && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className={`
            flex-1 min-w-[100px] text-sm bg-transparent border-none 
            focus:outline-none text-zen-primary placeholder:text-zen-secondary/50
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
        />
      )}
      {!readOnly && tags.length >= 5 && (
        <span className="text-xs text-zen-secondary/50 ml-1">
          Maximum tags reached
        </span>
      )}
    </div>
  );
} 