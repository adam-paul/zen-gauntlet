// src/components/TicketModal.jsx

import { X } from "lucide-react"
import CommentSection from "./CommentSection"
import RankButton from "./RankButton"
import StatusDropdown from "./StatusDropdown"
import TicketTags from "./TicketTags"
import { formatTimeAgo } from "../utils/DatetimeUtils"
import { useEscapeKey } from "../utils/EventHandlers"
import { useTickets } from "../hooks/useTickets"

export default function TicketModal({ 
  ticket, 
  isOpen, 
  onClose, 
  addTag, 
  removeTag 
}) {
  if (!isOpen) return null

  useEscapeKey(onClose)
  const { tickets } = useTickets(ticket?.organization_id)
  const currentTicket = tickets.find((t) => t.id === ticket?.id) || ticket

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-zen-bg w-[90vw] h-[90vh] rounded-lg shadow-xl flex" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <h2 className="text-2xl font-semibold text-zen-primary">{currentTicket.title}</h2>
                <TicketTags
                  ticketId={currentTicket.id}
                  initialTags={currentTicket.tags || []}
                  onAddTag={addTag}
                  onRemoveTag={removeTag}
                  className="mt-1"
                />
              </div>
              <p className="text-sm text-zen-secondary mt-2">
                Created {new Date(currentTicket.created_at).toLocaleString()} ({formatTimeAgo(currentTicket.created_at)}
                )
              </p>
            </div>
            <div className="flex items-center gap-4">
              <StatusDropdown
                ticketId={currentTicket.id}
                currentStatus={currentTicket.status}
                organizationId={currentTicket.organization_id}
              />
              <RankButton
                ticketId={currentTicket.id}
                currentDifficulty={currentTicket.difficulty}
                organizationId={currentTicket.organization_id}
              />
            </div>
          </div>

          <p className="text-zen-primary mb-6 text-lg">{currentTicket.description}</p>
        </div>

        <div className="w-1/3 border-l border-zen-border/30 bg-zen-bg flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-zen-border/30">
            <h3 className="text-zen-primary font-medium text-lg">Ticket Discussion</h3>
            <button
              onClick={onClose}
              className="text-zen-secondary hover:text-zen-primary transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <CommentSection ticket={ticket} onClose={onClose} isEmbedded={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
