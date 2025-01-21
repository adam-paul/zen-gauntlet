// src/pages/LoginPage.jsx

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { getTimeOfDay } from '../utils/DatetimeUtils';

export default function LoginPage() {
  const [mode, setMode] = useState('signIn');
  const [searchParams] = useSearchParams();
  const confirmed = searchParams.get('confirmed');
  const timeOfDay = useMemo(() => getTimeOfDay(), []);
  
  return (
    <div className="min-h-screen bg-zen-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-zen-primary mb-2">
            Good {timeOfDay},
          </h1>
          <h2 className="text-2xl text-zen-secondary">
            Welcome to your Zen Gauntlet
          </h2>
        </div>
        {confirmed && (
          <div className="mb-6 p-4 bg-white/80 border border-zen-border/30 rounded">
            <h3 className="font-medium text-zen-primary">Email Confirmed!</h3>
            <p className="text-zen-secondary mt-2">
              Your account has been verified. You can now sign in.
            </p>
          </div>
        )}
        <div className="bg-zen-bg p-6 border border-zen-border/30">
          <h1 className="text-2xl font-semibold text-zen-primary mb-6">
            {mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </h1>
          <AuthForm mode={mode} />
          <button
            onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            className="mt-4 text-sm text-zen-primary hover:text-zen-hover"
          >
            {mode === 'signIn' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
