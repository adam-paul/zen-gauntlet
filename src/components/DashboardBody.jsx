import { useState } from 'react';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';
import { LayoutGrid, LayoutList } from 'lucide-react';

/**
 * Handles the main content of the dashboard:
 * shows either a prompt to select an org
 * or the ticket form + ticket list if an org is selected.
 */
export default function DashboardBody({
  selectedOrg,
  isLoading,
  tickets,
  selectedTicket,
  onSelectTicket,
  onDeleteTicket,
  addTag,
  removeTag
}) {
  const [viewMode, setViewMode] = useState('default');

  return (
    <main className={`flex-1 overflow-auto ${selectedTicket ? 'pr-96' : ''}`}>
      <div className="p-6">
        {!selectedOrg ? (
          <div className="text-center py-12 bg-white/80 border border-zen-border/30">
            <h2 className="text-xl text-zen-secondary">
              Select an organization to view dashboard
            </h2>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <TicketForm organizationId={selectedOrg.id} />
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('default')}
                  className={`p-2 rounded ${viewMode === 'default' ? 'bg-zen-primary text-white' : 'text-zen-secondary hover:text-zen-primary'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded ${viewMode === 'compact' ? 'bg-zen-primary text-white' : 'text-zen-secondary hover:text-zen-primary'}`}
                  aria-label="Compact view"
                >
                  <LayoutList size={20} />
                </button>
              </div>
            </div>
            <div className="mt-8">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 mx-auto border-4 border-zen-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <TicketList
                  tickets={tickets}
                  selectedTicket={selectedTicket}
                  onSelectTicket={onSelectTicket}
                  onDeleteTicket={onDeleteTicket}
                  addTag={addTag}
                  removeTag={removeTag}
                  viewMode={viewMode}
                />
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
} 