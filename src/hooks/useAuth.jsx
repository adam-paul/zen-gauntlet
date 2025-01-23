// src/hooks/useAuth.js

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function AuthStateManager({ children }) {
  const navigate = useNavigate();
  const { setSession, setProfile } = useContext(AuthContext);

  const handleSession = useCallback(async (session) => {
    if (!session) {
      setSession(null);
      setProfile(null);
      return;
    }

    setSession(session);

    // Fetch existing profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
      
    if (existingProfile) {
      setProfile(existingProfile);
    }

    // Navigate based on profile existence
    if (existingProfile) {
      navigate('/dashboard');
    }
  }, [setSession, setProfile, navigate]);

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

  const value = {
    session,
    setSession,
    profile,
    setProfile,
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
