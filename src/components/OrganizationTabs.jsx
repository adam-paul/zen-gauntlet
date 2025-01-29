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
  isLoading
}) {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const dropdownRef = useRef(null);

  useDropdown(dropdownRef, () => setShowOrgDropdown(false));

  const handleCreateOrg = async (data) => {
    try {
      await createOrganization(data);
    } finally {
      setShowCreateModal(false);
    }
  };

  const handleJoinOrg = async (orgId) => {
    try {
      await joinOrganization(orgId);
    } finally {
      setShowJoinModal(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Organization tabs */}
      <div className="flex gap-2">
        {memberships.map(({ organization }) => (
          <button
            key={organization.id}
            onClick={() => !isLoading && setCurrentOrganizationId(organization.id)}
            disabled={isLoading}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedOrg?.id === organization.id
                ? isLoading
                  ? 'bg-zen-primary/50 text-white/70 cursor-not-allowed'
                  : 'bg-zen-primary text-white'
                : isLoading
                ? 'text-zen-secondary/50 cursor-not-allowed'
                : 'text-zen-secondary hover:bg-zen-border/30'
            }`}
          >
            {organization.name}
          </button>
        ))}
      </div>

      {/* "New Org" button + dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => !isLoading && setShowOrgDropdown(!showOrgDropdown)}
          disabled={isLoading}
          className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 transition-colors ${
            isLoading
              ? 'bg-zen-primary/50 text-white/70 cursor-not-allowed'
              : 'bg-zen-primary text-white hover:bg-zen-hover'
          }`}
        >
          <Plus size={14} />
          New Org
          <ChevronDown size={14} />
        </button>
        {showOrgDropdown && !isLoading && (
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

      {/* Modals */}
      {showCreateModal && (
        <OrganizationModal
          mode="create"
          onSubmit={handleCreateOrg}
          onClose={() => setShowCreateModal(false)}
          isLoading={isLoading}
        />
      )}

      {showJoinModal && (
        <OrganizationModal
          mode="join"
          onSubmit={handleJoinOrg}
          onClose={() => setShowJoinModal(false)}
          isLoading={isLoading}
          availableOrgs={availableOrgs}
        />
      )}
    </div>
  );
} 