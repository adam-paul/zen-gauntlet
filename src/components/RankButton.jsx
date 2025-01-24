import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 hover:bg-green-200 text-green-800',
  moderate: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  hard: 'bg-red-100 hover:bg-red-200 text-red-800',
};

export default function RankButton({ ticketId, currentDifficulty }) {
  const { getCurrentRole } = useAuth();
  const currentRole = getCurrentRole();
  
  if (currentRole !== 'admin') return null;

  async function updateDifficulty(difficulty) {
    // If clicking the same difficulty, set to null (deselect)
    const newDifficulty = currentDifficulty === difficulty ? null : difficulty;
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ difficulty: newDifficulty })
        .eq('id', ticketId);
        
      if (error) {
        console.error('Error updating difficulty:', error);
      }
    } catch (err) {
      console.error('Failed to update difficulty:', err);
    }
  }

  return (
    <div className="flex gap-1" style={{ minHeight: '28px' }}>
      {['easy', 'moderate', 'hard'].map((difficulty) => (
        <button
          key={difficulty}
          onClick={() => updateDifficulty(difficulty)}
          className={`
            px-2 py-1 text-xs rounded-md transition-colors whitespace-nowrap
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
