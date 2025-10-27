import type {
	ProjectDetail,
	ProjectFile,
	ProjectSummary,
} from "../project-types";
import { apiClient } from "./client";
import type { PaginatedResponse } from "./index";

type JsonObject = Record<string, unknown>;

type ProjectListParams = {
	page?: number;
	size?: number;
	search?: string;
	status?: string;
	sector?: string;
};

type CreateProjectPayload = JsonObject & {
	name: string;
	client: string;
	sector: ProjectSummary["sector"];
	subsector?: string;
	location: string;
	description?: string;
	budget?: number;
	tags?: string[];
};

type UpdateProjectPayload = JsonObject &
	Partial<CreateProjectPayload> & {
		status?: ProjectSummary["status"];
		progress?: number;
	};

export type DashboardStats = {
	total_projects: number;
	in_preparation: number;
	generating: number;
	proposal_ready: number;
	in_development: number;
	completed: number;
	on_hold: number;
	avg_progress: number;
};

export class ProjectsAPI {
	static async getProjects(
		params?: ProjectListParams,
	): Promise<PaginatedResponse<ProjectSummary>> {
		const searchParams = new URLSearchParams();

		if (params?.page) searchParams.append("page", params.page.toString());
		if (params?.size) searchParams.append("size", params.size.toString());
		if (params?.search) searchParams.append("search", params.search);
		if (params?.status) searchParams.append("status", params.status);
		if (params?.sector) searchParams.append("sector", params.sector);

		const query = searchParams.toString();
		const url = query ? `/projects?${query}` : "/projects";

		return apiClient.get<PaginatedResponse<ProjectSummary>>(url);
	}

	static async getProject(id: string): Promise<ProjectDetail> {
		return apiClient.get<ProjectDetail>(`/projects/${id}`);
	}

	static async getStats(): Promise<DashboardStats> {
		return apiClient.get<DashboardStats>("/projects/stats");
	}

	static async createProject(
		data: CreateProjectPayload,
	): Promise<ProjectDetail> {
		return apiClient.post<ProjectDetail>("/projects", data as any);
	}

	static async updateProject(
		id: string,
		data: UpdateProjectPayload,
	): Promise<ProjectDetail> {
		return apiClient.patch<ProjectDetail>(`/projects/${id}`, data as any);
	}

	static async deleteProject(id: string): Promise<void> {
		await apiClient.delete<void>(`/projects/${id}`);
	}

	// ❌ REMOVED: Proposal methods (getProposals, createProposal, updateProposal, deleteProposal)
	// ✅ USE INSTEAD: ProposalsAPI from '@/lib/api/proposals'
	// ProposalsAPI provides complete proposal management with PDF generation, AI metadata, and polling utilities

	static async getFiles(projectId: string): Promise<ProjectFile[]> {
		return apiClient.get<ProjectFile[]>(`/projects/${projectId}/files`);
	}

	static async uploadFile(
		projectId: string,
		file: File,
		metadata?: {
			description?: string;
			category?: string;
		},
	): Promise<ProjectFile> {
		return apiClient.uploadFile<ProjectFile>(
			`/projects/${projectId}/files`,
			file,
			metadata,
		);
	}

	static async deleteFile(projectId: string, fileId: string): Promise<void> {
		await apiClient.delete<void>(`/projects/${projectId}/files/${fileId}`);
	}

	// ❌ REMOVED: getTechnicalData() and updateTechnicalData()
	// These methods used the empty relational table 'technical_data'
	// ✅ USE INSTEAD: projectDataAPI.getData() and projectDataAPI.updateData()
	// which use the JSONB 'project_data.technical_sections' field
}

export const projectsAPI = ProjectsAPI;
