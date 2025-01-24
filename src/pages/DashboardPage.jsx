// src/pages/DashboardPage.jsx

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { supabase } from '../lib/supabase';
import { ChevronDown, Plus, LogIn } from 'lucide-react';
import { useDropdown } from '../utils/EventHandlers';
import ProfileDropdown from '../components/ProfileDropdown';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';
import NotificationDropdown from '../components/NotificationDropdown';

export default function DashboardPage() {
  const { session, setCurrentOrganizationId, memberships, getCurrentOrganization, signOut, setMemberships } = useAuth();
  const selectedOrg = getCurrentOrganization();
  const { 
    tickets, 
    isLoading, 
    deleteTicket: deleteTicketFromHook, 
    addTag,
    removeTag
  } = useTickets(selectedOrg?.id);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showJoinOrg, setShowJoinOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [availableOrgs, setAvailableOrgs] = useState([]);
  const dropdownRef = useRef(null);

  // Use combined dropdown handler
  useDropdown(dropdownRef, () => setShowOrgDropdown(false));

  // Fetch available organizations
  useEffect(() => {
    const fetchAvailableOrgs = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      // Filter out organizations user is already a member of
      const memberOrgIds = new Set(memberships.map(m => m.organization_id));
      setAvailableOrgs(data?.filter(org => !memberOrgIds.has(org.id)) || []);
    };

    if (showJoinOrg) {
      fetchAvailableOrgs();
    }
  }, [showJoinOrg, memberships]);

  // Join organization
  const joinOrganization = async (orgId) => {
    const { data: membership, error } = await supabase
      .from('user_organization_memberships')
      .insert({
        user_id: session.user.id,
        organization_id: orgId,
        user_role: 'customer'
      })
      .select('*, organization:organizations(*)')
      .single();

    if (error) {
      console.error('Error joining organization:', error);
      return;
    }

    // Update local memberships state with properly structured data
    if (membership) {
      setMemberships(prev => [...prev, membership]);
      setCurrentOrganizationId(orgId);
      setShowJoinOrg(false);
      setShowOrgDropdown(false);
    }
  };

  // Create new organization
  const createOrganization = async (e) => {
    e.preventDefault();
    
    try {
      // Create the organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: newOrgName })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create admin membership
      const { data: membership, error: membershipError } = await supabase
        .from('user_organization_memberships')
        .insert({
          user_id: session.user.id,
          organization_id: org.id,
          user_role: 'admin'
        })
        .select('*, organization:organizations(*)')
        .single();

      if (membershipError) throw membershipError;

      // Update local memberships state
      setMemberships(prev => [...prev, membership]);
      setCurrentOrganizationId(org.id);
      setShowOrgForm(false);
      setShowOrgDropdown(false);
      setNewOrgName('');
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  const deleteTicket = async (ticketId) => {
    const { error } = await deleteTicketFromHook(ticketId);
    if (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zen-bg">
      <header className="w-full p-6 border-b border-zen-border/30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-zen-primary text-2xl font-semibold">Zen Gauntlet</h1>
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

      {/* Org creation form */}
      {showOrgForm && (
        <div className="max-w-6xl mx-auto p-6">
          <form onSubmit={createOrganization} className="bg-zen-bg p-6 space-y-4 border border-zen-border/30">
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

      {/* Join organization form */}
      {showJoinOrg && (
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-zen-bg p-6 space-y-4 border border-zen-border/30">
            <h3 className="text-lg font-medium text-zen-primary">Available Organizations</h3>
            {availableOrgs.length === 0 ? (
              <p className="text-zen-secondary">No organizations available to join.</p>
            ) : (
              <div className="space-y-2">
                {availableOrgs.map(org => (
                  <div key={org.id} className="flex justify-between items-center p-2 hover:bg-white/20">
                    <span className="text-zen-secondary">{org.name}</span>
                    <button
                      onClick={() => joinOrganization(org.id)}
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

      <main className={`transition-all duration-300 ${selectedTicket ? 'pr-96' : ''}`}>
        <div className="max-w-6xl mx-auto p-6">
          {!selectedOrg ? (
            <div className="text-center py-12 bg-white/80 border border-zen-border/30">
              <h2 className="text-xl text-zen-secondary">Select an organization to view dashboard</h2>
            </div>
          ) : (
            <>
              <TicketForm organizationId={selectedOrg.id} />
              <div className="mt-8">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 mx-auto border-4 border-zen-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <TicketList 
                    tickets={tickets}
                    selectedTicket={selectedTicket}
                    onSelectTicket={setSelectedTicket}
                    onDeleteTicket={deleteTicket}
                    addTag={addTag}
                    removeTag={removeTag}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
