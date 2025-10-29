import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";
import type {
	ProjectDetail,
	ProjectSummary,
	TimelineEvent,
} from "@/lib/project-types";
import { logger } from "@/lib/utils/logger";
import { type DashboardStats, projectsAPI } from "../api/projects";
import { PROJECT_STATUS_GROUPS } from "../project-status";

const mapProjectSummary = (
	project: ProjectSummary | ProjectDetail,
): ProjectSummary => {
	const summary = project as ProjectSummary;
	const detail = project as ProjectDetail;

	return {
		id: project.id,
		name: project.name,
		client: project.client,
		sector: project.sector,
		subsector: project.subsector || "",
		location: project.location,
		status: project.status,
		progress: typeof project.progress === "number" ? project.progress : 0,
		createdAt: project.createdAt,
		updatedAt: project.updatedAt,
		type: project.type ?? "To be defined",
		description: project.description ?? "",
		budget: typeof project.budget === "number" ? project.budget : 0,
		scheduleSummary: project.scheduleSummary ?? "To be defined",
		proposalsCount:
			typeof summary.proposalsCount === "number"
				? summary.proposalsCount
				: Array.isArray(detail.proposals)
					? detail.proposals.length
					: 0,
		tags: Array.isArray(project.tags) ? project.tags : [],
	};
};

interface ProjectState {
	// State
	projects: ProjectSummary[];
	currentProject: ProjectDetail | null;
	loading: boolean;
	error: string | null;
	dataSource: "api" | "mock";
	dashboardStats: DashboardStats | null;
	filteredProjects: (
		filter?: keyof typeof PROJECT_STATUS_GROUPS,
		search?: string,
	) => ProjectSummary[];

	// Actions
	loadProjects: () => Promise<void>;
	loadProject: (id: string) => Promise<void>;
	loadDashboardStats: () => Promise<void>;
	createProject: (
		projectData: Partial<ProjectSummary>,
	) => Promise<ProjectSummary>;
	updateProject: (
		id: string,
		updates: Partial<ProjectSummary>,
	) => Promise<void>;
	deleteProject: (id: string) => Promise<void>;

	// Timeline actions
	addTimelineEvent: (
		projectId: string,
		event: Omit<TimelineEvent, "id">,
	) => Promise<void>;

	// Utility actions
	clearError: () => void;
	setLoading: (loading: boolean) => void;
}

const storage =
	typeof window === "undefined"
		? undefined
		: createJSONStorage(() => localStorage);

