import { useAuth } from '../hooks/useAuth';
import { useTicket } from '../hooks/useTicket';
import { DIFFICULTY_COLORS, DIFFICULTY_LEVELS } from '../utils/constants';

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
      {DIFFICULTY_LEVELS.map((difficulty) => (
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
