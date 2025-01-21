// src/components/AuthForm.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingButton from './LoadingButton';

export default function AuthForm({ mode = 'signIn' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    
    if (mode === 'signIn') {
      try {
        const { error } = await signIn({ email, password });
        if (error) throw error;
      } catch (error) {
        console.error(error.message);
        setIsLoading(false);
      }
      return;
    }

    const { error } = await signUp({ email, password, fullName });
    if (error) {
      console.error(error.message);
      setIsLoading(false);
      return;
    }

    // Clear form and show confirmation message
    setConfirmationSent(true);
    setEmail('');
    setPassword('');
    setFullName('');
  }

  if (confirmationSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 bg-white/80 border border-zen-border/30 rounded">
          <h3 className="font-medium text-zen-primary">Check your email!</h3>
          <p className="text-zen-secondary mt-2">
            We've sent a confirmation link to your email address. 
            Please click the link to complete your registration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signUp' && (
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-zen-secondary font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full p-2 border border-zen-border/50 bg-white/80 focus:outline-none focus:border-zen-primary"
          />
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-zen-secondary font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border border-zen-border/50 bg-white/80 focus:outline-none focus:border-zen-primary"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-zen-secondary font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border border-zen-border/50 bg-white/80 focus:outline-none focus:border-zen-primary"
        />
      </div>
      <LoadingButton 
        type="submit" 
        isLoading={isLoading}
        className="w-full px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover"
      >
        {mode === 'signIn' ? 'Sign In' : 'Sign Up'}
      </LoadingButton>
    </form>
  );
}
