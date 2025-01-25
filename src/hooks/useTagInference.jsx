import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useTagInference() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const inferTags = async (description) => {
    if (!description?.trim()) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('infer-tags', {
        body: { description }
      });

      if (error) throw error;
      return data.tags || [];
    } catch (err) {
      setError(err.message || 'Failed to infer tags');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inferTags,
    isLoading,
    error
  };
} 