export const useProjectStore = create<ProjectState>()(
	persist(
		immer((set, get) => ({
			// Initial state
			projects: [],
			currentProject: null,
			loading: false,
			error: null,
			dataSource: "api",
			dashboardStats: null,

			filteredProjects: (filter = "all", search = "") => {
				const projects = get().projects;
				const allowedStatuses =
					PROJECT_STATUS_GROUPS[filter] ?? PROJECT_STATUS_GROUPS.all ?? [];

				return projects.filter((project) => {
					const normalizedSearch = search.trim().toLowerCase();
					const matchesSearch =
						normalizedSearch === "" ||
						project.name.toLowerCase().includes(normalizedSearch) ||
						project.client.toLowerCase().includes(normalizedSearch) ||
						project.location.toLowerCase().includes(normalizedSearch);

					const matchesFilter =
						allowedStatuses.length > 0
							? allowedStatuses.includes(project.status)
							: true;

					return matchesSearch && matchesFilter;
				});
			},

			// Load dashboard stats from backend
			loadDashboardStats: async () => {
				try {
					const stats = await projectsAPI.getStats();
					set((state) => {
						state.dashboardStats = stats;
					});
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to load stats";
					logger.error("Failed to load dashboard stats", error, "ProjectStore");
					set((state) => {
						state.error = message;
					});
				}
			},

			// Load projects from API
			loadProjects: async () => {
				const state = get();
				if (state.loading) {
					return; // Already loading, skip
				}

				// Set loading IMMEDIATELY to prevent race condition
				set({ loading: true, error: null });

				try {
					const response = await projectsAPI.getProjects();
					const items = response.items?.map(mapProjectSummary) ?? [];

					// Usuario sin proyectos = array vacío (correcto)
					set({ projects: items, loading: false, dataSource: "api" });
				} catch (error) {
					logger.error("Failed to load projects", error, "ProjectStore");
					set({
						projects: [],
						loading: false,
						dataSource: "api",
						error:
							error instanceof Error ? error.message : "Error loading projects",
					});
				}
			},

			loadProject: async (id: string) => {
				set((state) => {
					state.loading = true;
					state.error = null;
				});

				try {
					const project = await projectsAPI.getProject(id);
					set((state) => {
						state.currentProject = {
							...project,
							proposals: project.proposals ?? [],
							timeline: project.timeline ?? [],
							files: project.files ?? [],
							technicalSections: project.technicalSections ?? [],
						};
						state.loading = false;
						state.dataSource = "api";
					});
				} catch (error) {
					logger.error("Failed to load project", error, "ProjectStore");
					set((state) => {
						state.currentProject = null;
						state.loading = false;
						state.error =
							error instanceof Error
								? error.message
								: "Error al cargar proyecto";
					});
				}
			},

			createProject: async (projectData: Partial<ProjectSummary>) => {
				set((state) => {
					state.loading = true;
					state.error = null;
				});

				try {
					const payload = {
						name: projectData.name ?? "Nuevo Proyecto",
						client: projectData.client ?? "",
						sector: projectData.sector ?? "municipal",
						subsector: projectData.subsector || "",
						location: projectData.location ?? "",
						description: projectData.description ?? "",
						budget: projectData.budget ?? 0,
						tags: projectData.tags ?? [],
					};

					const created = await projectsAPI.createProject(payload);
					const summary = mapProjectSummary(created);

					set((state) => {
						state.projects = [summary, ...state.projects];
						state.loading = false;
						state.dataSource = "api";
					});

					await get().addTimelineEvent(summary.id, {
						type: "version",
						title: "Proyecto creado",
						description: `Proyect "${summary.name}" creado desde el asistente rápido`,
						user: "Usuario actual",
						timestamp: new Date().toISOString(),
					});

					return summary;
				} catch (error) {
					logger.error("Failed to create project", error, "ProjectStore");
					set((state) => {
						state.loading = false;
						state.error =
							error instanceof Error
								? error.message
								: "Error al crear proyecto";
					});
					throw error; // Re-throw para que el componente lo maneje
				}
			},

			updateProject: async (id: string, updates: Partial<ProjectSummary>) => {
				try {
					const updated = await projectsAPI.updateProject(id, updates);
					const summary = mapProjectSummary(updated);

					set((state) => {
						// Update project in list
						const idx = state.projects.findIndex((p) => p.id === id);
						if (idx !== -1) {
							state.projects[idx] = { ...state.projects[idx], ...summary };
						}

						// Update current project if viewing it
						if (state.currentProject?.id === id) {
							state.currentProject = {
								...state.currentProject,
								...updated,
								proposals: updated.proposals ?? state.currentProject.proposals,
								timeline: updated.timeline ?? state.currentProject.timeline,
								files: updated.files ?? state.currentProject.files,
								technicalSections:
									updated.technicalSections ??
									state.currentProject.technicalSections,
								updatedAt: summary.updatedAt,
							};
						}

						state.dataSource = "api";
					});

					await get().addTimelineEvent(id, {
						type: "edit",
						title: "Proyecto actualizado",
						description: "Información del proyecto actualizada",
						user: "Usuario actual",
						timestamp: new Date().toISOString(),
					});
				} catch (error) {
					logger.error("Failed to update project", error, "ProjectStore");
					set((state) => {
						state.error =
							error instanceof Error
								? error.message
								: "Error al actualizar proyecto";
					});
					throw error;
				}
			},

			deleteProject: async (id: string) => {
				// Optimistic update: remove immediately from UI
				const previousState = get().projects;
				const previousCurrent = get().currentProject;

				set((state) => {
					state.projects = state.projects.filter((p) => p.id !== id);
					if (state.currentProject?.id === id) {
						state.currentProject = null;
					}
				});

				try {
					await projectsAPI.deleteProject(id);
					// Success: keep the optimistic update
					set((state) => {
						state.dataSource = "api";
						state.error = null;
					});
				} catch (error) {
					// Rollback optimistic update on error
					logger.error(
						"Failed to delete project, rolling back",
						error,
						"ProjectStore",
					);
					set((state) => {
						state.projects = previousState;
						state.currentProject = previousCurrent;
						state.error =
							error instanceof Error
								? error.message
								: "Error al eliminar proyecto";
						state.dataSource = "mock";
					});
					throw error;
				}
			},

			// ❌ REMOVED: Proposal actions (addProposal, updateProposal, deleteProposal, etc.)
			// ✅ USE INSTEAD: ProposalsAPI from '@/lib/api/proposals'
			// After proposal operations, call loadProject(id) to refresh data

			addTimelineEvent: async (
				projectId: string,
				event: Omit<TimelineEvent, "id">,
			) => {
				const newEvent: TimelineEvent = {
					...event,
					id: crypto.randomUUID(),
				};

				set((state) => {
					if (state.currentProject?.id === projectId) {
						state.currentProject.timeline.unshift(newEvent); // Add to beginning for most recent first
					}
				});
			},

			clearError: () => {
				set((state) => {
					state.error = null;
				});
			},

			setLoading: (loading: boolean) => {
				set((state) => {
					state.loading = loading;
				});
			},
		})),
		{
			name: "h2o-project-store",
			storage,
			partialize: (state) => ({
				projects: state.projects,
				// Don't persist current project, loading, or error states
			}),
		},
	),
);

