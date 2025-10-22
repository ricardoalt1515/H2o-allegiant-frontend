/**
 * Centralized Route Definitions
 * Single source of truth para todas las URLs de la aplicación
 * 
 * Uso:
 * import { routes } from '@/lib/routes'
 * router.push(routes.project.technical(projectId))
 */

// ==============================================
// ROUTE BUILDER TYPES
// ==============================================

export type RouteBuilder<T extends Record<string, unknown> = Record<string, never>> = 
  T extends Record<string, never> ? string : (params: T) => string

// ==============================================
// TAB ENUMS
// ==============================================

export enum ProjectTab {
  Overview = 'overview',
  Technical = 'technical',
  Proposals = 'proposals',
  Files = 'files'
}

export enum ProposalView {
  Default = 'default',
  PDF = 'pdf',
  Edit = 'edit'
}

// ==============================================
// MAIN ROUTES
// ==============================================

export const routes = {
  // Root
  home: '/',
  
  // Dashboard
  dashboard: '/dashboard',
  
  // Projects
  project: {
    /**
     * Proyecto detail (vista general)
     * @param id - Project ID
     */
    detail: (id: string) => `/project/${id}` as const,
    
    /**
     * Proyecto con tab específico
     * @param id - Project ID
     * @param tab - Tab to show
     */
    tab: (id: string, tab: ProjectTab) => 
      `/project/${id}?tab=${tab}` as const,
    
    /**
     * Overview tab
     */
    overview: (id: string) => 
      `/project/${id}?tab=${ProjectTab.Overview}` as const,
    
    /**
     * Technical data tab
     */
    technical: (id: string, options?: { quickstart?: boolean }) => {
      const base = `/project/${id}?tab=${ProjectTab.Technical}`
      return options?.quickstart ? `${base}&quickstart=true` : base
    },
    
    /**
     * Proposals tab
     */
    proposals: (id: string) => 
      `/project/${id}?tab=${ProjectTab.Proposals}` as const,
    
    /**
     * Files tab
     */
    files: (id: string) => 
      `/project/${id}?tab=${ProjectTab.Files}` as const,
    
    // Nested: Proposals
    proposal: {
      /**
       * Proposal detail
       * @param projectId - Project ID
       * @param proposalId - Proposal ID
       */
      detail: (projectId: string, proposalId: string) =>
        `/project/${projectId}/proposals/${proposalId}` as const,
      
      /**
       * Proposal with specific view
       */
      view: (projectId: string, proposalId: string, view: ProposalView) =>
        `/project/${projectId}/proposals/${proposalId}?view=${view}` as const,
      
      /**
       * Proposal PDF view
       */
      pdf: (projectId: string, proposalId: string) =>
        `/project/${projectId}/proposals/${proposalId}?view=${ProposalView.PDF}` as const
    }
  }
} as const

// ==============================================
// ROUTE HELPERS
// ==============================================

/**
 * Parse current project tab from URL
 */
export function getCurrentTab(searchParams: URLSearchParams): ProjectTab {
  const tab = searchParams.get('tab')
  
  if (tab && Object.values(ProjectTab).includes(tab as ProjectTab)) {
    return tab as ProjectTab
  }
  
  return ProjectTab.Overview
}

/**
 * Check if quickstart mode is active
 */
export function isQuickstartMode(searchParams: URLSearchParams): boolean {
  return searchParams.get('quickstart') === 'true'
}

/**
 * Get proposal view mode
 */
export function getProposalView(searchParams: URLSearchParams): ProposalView {
  const view = searchParams.get('view')
  
  if (view && Object.values(ProposalView).includes(view as ProposalView)) {
    return view as ProposalView
  }
  
  return ProposalView.Default
}

/**
 * Build URL with query params
 */
export function buildUrl(
  base: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return base
  
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value))
    }
  })
  
  const query = searchParams.toString()
  return query ? `${base}?${query}` : base
}

// ==============================================
// EXTERNAL ROUTES (APIs, docs, etc.)
// ==============================================

export const externalRoutes = {
  // Documentación
  docs: 'https://docs.h2oallegiant.com',
  
  // API (configurable via env)
  api: {
    base: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    docs: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/docs`
  },
  
  // Support
  support: 'mailto:support@h2oallegiant.com',
  
  // Social
  github: 'https://github.com/h2oallegiant'
} as const

// ==============================================
// TYPE EXPORTS
// ==============================================

export type AppRoutes = typeof routes
export type ExternalRoutes = typeof externalRoutes
