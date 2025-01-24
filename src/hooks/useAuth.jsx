// src/hooks/useAuth.js

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function AuthStateManager({ children }) {
  const navigate = useNavigate();
  const { setSession, setProfile, setMemberships: setAuthMemberships, setCurrentOrganizationId } = useContext(AuthContext);

  const handleSession = useCallback(async (session) => {
    if (!session) {
      setSession(null);
      setProfile(null);
      setAuthMemberships([]);
      setCurrentOrganizationId(null);
      localStorage.removeItem('lastSelectedOrgId');
      return;
    }
  
    setSession(session);
  
    // Fetch profile and memberships
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', session.user.id)
      .maybeSingle();
  
    const { data: memberships } = await supabase
      .from('user_organization_memberships')
      .select('*, organization:organizations(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
  
    setAuthMemberships(memberships || []);
    setProfile(existingProfile);
    
    // Try to restore last selected organization
    const lastSelectedOrgId = localStorage.getItem('lastSelectedOrgId');
    if (lastSelectedOrgId && memberships?.some(m => m.organization_id === lastSelectedOrgId)) {
      setCurrentOrganizationId(lastSelectedOrgId);
    }
  
    navigate('/dashboard');
  }, [setSession, setProfile, setAuthMemberships, setCurrentOrganizationId, navigate]);

  useEffect(() => {
    let mounted = true;
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) handleSession(session);
    });

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {      
      if (!mounted) return;
      
      if (event === 'SIGNED_IN') {
        handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        navigate('/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession, setSession, setProfile, navigate]);

  return children;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [currentOrganizationId, _setCurrentOrganizationId] = useState(null);

  // Wrap setCurrentOrganizationId to persist to localStorage
  const setCurrentOrganizationId = useCallback((orgId) => {
    _setCurrentOrganizationId(orgId);
    if (orgId) {
      localStorage.setItem('lastSelectedOrgId', orgId);
    } else {
      localStorage.removeItem('lastSelectedOrgId');
    }
  }, []);

  const value = {
    session,
    setSession,
    profile,
    setProfile,
    memberships,
    setMemberships,
    currentOrganizationId,
    setCurrentOrganizationId,
    getCurrentRole: () => {
      if (!currentOrganizationId) return null;
      const membership = memberships.find(m => m.organization_id === currentOrganizationId);
      return membership?.user_role;
    },
    getCurrentOrganization: () => {
      if (!currentOrganizationId) return null;
      const membership = memberships.find(m => m.organization_id === currentOrganizationId);
      return membership?.organization;
    },
    signUp: ({ email, password, fullName, role, organizationName, organizationId }) => 
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName,
            role,
            organization_name: organizationName,
            organization_id: organizationId
          },
          emailRedirectTo: `${window.location.origin}/confirm`
        }
      }),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        // Force cleanup even if the signOut fails
        setSession(null);
        setProfile(null);
        navigate('/login');
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      <AuthStateManager>
        {children}
      </AuthStateManager>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
