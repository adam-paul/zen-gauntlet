import { useAuth } from '../hooks/useAuth'

export default function Sidebar({ activeSection, onSectionChange }) {
  const { getCurrentRole } = useAuth()
  const role = getCurrentRole()

  return (
    <aside className="w-64 border-r border-zen-border/30 bg-zen-bg p-6">
      <div className="space-y-1">
        <button 
          onClick={() => onSectionChange('tickets')}
          className={`w-full h-10 px-4 py-2 text-sm text-left ${
            activeSection === 'tickets' 
              ? 'bg-zen-primary text-white' 
              : 'text-zen-secondary hover:bg-zen-border/30'
          }`}
        >
          Tickets
        </button>
        <button 
          onClick={() => onSectionChange('agents')}
          className={`w-full h-10 px-4 py-2 text-sm text-left ${
            activeSection === 'agents' 
              ? 'bg-zen-primary text-white' 
              : 'text-zen-secondary hover:bg-zen-border/30'
          }`}
        >
          Agents
        </button>
        <button 
          onClick={() => onSectionChange('portal')}
          className={`w-full h-10 px-4 py-2 text-sm text-left ${
            activeSection === 'portal' 
              ? 'bg-zen-primary text-white' 
              : 'text-zen-secondary hover:bg-zen-border/30'
          }`}
        >
          {role === 'admin' ? 'Admin Portal' : 'Customer Portal'}
        </button>
        <button 
          onClick={() => onSectionChange('settings')}
          className={`w-full h-10 px-4 py-2 text-sm text-left ${
            activeSection === 'settings' 
              ? 'bg-zen-primary text-white' 
              : 'text-zen-secondary hover:bg-zen-border/30'
          }`}
        >
          Settings
        </button>
      </div>
    </aside>
  )
} 