// Selectors for better performance
export const useProjects = () =>
	useProjectStore((state) => state?.projects ?? []);
export const useCurrentProject = () =>
	useProjectStore((state) => state?.currentProject ?? null);
export const useDashboardStats = () =>
	useProjectStore((state) => state?.dashboardStats);
export const useProjectLoading = () =>
	useProjectStore((state) => state?.loading ?? false);
export const useProjectError = () =>
	useProjectStore((state) => state?.error ?? null);

// Actions
export const useProjectActions = () =>
	useProjectStore(
		useShallow((state) => ({
			loadProjects: state.loadProjects,
			loadProject: state.loadProject,
			loadDashboardStats: state.loadDashboardStats,
			createProject: state.createProject,
			updateProject: state.updateProject,
			deleteProject: state.deleteProject,
			addTimelineEvent: state.addTimelineEvent,
			clearError: state.clearError,
			setLoading: state.setLoading,
			filteredProjects: state.filteredProjects,
		})),
	);

export const useLoadProjectAction = () =>
	useProjectStore((state) => state.loadProject);

export const useProjectDataSource = () =>
	useProjectStore((state) => state.dataSource);

export const useEnsureProjectsLoaded = () => {
	const projectsCount = useProjectStore((state) => state.projects.length);
	const loading = useProjectStore((state) => state.loading);
	const error = useProjectStore((state) => state.error);
	const loadProjects = useProjectStore((state) => state.loadProjects);

	useEffect(() => {
		const hasToken =
			typeof window !== "undefined" && localStorage.getItem("access_token");

		// Load projects if: authenticated, not loading, no projects, no error
		// Store's loading state prevents race conditions (shared globally via Zustand)
		if (hasToken && !loading && projectsCount === 0 && !error) {
			void loadProjects();
		}
		// loadProjects is stable, no need in deps
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, projectsCount, error, loadProjects]);
};
