import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';

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
  return (
    <main className={`flex-1 overflow-auto ${selectedTicket ? 'pr-96' : ''}`}>
      <div className="max-w-6xl p-6">
        {!selectedOrg ? (
          <div className="text-center py-12 bg-white/80 border border-zen-border/30">
            <h2 className="text-xl text-zen-secondary">
              Select an organization to view dashboard
            </h2>
          </div>
        ) : (
          <>
            <div className="flex">
              <TicketForm organizationId={selectedOrg.id} />
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
                />
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
} 