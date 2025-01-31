import React from 'react';
import AgentInterface from '../AgentInterface';

export default function AgentDashboard({ organization }) {
  if (!organization?.id) {
    return (
      <div className="h-full w-full bg-zen-bg flex items-center justify-center">
        <p className="text-zen-secondary">No organization selected</p>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full bg-zen-bg">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <AgentInterface organizationId={organization.id} />
        </div>
      </div>
    </div>
  );
} 