import { useEffect } from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { useShallow } from "zustand/react/shallow"
import {
  ProjectSummary,
  ProjectDetail,
  ProposalVersion,
  TimelineEvent,
} from "@/lib/project-types"
import { projectsAPI } from "../api/projects"
import { PROJECT_STATUS_GROUPS } from "../project-status"

const mapProjectSummary = (project: ProjectSummary | ProjectDetail): ProjectSummary => {
  const summary = project as ProjectSummary
  const detail = project as ProjectDetail

  return {
    id: project.id,
    name: project.name,
    client: project.client,
    sector: project.sector,
    subsector: project.subsector || '',
    location: project.location,
    status: project.status,
    progress: typeof project.progress === 'number' ? project.progress : 0,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    type: project.type ?? 'Por definir',
    description: project.description ?? '',
    budget: typeof project.budget === 'number' ? project.budget : 0,
    scheduleSummary: project.scheduleSummary ?? 'Por definir',
    proposalsCount:
      typeof summary.proposalsCount === 'number'
        ? summary.proposalsCount
        : Array.isArray(detail.proposals)
          ? detail.proposals.length
          : 0,
    tags: Array.isArray(project.tags) ? project.tags : []
  }
}


interface ProjectState {
  // State
  projects: ProjectSummary[]
  currentProject: ProjectDetail | null
  loading: boolean
  error: string | null
  dataSource: 'api' | 'mock'

  // Computed
  dashboardStats: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    onHoldProjects: number
    avgCompletionTime: string
    totalBudget: number
  }
  filteredProjects: (filter?: keyof typeof PROJECT_STATUS_GROUPS, search?: string) => ProjectSummary[]

  // Actions
  loadProjects: () => Promise<void>
  loadProject: (id: string) => Promise<void>
  createProject: (projectData: Partial<ProjectSummary>) => Promise<ProjectSummary>
  updateProject: (id: string, updates: Partial<ProjectSummary>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  // Proposal actions
  addProposal: (projectId: string, proposal: ProposalVersion) => Promise<void>
  updateProposal: (projectId: string, proposalId: string, updates: Partial<ProposalVersion>) => Promise<void>
  updateProposalStatus: (
    projectId: string,
    proposalId: string,
    status: ProposalVersion['status']
  ) => Promise<void>
  deleteProposal: (projectId: string, proposalId: string) => void
  setProposalStatus: (projectId: string, proposalId: string, status: ProposalVersion['status']) => void

  // Timeline actions
  addTimelineEvent: (projectId: string, event: Omit<TimelineEvent, 'id'>) => Promise<void>

  // Utility actions
  clearError: () => void
  setLoading: (loading: boolean) => void
}

const storage = typeof window === 'undefined'
  ? undefined
  : createJSONStorage(() => localStorage)

