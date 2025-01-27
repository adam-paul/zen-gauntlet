export default function Sidebar() {
  return (
    <aside className="h-100vh w-64 border-r border-zen-border/30 bg-zen-bg p-4">
      <div className="space-y-1">
        <button className="w-full px-4 py-2 text-sm text-left rounded-md bg-zen-primary text-white">
          Tickets
        </button>
        <button className="w-full px-4 py-2 text-sm text-left rounded-md text-zen-secondary hover:bg-zen-border/30">
          Agents
        </button>
        <button className="w-full px-4 py-2 text-sm text-left rounded-md text-zen-secondary hover:bg-zen-border/30">
          Settings
        </button>
      </div>
    </aside>
  );
} 