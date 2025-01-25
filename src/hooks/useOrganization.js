import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

/**
 * Manages logic related to organizations:
 *  - create new org
 *  - join existing org
 *  - fetch orgs not yet joined
 */
export function useOrganization() {
  const { session, memberships, setMemberships, setCurrentOrganizationId } = useAuth();
  const [availableOrgs, setAvailableOrgs] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Fetch organizations from the database that the user is not yet a member of.
   */
  const fetchAvailableOrgs = useCallback(async () => {
    try {
      setError(null);
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter out organizations user is already a member of
      const memberOrgIds = new Set(memberships.map(m => m.organization_id));
      const filtered = (data || []).filter(org => !memberOrgIds.has(org.id));
      setAvailableOrgs(filtered);
    } catch (err) {
      console.error('Error fetching available organizations:', err);
      setError(err.message);
    }
  }, [memberships]);

  /**
   * Create a new organization (and create an admin membership).
   */
  const createOrganization = useCallback(
    async (orgName) => {
      if (!session?.user?.id) return;

      try {
        setError(null);

        // Create the organization
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({ name: orgName })
          .select()
          .single();

        if (orgError) throw orgError;

        // Create admin membership
        const { data: membership, error: membershipError } = await supabase
          .from('user_organization_memberships')
          .insert({
            user_id: session.user.id,
            organization_id: org.id,
            user_role: 'admin',
          })
          .select('*, organization:organizations(*)')
          .single();

        if (membershipError) throw membershipError;

        // Update local memberships
        setMemberships(prev => [...prev, membership]);
        setCurrentOrganizationId(org.id);
      } catch (err) {
        console.error('Error creating organization:', err);
        setError(err.message);
      }
    },
    [session, setMemberships, setCurrentOrganizationId]
  );

  /**
   * Join an existing organization.
   */
  const joinOrganization = useCallback(
    async (orgId) => {
      if (!session?.user?.id) return;

      try {
        setError(null);
        const { data: membership, error: joinError } = await supabase
          .from('user_organization_memberships')
          .insert({
            user_id: session.user.id,
            organization_id: orgId,
            user_role: 'customer',
          })
          .select('*, organization:organizations(*)')
          .single();

        if (joinError) throw joinError;

        if (membership) {
          setMemberships(prev => [...prev, membership]);
          setCurrentOrganizationId(orgId);
        }
      } catch (err) {
        console.error('Error joining organization:', err);
        setError(err.message);
      }
    },
    [session, setMemberships, setCurrentOrganizationId]
  );

  return {
    availableOrgs,
    error,
    fetchAvailableOrgs,
    joinOrganization,
    createOrganization,
  };
} 