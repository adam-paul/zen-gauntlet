// src/hooks/useMetrics.js

import { supabase } from '../lib/supabase';

export function useMetrics() {
  async function getResponseTimes() {
    return supabase
      .from('tickets')
      .select('created_at, resolved_at')
      .not('resolved_at', 'is', null);
  }

  return { getResponseTimes };
}
