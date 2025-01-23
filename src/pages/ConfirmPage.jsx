// src/pages/ConfirmPage.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useOnboarding } from '../hooks/useOnboarding';

export default function ConfirmPage() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleConfirmation } = useOnboarding();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        try {
          await handleConfirmation(session.user);
        } catch (err) {
          setError('Failed to complete onboarding. Please try again.');
          navigate('/login', { replace: true });
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Do nothing, wait for SIGNED_IN
      } else {
        setError('Verification failed. Please try again.');
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, handleConfirmation]);

  if (error) {
    return (
      <div className="min-h-screen bg-zen-bg flex items-center justify-center p-6">
        <div className="p-6 bg-white/80 border border-zen-border/30 rounded max-w-md">
          <h3 className="font-medium text-zen-primary">Error Confirming Email</h3>
          <p className="text-zen-secondary mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zen-bg flex items-center justify-center p-6">
      <div className="p-6 bg-white/80 border border-zen-border/30 rounded max-w-md flex items-center space-x-4">
        <svg className="animate-spin h-5 w-5 text-zen-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div>
          <h3 className="font-medium text-zen-primary">Confirming your email...</h3>
          <p className="text-zen-secondary mt-2">Please wait while we verify your account.</p>
        </div>
      </div>
    </div>
  );
}
