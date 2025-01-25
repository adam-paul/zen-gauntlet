import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, LogIn } from 'lucide-react';
import { useDropdown } from '../utils/EventHandlers';

/**
 * Renders organization tabs for the user's memberships,
 * plus "New Org" actions for creating or joining an org.
 * Also renders the forms for create/join.
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
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [showJoinOrg, setShowJoinOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  const dropdownRef = useRef(null);
  useDropdown(dropdownRef, () => setShowOrgDropdown(false));

  // If the user opens the "join org" flow, fetch the list of available organizations
  useEffect(() => {
    if (showJoinOrg) {
      fetchAvailableOrgs();
    }
  }, [showJoinOrg, fetchAvailableOrgs]);

  // Handle create org form submission
  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    await createOrganization(newOrgName);
    setNewOrgName('');
    setShowOrgForm(false);
    setShowOrgDropdown(false);
  };

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
            <div className="absolute left-0 mt-1 w-48 bg-white border border-zen-border/30 rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  setShowOrgForm(true);
                  setShowJoinOrg(false);
                  setShowOrgDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-zen-secondary hover:bg-zen-bg flex items-center gap-2"
              >
                <Plus size={14} />
                Create Organization
              </button>
              <button
                onClick={() => {
                  setShowJoinOrg(true);
                  setShowOrgForm(false);
                  setShowOrgDropdown(false);
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

      {/* Create Organization Form */}
      {showOrgForm && (
        <div className="max-w-6xl mx-auto p-6">
          <form
            onSubmit={handleCreateOrganization}
            className="bg-zen-bg p-6 space-y-4 border border-zen-border/30"
          >
            <input
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Organization name"
              className="w-full p-2 border border-zen-border/50 bg-white/80 focus:outline-none focus:border-zen-primary"
              required
            />
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowOrgForm(false)}
                className="px-4 py-2 text-zen-primary border border-zen-border/50 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Join Organization Form */}
      {showJoinOrg && (
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-zen-bg p-6 space-y-4 border border-zen-border/30">
            <h3 className="text-lg font-medium text-zen-primary">Available Organizations</h3>
            {availableOrgs.length === 0 ? (
              <p className="text-zen-secondary">No organizations available to join.</p>
            ) : (
              <div className="space-y-2">
                {availableOrgs.map(org => (
                  <div
                    key={org.id}
                    className="flex justify-between items-center p-2 hover:bg-white/20"
                  >
                    <span className="text-zen-secondary">{org.name}</span>
                    <button
                      onClick={() => {
                        joinOrganization(org.id);
                        setShowJoinOrg(false);
                      }}
                      className="px-3 py-1 text-sm bg-zen-primary text-white rounded-md hover:bg-zen-hover flex items-center gap-1"
                    >
                      <LogIn size={14} />
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowJoinOrg(false)}
                className="px-4 py-2 text-zen-primary border border-zen-border/50 hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 