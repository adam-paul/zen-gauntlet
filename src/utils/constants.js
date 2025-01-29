/**
 * Status-related constants
 */
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export const STATUS_COLORS = {
  open: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
  in_progress: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  resolved: 'bg-green-100 hover:bg-green-200 text-green-800',
  closed: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
};

// Non-interactive version (no hover states)
export const STATUS_COLORS_STATIC = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

/**
 * Difficulty/Rank-related constants
 */
export const DIFFICULTY_LEVELS = ['easy', 'moderate', 'hard'];

export const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 hover:bg-green-200 text-green-800',
  moderate: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  hard: 'bg-red-100 hover:bg-red-200 text-red-800'
};

// Non-interactive version (no hover states)
export const DIFFICULTY_COLORS_STATIC = {
  easy: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
};

/**
 * User roles
 */
export const USER_ROLES = ['admin', 'agent', 'customer'];

/**
 * UI Constants
 */
export const MAX_TAGS = 5; 