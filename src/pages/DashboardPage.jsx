// src/pages/DashboardPage.jsx

import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const { tickets, isLoading, error } = useTickets();

  if (error) {
    return (
      <div className="min-h-screen bg-zen-bg">
        <header className="w-full p-6 border-b border-zen-border/30">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 border border-zen-border/30 p-6 rounded">
              <h3 className="text-zen-primary font-medium">Error loading tickets</h3>
              <p className="text-zen-secondary mt-2">{error}</p>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zen-bg">
      <header className="w-full p-6 border-b border-zen-border/30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-zen-primary text-2xl font-semibold">Support Desk</h1>
          <div className="flex items-center gap-4">
            <span className="text-zen-secondary">
              {profile?.full_name} ({profile?.role || 'customer'})
            </span>
            <button 
              onClick={signOut} 
              className="px-4 py-2 border border-zen-border/50 text-zen-primary hover:bg-white/20"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <TicketForm />
        
        <div className="mt-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 mx-auto border-4 border-zen-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <TicketList tickets={tickets} />
          )}
        </div>
      </main>
    </div>
  );
}
