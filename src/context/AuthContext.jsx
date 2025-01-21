// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role, full_name, organization_id')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      setProfile(existingProfile);
      return existingProfile;
    }
    
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert([{ id: userId, role: 'customer' }])
      .select('id, role, full_name, organization_id')
      .single();
    
    setProfile(newProfile);
    return newProfile;
  };

  const signIn = async (data) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });
    
    if (error) throw error;
    return { data: authData, error: null };
  };

  const signUp = async (data) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } }
    });
    
    if (error) throw error;
    
    if (authData.user && authData.session) {
      await fetchProfile(authData.user.id);
    }
    
    return { data: authData, error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setUser(session?.user || null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        }
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (mounted) {
            setUser(session?.user || null);
            if (session?.user) {
              await fetchProfile(session.user.id);
            } else {
              setProfile(null);
            }
          }
        });

        if (mounted) {
          setLoading(false);
        }

        return () => subscription?.unsubscribe();
      } catch (error) {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
