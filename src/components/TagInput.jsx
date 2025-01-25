// src/components/TagInput.jsx

import React, { useState, useRef } from "react"
import { X, Wand2 } from "lucide-react"
import { useTagInference } from "../hooks/useTagInference"

export default function TagInput({
  tags = [],
  onChange,
  disabled = false,
  readOnly = false,
  allowDelete = true,
  className = "",
  description = "",
}) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef(null)
  const { inferTags, isLoading, error } = useTagInference()

  const handleInputChange = (e) => {
    const value = e.target.value
    if (!value.startsWith(" ")) {
      setInputValue(value)
    }
  }

  const handleKeyDown = (e) => {
    if (disabled) return

    if (e.key === "Backspace" && !inputValue && tags.length > 0 && allowDelete) {
      e.preventDefault()
      onChange(tags.slice(0, -1))
    }

    if ((e.key === " " || e.key === "Enter") && inputValue.trim()) {
      e.preventDefault()
      const newTag = inputValue.trim()
      if (tags.length < 5 && !tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove) => {
    if (disabled || !allowDelete) return
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleContainerClick = () => {
    if (!disabled && !readOnly && inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleInferTags = async () => {
    if (!description || disabled || isLoading) return

    const inferredTags = await inferTags(description)
    if (inferredTags.length > 0) {
      const newTags = [...new Set([...tags, ...inferredTags])].slice(0, 5)
      onChange(newTags)
    }
  }

  return (
    <div className="relative">
      <div
        onClick={handleContainerClick}
        className={`
          w-full p-1.5 py-1 border border-zen-border/50 bg-white/80 
          focus-within:border-zen-primary flex flex-wrap items-center gap-1.5 
          ${disabled || tags.length >= 5 ? "bg-gray-50" : "cursor-text"}
          ${isLoading ? "animate-pulse opacity-80" : ""}
          ${className}
        `}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`
                flex items-center gap-1 px-2 py-1.5 text-xs rounded-md
                ${disabled || tags.length >= 5 ? "bg-gray-100 text-gray-500" : "bg-zen-bg text-zen-secondary hover:text-zen-primary"}
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

          <div className="flex-1 min-w-[60px]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={disabled || tags.length >= 5}
              placeholder={tags.length === 0 ? "Add tags..." : ""}
              className={`
                w-full text-sm bg-transparent border-none 
                focus:outline-none focus:text-zen-primary text-zen-secondary
                placeholder:text-zen-secondary/50
                ${disabled || tags.length >= 5 ? "" : ""}
              `}
            />
          </div>
        </div>

        {tags.length >= 5 && <span className="text-xs text-zen-secondary/50 ml-auto">Maximum tags reached</span>}
      </div>
      {description && !disabled && tags.length < 5 && (
        <button
          type="button"
          onClick={handleInferTags}
          disabled={isLoading}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 
            text-zen-secondary/80 hover:text-zen-primary disabled:opacity-50
          `}
          title="Infer tags from description"
        >
          <span className="text-xs">Infer Tags</span>
          <Wand2 size={16} className={isLoading ? "animate-pulse" : ""} />
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
