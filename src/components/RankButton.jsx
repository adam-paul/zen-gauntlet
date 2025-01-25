import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 hover:bg-green-200 text-green-800',
  moderate: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  hard: 'bg-red-100 hover:bg-red-200 text-red-800',
};

export default function RankButton({ ticketId, currentDifficulty, organizationId }) {
  const { getCurrentRole } = useAuth();
  const { updateDifficulty } = useTickets(organizationId);
  const currentRole = getCurrentRole();
  
  if (currentRole !== 'admin') return null;

  const handleDifficultyChange = async (difficulty) => {
    try {
      const { error } = await updateDifficulty(ticketId, difficulty);
      if (error) throw error;
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
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          {difficulty}
        </button>
      ))}
    </div>
  );
} 
