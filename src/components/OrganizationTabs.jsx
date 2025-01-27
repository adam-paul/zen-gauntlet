import { useState, useRef } from 'react';
import { ChevronDown, Plus, LogIn } from 'lucide-react';
import { useDropdown } from '../utils/EventHandlers';
import OrganizationModal from './OrganizationModal';

/**
 * Renders organization tabs for the user's memberships,
 * plus "New Org" actions for creating or joining an org.
 */
export default function OrganizationTabs({
  memberships,
  selectedOrg,
  setCurrentOrganizationId,
  availableOrgs,
  fetchAvailableOrgs,
  createOrganization,
  joinOrganization,
}) {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const dropdownRef = useRef(null);
  useDropdown(dropdownRef, () => setShowOrgDropdown(false));

  return (
    <div className="flex items-center gap-6">
      {/* Tab buttons for each org membership */}
      <div className="flex gap-2">
        {memberships.map(m => (
          <button
            key={m.organization.id}
            onClick={() => setCurrentOrganizationId(m.organization.id)}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedOrg?.id === m.organization.id
                ? 'bg-zen-primary text-white'
                : 'bg-zen-bg text-zen-secondary hover:bg-zen-border/30'
            }`}
          >
            {m.organization.name}
          </button>
        ))}

        {/* "New Org" button + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="px-3 py-1 text-sm bg-zen-primary text-white rounded-md hover:bg-zen-hover flex items-center gap-1"
          >
            <Plus size={14} />
            New Org
            <ChevronDown size={14} />
          </button>
          {showOrgDropdown && (
            <div className="absolute left-0 mt-1 w-48 bg-zen-element border border-zen-border/30 rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setShowOrgDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-zen-secondary hover:bg-zen-bg flex items-center gap-2"
              >
                <Plus size={14} />
                Create Organization
              </button>
              <button
                onClick={() => {
                  setShowJoinModal(true);
                  setShowOrgDropdown(false);
                  fetchAvailableOrgs();
                }}
                className="w-full px-4 py-2 text-left text-sm text-zen-secondary hover:bg-zen-bg flex items-center gap-2"
              >
                <LogIn size={14} />
                Join Organization
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OrganizationModal
        mode="create"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createOrganization}
      />
      <OrganizationModal
        mode="join"
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={joinOrganization}
        availableOrgs={availableOrgs}
      />
    </div>
  );
} 