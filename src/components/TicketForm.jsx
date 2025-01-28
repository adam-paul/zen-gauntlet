// src/components/TicketForm.jsx

import { useState } from "react";
import { X } from "lucide-react";
import { useEscapeKey } from "../utils/EventHandlers";
import { useTicket } from "../hooks/useTicket";
import { useAuth } from "../hooks/useAuth";
import TagInput from "./TagInput";

export default function TicketForm({ organizationId, onClose }) {
  const { session } = useAuth();
  const { createTicket } = useTicket(organizationId);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [],
  });

  // Allow ESC key to close the modal
  useEscapeKey(onClose);

  // Update local state with any changes in input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle the actual ticket creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTicket({
        ...formData,
        created_by: session?.user?.id
      });
      setFormData({ title: "", description: "", tags: [] });
      onClose();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      // Here you might want to show an error message to the user
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-zen-bg w-[600px] shadow-xl relative border border-zen-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zen-border/30">
          <h3 className="text-lg font-medium text-zen-primary">
            Create New Ticket
          </h3>
          <button
            onClick={onClose}
            className="text-zen-secondary hover:text-zen-primary"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {["title", "description"].map((field) => (
            <div key={field} className="space-y-2">
              <label
                htmlFor={field}
                className="block text-zen-secondary font-medium capitalize"
              >
                {field}
              </label>
              {field === "description" ? (
                <textarea
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  required
                  className={`
                    w-full p-2 border border-zen-border/50 bg-white/80 h-32 
                    focus:outline-none focus:border-zen-primary bg-[url('/input-texture.svg')] 
                    bg-no-repeat bg-right-bottom
                  `}
                />
              ) : (
                <input
                  id={field}
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  required
                  className={`
                    w-full p-2 border border-zen-border/50 bg-white/80 
                    focus:outline-none focus:border-zen-primary bg-[url('/input-texture.svg')] 
                    bg-no-repeat bg-right-bottom
                  `}
                />
              )}
            </div>
          ))}

          <div className="space-y-2">
            <label className="block text-zen-secondary font-medium">Tags</label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              className="bg-white/80 bg-[url('/input-texture.svg')] bg-no-repeat bg-right-bottom"
              description={formData.description}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zen-primary border border-zen-border/50 hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
