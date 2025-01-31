import React from 'react';
import AgentInterface from '../AgentInterface';
import { useOrganization } from '../../hooks/useOrganization';

export default function AgentDashboard() {
  const { currentOrganization } = useOrganization();
  
  return (
    <div className="h-full w-full bg-zen-bg">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <AgentInterface organizationId={currentOrganization?.id} />
        </div>
      </div>
    </div>
  );
} 