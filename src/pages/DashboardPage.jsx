// src/pages/DashboardPage.jsx

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOrganization } from '../hooks/useOrganization';
import { useTickets } from '../hooks/useTickets';
import DashboardHeader from '../components/DashboardHeader';
import DashboardBody from '../components/DashboardBody';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  // Auth hook
  const { signOut, memberships, getCurrentOrganization, setCurrentOrganizationId } = useAuth();
  const selectedOrg = getCurrentOrganization();

  // Ticket hook
  const {
    tickets,
    isLoading,
    deleteTicket,
    addTag,
    removeTag
  } = useTickets(selectedOrg?.id);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Organization hook
  const {
    availableOrgs,
    fetchAvailableOrgs,
    joinOrganization,
    createOrganization
  } = useOrganization();

  return (
    <div className="min-h-screen flex flex-col bg-zen-bg">
      <DashboardHeader
        signOut={signOut}
        memberships={memberships}
        selectedOrg={selectedOrg}
        setCurrentOrganizationId={setCurrentOrganizationId}
        availableOrgs={availableOrgs}
        fetchAvailableOrgs={fetchAvailableOrgs}
        createOrganization={createOrganization}
        joinOrganization={joinOrganization}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <DashboardBody
          selectedOrg={selectedOrg}
          isLoading={isLoading}
          tickets={tickets}
          selectedTicket={selectedTicket}
          onSelectTicket={setSelectedTicket}
          onDeleteTicket={deleteTicket}
          addTag={addTag}
          removeTag={removeTag}
        />
      </div>
    </div>
  );
}
