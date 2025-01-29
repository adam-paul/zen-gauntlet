import { useState } from 'react';
import TicketDashboard from './Ticket/TicketDashboard';

/**
 * Handles the main content of the dashboard:
 * shows either a prompt to select an org
 * or the appropriate section content
 */
export default function DashboardBody({ selectedOrg, onLoadingChange, activeSection }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewMode, setViewMode] = useState('default');

  if (!selectedOrg) {
    return (
      <div className="text-center py-12 bg-white/80 border border-zen-border/30">
        <h2 className="text-xl text-zen-secondary">
          Select an organization to view dashboard
        </h2>
      </div>
    );
  }

  // Render appropriate content based on active section
  if (activeSection !== 'tickets') {
    return (
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-semibold text-zen-primary capitalize mb-4">
            {activeSection}
          </h2>
          <p className="text-zen-secondary">
            Coming soon...
          </p>
        </div>
      </main>
    );
  }

  // Render ticket dashboard for tickets section
  return (
    <main className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden p-6">
        <TicketDashboard
          organizationId={selectedOrg.id}
          selectedTicket={selectedTicket}
          onSelectTicket={setSelectedTicket}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onLoadingChange={onLoadingChange}
        />
      </div>
    </main>
  );
} 