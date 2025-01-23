import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingService } from '../services/onboarding';
import { useAuth } from './useAuth';

export function useOnboarding() {
  const navigate = useNavigate();
  const { setProfile } = useAuth();

  const handleConfirmation = useCallback(async (user) => {
    const { status, profile, error } = await onboardingService.handleNewUserConfirmation(user);
    
    if (error) {
      console.error('Onboarding error:', error);
      navigate('/login');
      return;
    }

    if (profile) {
      setProfile(profile);
      navigate('/dashboard');
    }

    return { status };
  }, [navigate, setProfile]);

  return {
    handleConfirmation
  };
} 