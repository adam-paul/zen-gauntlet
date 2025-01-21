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
    navigate('/dashboard');
    
    // Get or create profile as a standard operation
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
      
    if (existingProfile) {
      setProfile(existingProfile);
      return;
    }
    
    // No profile exists, create one
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        role: 'customer',
        full_name: session.user.user_metadata?.full_name
      })
      .select()
      .single();
      
    if (newProfile) setProfile(newProfile);
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
    signUp: ({ email, password, fullName }) => 
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/confirm`
        }
      }),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error during sign out:', error.message);
        // Force clean up the session state regardless of the API call result
        setSession(null);
        setProfile(null);
      } catch (err) {
        console.error('Error during sign out:', err.message);
        // Force clean up the session state even if the API call fails
        setSession(null);
        setProfile(null);
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
