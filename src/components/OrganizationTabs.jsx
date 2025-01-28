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
  const [localLoading, setLocalLoading] = useState(false);
  const dropdownRef = useRef(null);

  useDropdown(dropdownRef, () => setShowOrgDropdown(false));

  const handleCreateOrg = async (data) => {
    setLocalLoading(true);
    try {
      await createOrganization(data);
    } finally {
      setLocalLoading(false);
      setShowCreateModal(false);
    }
  };

  const handleJoinOrg = async (orgId) => {
    setLocalLoading(true);
    try {
      await joinOrganization(orgId);
    } finally {
      setLocalLoading(false);
      setShowJoinModal(false);
    }
  };

  // Combine local and parent loading states
  const isLoadingAny = isLoading || localLoading;

  return (
    <div className="flex items-center gap-4">
      {/* Organization tabs */}
      <div className="flex gap-2">
        {memberships.map(({ organization }) => (
          <button
            key={organization.id}
            onClick={() => !isLoadingAny && setCurrentOrganizationId(organization.id)}
            disabled={isLoadingAny}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedOrg?.id === organization.id
                ? isLoadingAny
                  ? 'bg-zen-primary/50 text-white/70 cursor-not-allowed'
                  : 'bg-zen-primary text-white'
                : isLoadingAny
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
          onClick={() => !isLoadingAny && setShowOrgDropdown(!showOrgDropdown)}
          disabled={isLoadingAny}
          className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 transition-colors ${
            isLoadingAny
              ? 'bg-zen-primary/50 text-white/70 cursor-not-allowed'
              : 'bg-zen-primary text-white hover:bg-zen-hover'
          }`}
        >
          <Plus size={14} />
          New Org
          <ChevronDown size={14} />
        </button>
        {showOrgDropdown && !isLoadingAny && (
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
          isLoading={localLoading}
        />
      )}

      {showJoinModal && (
        <OrganizationModal
          mode="join"
          onSubmit={handleJoinOrg}
          onClose={() => setShowJoinModal(false)}
          isLoading={localLoading}
          availableOrgs={availableOrgs}
        />
      )}
    </div>
  );
} 