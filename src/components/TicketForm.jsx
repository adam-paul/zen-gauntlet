// src/components/TicketForm.jsx

import { useState } from "react"
import { useTickets } from "../hooks/useTickets"
import { PlusSquare } from "lucide-react"
import TagInput from "./TagInput"

export default function TicketForm({ organizationId }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [],
  })
  const { createTicket } = useTickets(organizationId)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createTicket(formData)
    setFormData({ title: "", description: "", tags: [] })
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover"
      >
        <PlusSquare size={18} />
        New Ticket
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zen-bg p-6 space-y-4 border border-zen-border/30">
      {["title", "description"].map((field) => (
        <div key={field} className="space-y-2">
          <label htmlFor={field} className="block text-zen-secondary font-medium capitalize">
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
          onClick={() => setShowForm(false)}
          className="px-4 py-2 text-zen-primary border border-zen-border/50 hover:bg-white/20"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover">
          Create Ticket
        </button>
      </div>
    </form>
  )
}
