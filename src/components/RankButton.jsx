import { useAuth } from '../hooks/useAuth';
import { useTicket } from '../hooks/useTicket';

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 hover:bg-green-200 text-green-800',
  moderate: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  hard: 'bg-red-100 hover:bg-red-200 text-red-800',
};

export default function RankButton({ ticketId, currentDifficulty, organizationId, onChange }) {
  const { getCurrentRole } = useAuth();
  const { updateDifficulty } = useTicket(organizationId);
  const currentRole = getCurrentRole();
  
  if (currentRole !== 'admin') return null;

  const handleDifficultyChange = async (difficulty) => {
    try {
      // If clicking the same difficulty, set to null (deselect)
      const newDifficulty = currentDifficulty === difficulty ? null : difficulty;
      await updateDifficulty(ticketId, newDifficulty);
      onChange?.(newDifficulty);
    } catch (err) {
      console.error('Failed to update difficulty:', err);
    }
  };

  return (
    <div className="flex gap-1" style={{ minHeight: '28px' }}>
      {['easy', 'moderate', 'hard'].map((difficulty) => (
        <button
          key={difficulty}
          onClick={() => handleDifficultyChange(difficulty)}
          className={`
            px-2 py-1 text-xs rounded-md transition-colors duration-100 whitespace-nowrap
            ${currentDifficulty === difficulty 
              ? DIFFICULTY_COLORS[difficulty]
              : 'bg-zen-bg text-zen-text hover:bg-gray-200'
            }
          `}
        >
          {difficulty}
        </button>
      ))}
    </div>
  );
} 
