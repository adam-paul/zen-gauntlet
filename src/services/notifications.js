// src/services/notifications.js
import { supabase } from '../lib/supabase';

export const notificationService = {
  async createWebhookEndpoint(url, events) {
    const { data } = await supabase
      .from('webhooks')
      .insert({ url, events });
    return data;
  },

  async triggerWebhook(event, payload) {
    const { data } = await supabase
      .from('webhooks')
      .select('url')
      .contains('events', [event]);
    
    data.forEach(({ url }) => {
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    });
  }
};
