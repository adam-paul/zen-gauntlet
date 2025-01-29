import { X } from 'lucide-react'
import { useCallback } from 'react'
import StatusDropdown from '../StatusDropdown'
import RankButton from '../RankButton'
import TicketTags from '../TicketTags'
import CommentSection from '../CommentSection'
import AssigneeDisplay from '../AssigneeDisplay'
import { useEscapeKey } from '../../utils/EventHandlers'
import { formatTimeAgo } from '../../utils/DatetimeUtils'

// Shared components
const Card = ({ children, className = '' }) => (
  <div className={`p-6 border border-zen-border relative flex flex-col min-h-[200px] bg-zen-element ${className}`}>
    {children}
  </div>
)

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
    <div className="bg-zen-bg w-[90vw] h-[90vh] rounded-lg shadow-xl flex" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
)

export default function TicketView({ 
  ticket,
  view = 'default',
  onOpenModal,
  onClose,
  onDelete,
  onStatusChange,
  onDifficultyChange,
  onAddTag,
  onRemoveTag,
  onToggleComments,
  isSelected = false
}) {
  // Add ESC handler for modal
  useEscapeKey(view === 'modal' ? onClose : null)

  // Common elements that vary by view
  const renderHeader = useCallback(() => {
    switch (view) {
      case 'compact':
        return (
          <div className="flex items-center gap-4">
            <h3 
              onClick={() => onOpenModal?.(ticket)}
              className="text-zen-primary font-medium cursor-pointer hover:text-zen-primary/80 truncate max-w-[200px]"
            >
              {ticket.title}
            </h3>
            <div className="h-5 w-px bg-zen-border/50" />
            <StatusDropdown
              ticketId={ticket.id}
              currentStatus={ticket.status}
              organizationId={ticket.organization_id}
              onChange={onStatusChange}
            />
          </div>
        )
      case 'modal':
        return (
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-zen-primary">{ticket.title}</h2>
                <AssigneeDisplay userId={ticket.assigned_to} />
              </div>
              <p className="text-sm text-zen-secondary mt-2">
                Created {ticket.displayDate} ({formatTimeAgo(ticket.created_at)})
              </p>
            </div>
            <div className="flex items-center gap-4">
              <StatusDropdown
                ticketId={ticket.id}
                currentStatus={ticket.status}
                organizationId={ticket.organization_id}
                onChange={onStatusChange}
              />
              <RankButton
                ticketId={ticket.id}
                currentDifficulty={ticket.difficulty}
                organizationId={ticket.organization_id}
                onChange={onDifficultyChange}
              />
            </div>
          </div>
        )
      default:
        return (
          <div className="flex justify-between items-start">
            <h3 
              onClick={() => onOpenModal?.(ticket)}
              className="text-zen-primary font-medium cursor-pointer hover:text-zen-primary/80"
            >
              {ticket.title}
            </h3>
            <span className="text-xs text-zen-secondary whitespace-nowrap">
              {ticket.displayDate}
            </span>
          </div>
        )
    }
  }, [view, ticket, onStatusChange, onDifficultyChange, onOpenModal])

  const renderTags = useCallback(() => {
    const commonProps = {
      ticketId: ticket.id,
      initialTags: ticket.tags,
      onAddTag,
      onRemoveTag
    };

    switch (view) {
      case 'compact':
        return <TicketTags {...commonProps} className="min-w-[150px]" />;
      default:
        return <TicketTags {...commonProps} />;
    }
  }, [view, ticket, onAddTag, onRemoveTag]);

  // View-specific wrappers
  switch (view) {
    case 'modal':
      return (
        <Modal onClose={onClose}>
          <div className="flex-1 p-8 overflow-y-auto">
            {renderHeader()}
            <p className="text-zen-primary mb-6 text-lg">{ticket.description}</p>
            {renderTags()}
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
        </Modal>
      )

    case 'compact':
      return (
        <div className="p-4 border-b last:border-b-0 border-zen-border bg-zen-element hover:bg-[#f0efe9] transition-colors group relative">
          {onDelete && (
            <button
              onClick={() => onDelete(ticket.id)}
              className="opacity-0 group-hover:opacity-100 absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-200 text-zen-secondary hover:text-zen-primary"
              aria-label="Delete ticket"
            >
              <X size={16} />
            </button>
          )}
          <div className="flex items-center gap-4 pr-8">
            {renderHeader()}
            <div className="h-5 w-px bg-zen-border/50" />
            <p className="text-zen-secondary text-sm">
              {ticket.truncatedDescription}
            </p>
            <div className="h-5 w-px bg-zen-border/50" />
            <span className="text-xs text-zen-secondary whitespace-nowrap">
              {ticket.displayDate}
            </span>
            <div className="ml-auto group-hover:mr-6 transition-all">
              {renderTags()}
            </div>
          </div>
        </div>
      )

    default:
      return (
        <Card>
          {onDelete && (
            <button
              onClick={() => onDelete(ticket.id)}
              className="absolute top-2 right-2 text-zen-secondary hover:text-zen-primary transition-colors"
              aria-label="Delete ticket"
            >
              <X size={16} />
            </button>
          )}
          {renderHeader()}
          <p className="text-zen-secondary text-sm mb-4 line-clamp-3">
            {ticket.description}
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-start">
              <RankButton 
                ticketId={ticket.id} 
                currentDifficulty={ticket.difficulty}
                organizationId={ticket.organization_id}
                onChange={onDifficultyChange}
              />
            </div>
            <div className="flex justify-between items-center text-sm text-zen-secondary">
              <StatusDropdown
                ticketId={ticket.id}
                currentStatus={ticket.status}
                organizationId={ticket.organization_id}
                onChange={onStatusChange}
              />
              <AssigneeDisplay userId={ticket.assigned_to} />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <TicketTags
              ticketId={ticket.id}
              initialTags={ticket.tags}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
            />
            <button
              onClick={() => onToggleComments?.(ticket)}
              className="ml-4 p-1 text-zen-primary hover:opacity-80"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        </Card>
      )
  }
} 