import { useState } from 'react';
import TicketDashboard from './Ticket/TicketDashboard';
import AgentDashboard from './Agents/AgentDashboard';

/**
 * Handles the main content of the dashboard:
 * shows either a prompt to select an org
 * or the appropriate section content
 */
export default function DashboardBody({ selectedOrg, onLoadingChange, activeSection }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewMode, setViewMode] = useState('default');

  // If no organization is selected, show a message
  if (!selectedOrg) {
    return (
      <main className="flex-1 overflow-hidden flex items-center justify-center">
        <p className="text-zen-secondary">Please select an organization</p>
      </main>
    );
  }

  // Render appropriate content based on active section
  if (activeSection === 'agents') {
    return (
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <AgentDashboard organization={selectedOrg} />
        </div>
      </main>
    );
  }

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
          organizationId={selectedOrg?.id}
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