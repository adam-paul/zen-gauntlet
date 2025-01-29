import { useProfile } from '../hooks/useProfile'

export default function AssigneeDisplay({ userId }) {
  const { profile, isLoading } = useProfile(userId)

  if (!userId) return null
  if (isLoading) return <span className="text-zen-secondary">Loading...</span>
  
  return (
    <span className="text-zen-secondary">
      @{profile?.full_name || 'Unknown'}
    </span>
  )
} 