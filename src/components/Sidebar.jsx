export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-zen-border/30 bg-zen-bg p-6">
      <div className="space-y-1">
        <button className="w-full h-10 px-4 py-2 text-sm text-left bg-zen-primary text-white">
          Tickets
        </button>
        <button className="w-full h-10 px-4 py-2 text-sm text-left text-zen-secondary hover:bg-zen-border/30">
          Agents
        </button>
        <button className="w-full h-10 px-4 py-2 text-sm text-left text-zen-secondary hover:bg-zen-border/30">
          Settings
        </button>
      </div>
    </aside>
  );
} 