export const useProjectStore = create<ProjectState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      projects: [],
      currentProject: null,
      loading: false,
      error: null,
      dataSource: 'mock',

      // Computed values
      get dashboardStats() {
        const projects = get().projects
        const activeStatuses = new Set(PROJECT_STATUS_GROUPS.active)
        const completedStatuses = new Set(PROJECT_STATUS_GROUPS.completed)
        const onHoldStatuses = new Set(PROJECT_STATUS_GROUPS.onhold)

        // Calculate average completion time from completed projects
        const completedProjects = projects.filter(p => completedStatuses.has(p.status))
        let avgCompletionTime = "N/A"

        if (completedProjects.length > 0) {
          const totalDays = completedProjects.reduce((sum, p) => {
            const created = new Date(p.createdAt).getTime()
            const updated = new Date(p.updatedAt).getTime()
            const days = Math.floor((updated - created) / (1000 * 60 * 60 * 24))
            return sum + days
          }, 0)

          const avgDays = totalDays / completedProjects.length
          const avgMonths = (avgDays / 30).toFixed(1)
          avgCompletionTime = `${avgMonths} meses`
        }

        return {
          totalProjects: projects.length,
          activeProjects: projects.filter(p => activeStatuses.has(p.status)).length,
          completedProjects: completedProjects.length,
          onHoldProjects: projects.filter(p => onHoldStatuses.has(p.status)).length,
          avgCompletionTime,
          totalBudget: projects.reduce((sum, p) => sum + (p.budget ?? 0), 0)
        }
      },

      filteredProjects: (filter = 'all', search = '') => {
        const projects = get().projects
        const allowedStatuses = PROJECT_STATUS_GROUPS[filter] ?? PROJECT_STATUS_GROUPS.all ?? []

        return projects.filter(project => {
          const normalizedSearch = search.trim().toLowerCase()
          const matchesSearch =
            normalizedSearch === '' ||
            project.name.toLowerCase().includes(normalizedSearch) ||
            project.client.toLowerCase().includes(normalizedSearch) ||
            project.location.toLowerCase().includes(normalizedSearch)

          const matchesFilter = allowedStatuses.length > 0 ? allowedStatuses.includes(project.status) : true

          return matchesSearch && matchesFilter
        })
      },

      // Actions
      loadProjects: async () => {
        const state = get()
        if (state.loading) {
          return // Already loading, skip
        }

        // Set loading IMMEDIATELY to prevent race condition
        set({ loading: true, error: null })

        try {
          const response = await projectsAPI.getProjects()
          const items = response.items?.map(mapProjectSummary) ?? []

          // Usuario sin proyectos = array vacío (correcto)
          set({ projects: items, loading: false, dataSource: 'api' })
        } catch (error) {
          console.error('[ProjectStore] Failed to load projects', error)
          set({
            projects: [],
            loading: false,
            dataSource: 'api',
            error: error instanceof Error ? error.message : 'Error loading projects'
          })
        }
      },

      loadProject: async (id: string) => {
        set(state => {
          state.loading = true
          state.error = null
        })

        try {
          const project = await projectsAPI.getProject(id)
          set(state => {
            state.currentProject = {
              ...project,
              proposals: project.proposals ?? [],
              timeline: project.timeline ?? [],
              files: project.files ?? [],
              technicalSections: project.technicalSections ?? []
            }
            state.loading = false
            state.dataSource = 'api'
          })
        } catch (error) {
          console.error(`[ProjectStore] Failed to load project ${id}`, error)
          set(state => {
            state.currentProject = null
            state.loading = false
            state.error = error instanceof Error ? error.message : 'Error al cargar proyecto'
          })
        }
      },

      createProject: async (projectData: Partial<ProjectSummary>) => {
        set(state => {
          state.loading = true
          state.error = null
        })

        try {
          const payload = {
            name: projectData.name ?? 'Nuevo Proyecto',
            client: projectData.client ?? '',
            sector: projectData.sector ?? 'municipal',
            subsector: projectData.subsector || '',
            location: projectData.location ?? '',
            description: projectData.description ?? '',
            budget: projectData.budget ?? 0,
            tags: projectData.tags ?? []
          }

          const created = await projectsAPI.createProject(payload)
          const summary = mapProjectSummary(created)

          set(state => {
            state.projects = [summary, ...state.projects]
            state.loading = false
            state.dataSource = 'api'
          })

          await get().addTimelineEvent(summary.id, {
            type: 'version',
            title: 'Proyecto creado',
            description: `Proyect "${summary.name}" creado desde el asistente rápido`,
            user: 'Usuario actual',
            timestamp: new Date().toISOString()
          })

          return summary
        } catch (error) {
          console.error('[ProjectStore] Failed to create project', error)
          set(state => {
            state.loading = false
            state.error = error instanceof Error ? error.message : 'Error al crear proyecto'
          })
          throw error // Re-throw para que el componente lo maneje
        }
      },

      updateProject: async (id: string, updates: Partial<ProjectSummary>) => {
        try {
          const updated = await projectsAPI.updateProject(id, updates)
          const summary = mapProjectSummary(updated)

          set(state => {
            // Update project in list
            const idx = state.projects.findIndex(p => p.id === id)
            if (idx !== -1) {
              state.projects[idx] = { ...state.projects[idx], ...summary }
            }

            // Update current project if viewing it
            if (state.currentProject?.id === id) {
              state.currentProject = {
                ...state.currentProject,
                ...updated,
                proposals: updated.proposals ?? state.currentProject.proposals,
                timeline: updated.timeline ?? state.currentProject.timeline,
                files: updated.files ?? state.currentProject.files,
                technicalSections: updated.technicalSections ?? state.currentProject.technicalSections,
                updatedAt: summary.updatedAt
              }
            }

            state.dataSource = 'api'
          })

          await get().addTimelineEvent(id, {
            type: 'edit',
            title: 'Proyecto actualizado',
            description: 'Información del proyecto actualizada',
            user: 'Usuario actual',
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          console.error('[ProjectStore] Failed to update project', error)
          set(state => {
            state.error = error instanceof Error ? error.message : 'Error al actualizar proyecto'
          })
          throw error
        }
      },

      deleteProject: async (id: string) => {
        // Optimistic update: remove immediately from UI
        const previousState = get().projects
        const previousCurrent = get().currentProject

        set(state => {
          state.projects = state.projects.filter(p => p.id !== id)
          if (state.currentProject?.id === id) {
            state.currentProject = null
          }
        })

        try {
          await projectsAPI.deleteProject(id)
          // Success: keep the optimistic update
          set(state => {
            state.dataSource = 'api'
            state.error = null
          })
        } catch (error) {
          // Rollback optimistic update on error
          console.error('[ProjectStore] Failed to delete project, rolling back', error)
          set(state => {
            state.projects = previousState
            state.currentProject = previousCurrent
            state.error = error instanceof Error ? error.message : 'Error al eliminar proyecto'
            state.dataSource = 'mock'
          })
          throw error
        }
      },

      addProposal: async (projectId: string, proposal: ProposalVersion) => {
        set(state => {
          // Update project proposals count
          const projectIndex = state.projects.findIndex(p => p.id === projectId)
          if (projectIndex !== -1) {
            state.projects[projectIndex].proposalsCount += 1
            state.projects[projectIndex].updatedAt = new Date().toISOString()
          }

          // Update current project if it's the same one
          if (state.currentProject?.id === projectId) {
            state.currentProject.proposals.push(proposal)
            state.currentProject.proposalsCount += 1
            state.currentProject.updatedAt = new Date().toISOString()
          }
        })

        // Add timeline event
        await get().addTimelineEvent(projectId, {
          type: 'proposal',
          title: 'Nueva propuesta generada',
          description: `Propuesta "${proposal.title}" generada`,
          user: 'Usuario actual',
          timestamp: new Date().toISOString()
        })
      },

      updateProposal: async (projectId: string, proposalId: string, updates: Partial<ProposalVersion>) => {
        set(state => {
          if (state.currentProject?.id === projectId) {
            const proposalIndex = state.currentProject.proposals.findIndex(p => p.id === proposalId)
            if (proposalIndex !== -1) {
              state.currentProject.proposals[proposalIndex] = {
                ...state.currentProject.proposals[proposalIndex],
                ...updates
              }
              state.currentProject.updatedAt = new Date().toISOString()
            }
          }
        })
      },

      updateProposalStatus: async (projectId: string, proposalId: string, status: ProposalVersion['status']) => {
        set(state => {
          if (state.currentProject?.id === projectId) {
            const proposalIndex = state.currentProject.proposals.findIndex(p => p.id === proposalId)
            if (proposalIndex !== -1) {
              state.currentProject.proposals[proposalIndex] = {
                ...state.currentProject.proposals[proposalIndex],
                status
              }
              state.currentProject.updatedAt = new Date().toISOString()
            }
          }
        })

        await get().addTimelineEvent(projectId, {
          type: 'proposal',
          title: 'Estado de propuesta actualizado',
          description: `Propuesta ${proposalId} → ${status}`,
          user: 'Usuario actual',
          timestamp: new Date().toISOString()
        })
      },

      deleteProposal: (projectId: string, proposalId: string) => {
        set((state) => {
          if (!state.currentProject || state.currentProject.id !== projectId) return

          const idx = state.currentProject.proposals.findIndex(p => p.id === proposalId)
          if (idx !== -1) {
            state.currentProject.proposals.splice(idx, 1)
            state.currentProject.proposalsCount = Math.max(0, state.currentProject.proposalsCount - 1)
            state.currentProject.updatedAt = new Date().toISOString()
          }
        })
      },

      setProposalStatus: (projectId: string, proposalId: string, status: ProposalVersion['status']) => {
        set((state) => {
          if (!state.currentProject || state.currentProject.id !== projectId) return

          const idx = state.currentProject.proposals.findIndex(p => p.id === proposalId)
          if (idx !== -1) {
            state.currentProject.proposals[idx] = {
              ...state.currentProject.proposals[idx],
              status
            }
            state.currentProject.updatedAt = new Date().toISOString()
          }
        })
      },

      addTimelineEvent: async (projectId: string, event: Omit<TimelineEvent, 'id'>) => {
        const newEvent: TimelineEvent = {
          ...event,
          id: crypto.randomUUID()
        }

        set(state => {
          if (state.currentProject?.id === projectId) {
            state.currentProject.timeline.unshift(newEvent) // Add to beginning for most recent first
          }
        })
      },

      clearError: () => {
        set(state => {
          state.error = null
        })
      },

      setLoading: (loading: boolean) => {
        set(state => {
          state.loading = loading
        })
      }
    })),
    {
      name: 'h2o-project-store',
      storage,
      partialize: (state) => ({
        projects: state.projects,
        // Don't persist current project, loading, or error states
      })
    }
  ))

