/**
 * Centralized route definitions
 * Usage: ROUTES.PROJECT('123') instead of `/project/${id}`
 */
export const ROUTES = {
  // Main navigation
  HOME: '/',
  DASHBOARD: '/dashboard',

  // Project routes
  PROJECT: (id: string) => `/project/${id}`,
  PROJECT_TECHNICAL: (id: string) => `/project/${id}?tab=technical`,
  PROJECT_PROPOSALS: (id: string) => `/project/${id}?tab=proposals`,
  PROJECT_FILES: (id: string) => `/project/${id}?tab=files`,
  PROJECT_VERSIONS: (id: string) => `/project/${id}?tab=versions`,
  PROJECT_ENGINEERING: (id: string) => `/project/${id}?tab=engineering`,

  // Proposal routes
  PROPOSAL_DETAIL: (projectId: string, proposalId: string) =>
    `/project/${projectId}/proposals/${proposalId}`,

  // Settings & account
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const

/**
 * Tab values for project navigation
 */
export const PROJECT_TABS = {
  OVERVIEW: 'overview',
  TECHNICAL: 'technical',
  ENGINEERING: 'engineering',
  PROPOSALS: 'proposals',
  FILES: 'files',
  VERSIONS: 'versions',
} as const

export type ProjectTab = typeof PROJECT_TABS[keyof typeof PROJECT_TABS]

/**
 * Query parameter keys
 */
export const QUERY_PARAMS = {
  TAB: 'tab',
  QUICKSTART: 'quickstart',
  SEARCH: 'q',
  STATUS: 'status',
  FILTER: 'filter',
} as const