// src/hooks/useAuth.js

import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function AuthStateManager({ children }) {
  const navigate = useNavigate();
  const { setSession, setProfile } = useContext(AuthContext);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        navigate('/dashboard');
      }
    });

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {      
      if (event === 'SIGNED_IN') {
        setSession(session);
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setSession, setProfile]);

  return children;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  }

  async function createOrFetchProfile(user) {
    const { data } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: user.user_metadata.full_name
      })
      .select()
      .single();
    setProfile(data);
  }

  const value = {
    session,
    setSession,
    profile,
    setProfile,
    fetchProfile,
    createOrFetchProfile,
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
    signOut: () => supabase.auth.signOut()
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