// Selectors for better performance
export const useProjects = () => useProjectStore(state => state?.projects ?? [])
export const useCurrentProject = () => useProjectStore(state => state?.currentProject ?? null)
export const useDashboardStats = () => useProjectStore(state => state?.dashboardStats)
export const useProjectLoading = () => useProjectStore(state => state?.loading ?? false)
export const useProjectError = () => useProjectStore(state => state?.error ?? null)

// Actions
export const useProjectActions = () =>
  useProjectStore(useShallow((state) => ({
    loadProjects: state.loadProjects,
    loadProject: state.loadProject,
    createProject: state.createProject,
    updateProject: state.updateProject,
    deleteProject: state.deleteProject,
    addProposal: state.addProposal,
    updateProposal: state.updateProposal,
    updateProposalStatus: state.updateProposalStatus,
    addTimelineEvent: state.addTimelineEvent,
    clearError: state.clearError,
    setLoading: state.setLoading,
    filteredProjects: state.filteredProjects,
  })))

export const useLoadProjectAction = () => useProjectStore(state => state.loadProject)

export const useProjectDataSource = () => useProjectStore(state => state.dataSource)

// Global flag to prevent multiple simultaneous loads across different component instances
let isLoadingGlobal = false

export const useEnsureProjectsLoaded = () => {
  const projectsCount = useProjectStore(state => state.projects.length)
  const loading = useProjectStore(state => state.loading)
  const error = useProjectStore(state => state.error)
  const loadProjects = useProjectStore(state => state.loadProjects)

  useEffect(() => {
    // Verificar si hay token antes de hacer API call
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('access_token')

    // Solo cargar si:
    // 1. Hay token (usuario autenticado)
    // 2. No está cargando (store state)
    // 3. No está cargando globalmente (prevents race condition)
    // 4. No hay proyectos
    // 5. No hay error previo (evita infinite loop en 401)
    if (hasToken && !loading && !isLoadingGlobal && projectsCount === 0 && !error) {
      isLoadingGlobal = true
      void loadProjects().finally(() => {
        isLoadingGlobal = false
      })
    }
    // Note: loadProjects removed from deps to prevent unnecessary re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, projectsCount, error])
}
