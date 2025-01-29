import { useState, useEffect } from 'react'
import { LayoutGrid, LayoutList, PlusSquare, Inbox, X } from 'lucide-react'
import { useTicket } from '../../hooks/useTicket'
import TicketView from './TicketView'
import TicketForm from './TicketForm'
import CommentSection from '../CommentSection'

// Header component with view toggle and new ticket button
function DashboardHeader({ 
  onNewTicket, 
  viewMode, 
  onViewModeChange 
}) {
  return (
    <div className="flex justify-between items-center mb-8">
      <button
        onClick={onNewTicket}
        className="flex items-center gap-2 px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover"
      >
        <PlusSquare size={18} />
        New Ticket
      </button>

      <div className="flex gap-1">
        <button
          onClick={() => onViewModeChange('default')}
          className={`p-2 rounded ${
            viewMode === 'default' 
              ? 'bg-zen-primary text-white' 
              : 'text-zen-secondary hover:text-zen-primary'
          }`}
          aria-label="Grid view"
        >
          <LayoutGrid size={20} />
        </button>
        <button
          onClick={() => onViewModeChange('compact')}
          className={`p-2 rounded ${
            viewMode === 'compact' 
              ? 'bg-zen-primary text-white' 
              : 'text-zen-secondary hover:text-zen-primary'
          }`}
          aria-label="Compact view"
        >
          <LayoutList size={20} />
        </button>
      </div>
    </div>
  )
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="text-center py-12">
      <div className="animate-spin h-8 w-8 mx-auto border-4 border-zen-primary border-t-transparent rounded-full" />
    </div>
  )
}

// Empty state component
function EmptyState() {
  return (
    <div className="text-center py-12">
      <Inbox className="mx-auto text-zen-primary/70 mb-4" size={48} />
      <p className="text-zen-secondary">
        No tickets yet. Create your first ticket to get started.
      </p>
    </div>
  )
}

export default function TicketDashboard({ 
  organizationId,
  selectedTicket,
  onSelectTicket,
  viewMode = 'default',
  onViewModeChange,
  onLoadingChange
}) {
  // All ticket state management in one place
  const {
    tickets,
    isLoading,
    error,
    createTicket,
    deleteTicket,
    updateStatus,
    updateDifficulty,
    addTag,
    removeTag
  } = useTicket(organizationId)

  // Effect to notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // Form and modal state
  const [showForm, setShowForm] = useState(false)
  const [modalTicket, setModalTicket] = useState(null)

  // Layout helpers
  const containerClass = viewMode === 'compact' 
    ? 'flex flex-col gap-0 border border-zen-border bg-zen-element overflow-hidden'
    : 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-min'

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Error loading tickets: {error}
      </div>
    )
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Header with view toggle and new ticket button */}
      <DashboardHeader 
        onNewTicket={() => setShowForm(true)}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {/* Main content area with responsive layout */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Ticket grid that shrinks when comments are open */}
        <div 
          className={`${
            selectedTicket ? 'w-3/4 pr-4' : 'w-full'
          } overflow-y-auto`}
        >
          {tickets.length === 0 ? (
            <EmptyState />
          ) : (
            <div className={containerClass}>
              {tickets.map(ticket => (
                <TicketView
                  key={ticket.id}
                  ticket={ticket}
                  view={viewMode}
                  onOpenModal={setModalTicket}
                  onToggleComments={(ticket) => onSelectTicket(selectedTicket?.id === ticket?.id ? null : ticket)}
                  onDelete={() => deleteTicket(ticket.id)}
                  onStatusChange={(status) => updateStatus(ticket.id, status)}
                  onDifficultyChange={(difficulty) => updateDifficulty(ticket.id, difficulty)}
                  onAddTag={(tag) => addTag(ticket.id, tag)}
                  onRemoveTag={(tag) => removeTag(ticket.id, tag)}
                  isSelected={selectedTicket?.id === ticket.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comment section that slides in from the right */}
        {selectedTicket && (
          <div className="absolute top-0 right-0 w-1/4 h-full border border-zen-border/30 bg-zen-bg flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-zen-border/30">
              <h3 className="text-zen-primary font-medium text-lg">Ticket Discussion</h3>
              <button
                onClick={() => onSelectTicket(null)}
                className="text-zen-secondary hover:text-zen-primary transition-colors"
                aria-label="Close comments"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CommentSection 
                ticket={selectedTicket} 
                onClose={() => onSelectTicket(null)}
                isEmbedded={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals/Overlays */}
      {showForm && (
        <TicketForm
          organizationId={organizationId}
          onClose={() => setShowForm(false)}
        />
      )}

      {modalTicket && (
        <TicketView
          ticket={modalTicket}
          view="modal"
          onClose={() => setModalTicket(null)}
          onStatusChange={(status) => updateStatus(modalTicket.id, status)}
          onDifficultyChange={(difficulty) => updateDifficulty(modalTicket.id, difficulty)}
          onAddTag={(tag) => addTag(modalTicket.id, tag)}
          onRemoveTag={(tag) => removeTag(modalTicket.id, tag)}
        />
      )}
    </div>
  )
} 