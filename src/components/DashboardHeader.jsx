import NotificationDropdown from '../components/NotificationDropdown';
import ProfileDropdown from '../components/ProfileDropdown';
import OrganizationTabs from '../components/OrganizationTabs';

/**
 * Renders the top header for the dashboard,
 * including the logo/brand, organization tabs,
 * notification dropdown, profile dropdown, and sign-out button.
 */
export default function DashboardHeader({
  signOut,
  memberships,
  selectedOrg,
  setCurrentOrganizationId,
  availableOrgs,
  fetchAvailableOrgs,
  createOrganization,
  joinOrganization
}) {
  return (
    <header className="w-full p-6 border-b border-zen-border/30">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-zen-primary text-2xl font-semibold">Zen Gauntlet</h1>
          <OrganizationTabs
            memberships={memberships}
            selectedOrg={selectedOrg}
            setCurrentOrganizationId={setCurrentOrganizationId}
            availableOrgs={availableOrgs}
            fetchAvailableOrgs={fetchAvailableOrgs}
            createOrganization={createOrganization}
            joinOrganization={joinOrganization}
          />
        </div>
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <ProfileDropdown />
          <button
            onClick={signOut}
            className="px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
} 