// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    
    setProfile(data);
  };

  // Function to create a profile for new users
  const createProfile = async (userId, data = {}) => {
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          full_name: data.full_name || null,
          role: 'customer', // default role
          ...data
        }
      ]);

    if (error) {
      console.error('Error creating profile:', error);
      return;
    }

    await fetchProfile(userId);
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data) => {
    const { data: authData, error: authError } = await supabase.auth.signUp(data);
    
    if (authError) {
      throw authError;
    }

    if (authData.user) {
      await createProfile(authData.user.id, {
        full_name: data.full_name // if you're collecting name during signup
      });
    }

    return { data: authData, error: null };
  };

  const value = {
    signUp,
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
    profile,
    loading,
    refreshProfile: () => user && fetchProfile(user.id),
    updateProfile: async (updates) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (!error) {
        await fetchProfile(user.id);
      }
      
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
