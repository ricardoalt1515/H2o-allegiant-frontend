// Export all stores and their hooks for easy importing
export * from './project-store'
export * from './ui-store'
export * from './ai-store'
export * from './technical-data-store'

// Re-export common types that might be needed
export type {
  ProjectSummary,
  ProjectDetail,
  ProjectStatus,
  ProjectSector,
  ProposalVersion,
  TimelineEvent
} from '../project-types'

// Store initialization utilities
export const initializeStores = async () => {
  // This function can be called on app startup to initialize stores
  // For now, it's just a placeholder for future initialization logic
  console.log('H2O Allegiant stores initialized')
}

// Store reset utilities (useful for testing or logout)
export const resetAllStores = () => {
  // Clear all persisted state
  localStorage.removeItem('h2o-project-store')
  localStorage.removeItem('h2o-ui-store')
  localStorage.removeItem('h2o-ai-store')

  // Reload to reset in-memory state
  window.location.reload()
}