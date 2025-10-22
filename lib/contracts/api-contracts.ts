/**
 * API Contracts - Complete TypeScript interfaces
 * 
 * Este archivo define TODOS los contratos de API entre frontend y backend.
 * Cuando el backend esté listo, solo hay que implementar estos contratos.
 */

import type { TableSection, TableField } from '@/lib/types/technical-data'
import type { ProjectSummary, ProjectDetail, ProposalVersion } from '@/lib/project-types'

// ==============================================
// AUTHENTICATION
// ==============================================

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'engineer' | 'viewer'
  }
  expiresIn: number // seconds
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
}

// ==============================================
// PROJECTS
// ==============================================

export interface GetProjectsRequest {
  page?: number
  limit?: number
  status?: string
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export interface GetProjectsResponse {
  items: ProjectSummary[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface GetProjectRequest {
  projectId: string
}

export type GetProjectResponse = ProjectDetail

export interface CreateProjectRequest {
  name: string
  client: string
  sector: string
  subsector?: string
  location: string
  type: string
  description?: string
  budget?: number
}

export interface CreateProjectResponse {
  project: ProjectSummary
  message: string
}

export interface UpdateProjectRequest {
  projectId: string
  updates: Partial<ProjectSummary>
}

export interface UpdateProjectResponse {
  project: ProjectSummary
  message: string
}

export interface DeleteProjectRequest {
  projectId: string
}

export interface DeleteProjectResponse {
  success: boolean
  message: string
}

// ==============================================
// TECHNICAL DATA
// ==============================================

export interface GetTechnicalDataRequest {
  projectId: string
  version?: string // Optional: get specific version
}

export interface GetTechnicalDataResponse {
  projectId: string
  sections: TableSection[]
  version: string
  lastUpdated: string
  updatedBy: string
}

export interface SaveTechnicalDataRequest {
  projectId: string
  sections: TableSection[]
  versionLabel?: string
  notes?: string
}

export interface SaveTechnicalDataResponse {
  success: boolean
  version: string
  message: string
}

export interface UpdateFieldsRequest {
  projectId: string
  updates: Array<{
    sectionId: string
    fieldId: string
    value: string | number | null
    unit?: string
    source?: 'manual' | 'imported' | 'ai' | 'rollback'
  }>
  source?: 'manual' | 'imported' | 'ai' | 'rollback'
  note?: string
}

export interface UpdateFieldsResponse {
  success: boolean
  version: string
  affectedFields: number
}

export interface GetAISuggestionsRequest {
  projectId: string
  sectionId: string
  context?: {
    existingFields: Array<{ fieldId: string; value: unknown }>
    projectType?: string
  }
}

export interface GetAISuggestionsResponse {
  suggestions: Array<{
    sectionId: string
    fieldId: string
    suggestedValue: string | number
    confidence: number // 0-1
    reasoning?: string
  }>
}

export interface ValidateCompletenessRequest {
  projectId: string
}

export interface ValidateCompletenessResponse {
  isComplete: boolean
  completionPercentage: number
  missingFields: Array<{
    sectionId: string
    sectionTitle: string
    fieldId: string
    fieldLabel: string
    required: boolean
  }>
  warnings: string[]
}

export interface ExportTechnicalDataRequest {
  projectId: string
  format: 'pdf' | 'excel' | 'json'
  includeVersion?: boolean
}

// Response is a Blob

export interface GetVersionHistoryRequest {
  projectId: string
  limit?: number
  offset?: number
}

export interface GetVersionHistoryResponse {
  versions: Array<{
    id: string
    versionLabel: string
    createdAt: string
    createdBy: string
    source: 'manual' | 'ai' | 'import' | 'rollback'
    changes: Array<{
      sectionId: string
      fieldId: string
      label: string
      oldValue: unknown
      newValue: unknown
      changeType: 'added' | 'modified' | 'removed'
    }>
  }>
  total: number
}

export interface RevertToVersionRequest {
  projectId: string
  versionId: string
  reason?: string
}

export interface RevertToVersionResponse {
  success: boolean
  newVersion: string
  message: string
}

// ==============================================
// PROPOSALS
// ==============================================

export interface GenerateProposalRequest {
  projectId: string
  proposalType: 'Conceptual' | 'Technical' | 'Detailed'
  technicalData: {
    parameters: Array<{
      category: string
      categoryId: string
      name: string
      fieldId: string
      value: unknown
      unit?: string
      source: string
      confidence: number
    }>
    metadata: {
      totalFields: number
      completedFields: number
      lastUpdated: string
    }
    constraints: Record<string, unknown>
    criticalParameters: Array<{
      sectionId: string
      fieldId: string
      label: string
      value: unknown
      isFilled: boolean
    }>
  }
  preferences?: {
    focusAreas?: string[]
    constraints?: Record<string, unknown>
    optimizationGoals?: string[]
  }
}

export interface GenerateProposalResponse {
  jobId: string
  status: 'queued' | 'processing'
  estimatedTime: number // seconds
  message: string
}

export interface GetProposalJobStatusRequest {
  jobId: string
}

export interface GetProposalJobStatusResponse {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  currentStep: string
  result?: {
    proposalId: string
    preview: {
      executiveSummary: string
      capex: number
      opex: number
      keyTechnologies: string[]
    }
  }
  error?: {
    message: string
    code: string
  }
}

export interface GetProposalRequest {
  projectId: string
  proposalId: string
}

export type GetProposalResponse = ProposalVersion

export interface ListProposalsRequest {
  projectId: string
  status?: 'Draft' | 'Current' | 'Archived'
}

export interface ListProposalsResponse {
  proposals: ProposalVersion[]
  total: number
}

export interface UpdateProposalStatusRequest {
  projectId: string
  proposalId: string
  status: 'Draft' | 'Current' | 'Archived'
}

export interface UpdateProposalStatusResponse {
  success: boolean
  message: string
}

// ==============================================
// FILE MANAGEMENT
// ==============================================

export interface UploadFileRequest {
  projectId: string
  file: File
  category: 'technical' | 'regulatory' | 'financial' | 'other'
  description?: string
}

export interface UploadFileResponse {
  fileId: string
  fileName: string
  fileSize: number
  uploadedAt: string
  url: string
}

export interface AnalyzeFileRequest {
  fileId: string
  analysisType: 'water_parameters' | 'technical_specs' | 'cost_analysis' | 'regulatory_docs'
}

export interface AnalyzeFileResponse {
  jobId: string
  status: 'queued' | 'processing'
  estimatedTime: number
}

export interface GetFileAnalysisRequest {
  jobId: string
}

export interface GetFileAnalysisResponse {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  result?: {
    extractedData: Record<string, unknown>
    insights: string[]
    recommendations: string[]
    suggestedFields: Array<{
      sectionId: string
      fieldId: string
      value: unknown
      confidence: number
    }>
  }
  error?: string
}

export interface ListFilesRequest {
  projectId: string
  category?: string
}

export interface ListFilesResponse {
  files: Array<{
    id: string
    name: string
    size: number
    category: string
    uploadedAt: string
    uploadedBy: string
    url: string
  }>
  total: number
}

export interface DeleteFileRequest {
  projectId: string
  fileId: string
}

export interface DeleteFileResponse {
  success: boolean
  message: string
}

// ==============================================
// AI CHAT
// ==============================================

export interface SendChatMessageRequest {
  message: string
  context?: {
    projectId?: string
    agentType?: 'general' | 'technical' | 'procurement'
    currentSection?: string
  }
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface SendChatMessageResponse {
  message: string
  suggestions?: string[]
  actions?: Array<{
    type: string
    label: string
    data?: Record<string, unknown>
  }>
  contextUpdated?: boolean
}

// ==============================================
// COLLABORATION (FUTURE)
// ==============================================

export interface GetActiveUsersRequest {
  projectId: string
}

export interface GetActiveUsersResponse {
  users: Array<{
    id: string
    name: string
    email: string
    avatar?: string
    currentSection?: string
    lastActive: string
  }>
}

export interface WebSocketMessage {
  type: 'field_update' | 'user_joined' | 'user_left' | 'cursor_move'
  payload: unknown
  timestamp: string
  userId: string
}

// ==============================================
// ANALYTICS & STATS
// ==============================================

export interface GetDashboardStatsRequest {
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
}

export interface GetDashboardStatsResponse {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalProposals: number
  recentActivity: Array<{
    type: string
    projectId: string
    projectName: string
    message: string
    timestamp: string
  }>
  chartData: {
    projectsByStatus: Record<string, number>
    projectsBySector: Record<string, number>
    proposalGenerationTrend: Array<{
      date: string
      count: number
    }>
  }
}

// ==============================================
// ERROR RESPONSES
// ==============================================

export interface APIError {
  error: {
    message: string
    code: string
    details?: Record<string, unknown>
    timestamp: string
  }
}

// ==============================================
// TYPE GUARDS
// ==============================================

export function isAPIError(response: unknown): response is APIError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as APIError).error === 'object'
  )
}

export function isSuccessResponse<T>(response: T | APIError): response is T {
  return !isAPIError(response)
}
