import { useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { useEscapeKey } from '../utils/EventHandlers';

export default function OrganizationModal({
  mode = 'create',
  isOpen,
  onClose,
  onSubmit,
  availableOrgs = [],
}) {
  const [newOrgName, setNewOrgName] = useState('');
  useEscapeKey(onClose);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'create') {
      await onSubmit(newOrgName);
      setNewOrgName('');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-zen-bg w-[500px] rounded-lg shadow-xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zen-border/30">
          <h3 className="text-lg font-medium text-zen-primary">
            {mode === 'create' ? 'Create Organization' : 'Join Organization'}
          </h3>
          <button
            onClick={onClose}
            className="text-zen-secondary hover:text-zen-primary"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Organization name"
                  className="w-full p-2 border border-zen-border/50 bg-white/80 focus:outline-none focus:border-zen-primary"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-zen-primary border border-zen-border/50 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zen-primary text-white hover:bg-zen-hover"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {availableOrgs.length === 0 ? (
                <p className="text-zen-secondary">No organizations available to join.</p>
              ) : (
                <div className="space-y-2">
                  {availableOrgs.map(org => (
                    <div
                      key={org.id}
                      className="flex justify-between items-center p-2 hover:bg-white/20"
                    >
                      <span className="text-zen-secondary">{org.name}</span>
                      <button
                        onClick={() => {
                          onSubmit(org.id);
                          onClose();
                        }}
                        className="px-3 py-1 text-sm bg-zen-primary text-white rounded-md hover:bg-zen-hover flex items-center gap-1"
                      >
                        <LogIn size={14} />
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-zen-primary border border-zen-border/50 hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 