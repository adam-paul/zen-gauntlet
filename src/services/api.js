// src/services/api.js

export const ticketService = {
  async getAll() {
    return supabase.from('tickets').select('*');
  },
  
  async create(ticket) {
    return supabase.from('tickets').insert(ticket);
  },
  
  async update(id, changes) {
    return supabase.from('tickets').update(changes).eq('id', id);
  }
};
