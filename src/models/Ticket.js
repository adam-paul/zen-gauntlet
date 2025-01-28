/**
 * Ticket data model and type definitions
 */
class Ticket {
  constructor(data) {
    this.id = data.id
    this.organization_id = data.organization_id
    this.title = data.title
    this.description = data.description
    this.status = data.status || 'open'
    this.difficulty = data.difficulty
    this.tags = data.tags || []
    this.created_at = data.created_at
    this.created_by = data.created_by
  }

  // Display helpers
  get displayDate() {
    return new Date(this.created_at).toLocaleDateString()
  }

  get truncatedDescription() {
    return this.description.length > 30 
      ? `${this.description.substring(0, 30)}...` 
      : this.description
  }

  // Business logic
  canBeDeletedBy(userId, role) {
    return role === 'admin' || this.created_by === userId
  }

  // Data serialization
  toJSON() {
    return {
      id: this.id,
      organization_id: this.organization_id,
      title: this.title,
      description: this.description,
      status: this.status,
      difficulty: this.difficulty,
      tags: [...this.tags],
      created_at: this.created_at,
      created_by: this.created_by
    }
  }
}

export default Ticket 