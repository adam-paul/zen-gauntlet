// src/pages/DashboardPage.jsx

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOrganization } from '../hooks/useOrganization';
import DashboardHeader from '../components/DashboardHeader';
import DashboardBody from '../components/DashboardBody';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  // Auth hook
  const { signOut, memberships, getCurrentOrganization, setCurrentOrganizationId } = useAuth();
  const selectedOrg = getCurrentOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('tickets');

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
        isLoading={isLoading}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <DashboardBody 
          selectedOrg={selectedOrg} 
          onLoadingChange={setIsLoading}
          activeSection={activeSection}
        />
      </div>
    </div>
  );
}
