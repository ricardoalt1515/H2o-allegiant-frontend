import { apiClient } from './client'

// ============================================================================
// AI API - Proposal Generation
// ============================================================================
// NOTE: Most AI endpoints are planned but not yet implemented in backend.
// Only proposal generation endpoints are currently functional.
// ============================================================================

// Proposal generation types
interface ProposalGenerationRequest {
  projectId: string
  proposalType?: 'Conceptual' | 'Technical' | 'Detailed'
  parameters?: Record<string, any>
  preferences?: {
    focus_areas?: string[]
    constraints?: Record<string, any>
  }
}

interface ProposalGenerationResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  message?: string
}

interface ProposalJobStatus {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
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
  error?: string
}

/**
 * AI API Client
 *
 * IMPORTANT: Only proposal generation endpoints are currently implemented.
 * Other endpoints are planned for future releases.
 */
export class AIAPI {
  // ============================================================================
  // ✅ IMPLEMENTED ENDPOINTS
  // ============================================================================

  /**
   * Start AI-powered proposal generation
   * Endpoint: POST /ai/proposals/generate
   */
  static async generateProposal(request: ProposalGenerationRequest): Promise<ProposalGenerationResponse> {
    const payload = {
      project_id: request.projectId,
      proposal_type: request.proposalType || 'Technical',
      preferences: request.preferences
    }

    return apiClient.post<ProposalGenerationResponse>('/ai/proposals/generate', payload as any)
  }

  /**
   * Get proposal generation job status
   * Endpoint: GET /ai/proposals/jobs/{jobId}
   */
  static async getProposalJobStatus(jobId: string): Promise<ProposalJobStatus> {
    const response = await apiClient.get<any>(`/ai/proposals/jobs/${jobId}`)

    return {
      jobId: response.jobId || response.job_id,
      status: response.status,
      progress: response.progress ?? 0,
      currentStep: response.currentStep || response.current_step || response.message || '',
      ...(response.result && {
        result: {
          proposalId: response.result.proposalId || response.result.proposal_id,
          preview: response.result.preview
        }
      }),
      error: response.error,
    }
  }

  /**
   * Get proposal by ID
{{ ... }}
   * Endpoint: GET /ai/proposals/{projectId}/proposals/{proposalId}
   */
  static async getProposal(projectId: string, proposalId: string): Promise<any> {
    return apiClient.get(`/ai/proposals/${projectId}/proposals/${proposalId}`)
  }

  /**
   * List all proposals for a project
   * Endpoint: GET /ai/proposals/{projectId}/proposals
   */
  static async listProposals(projectId: string): Promise<any[]> {
    return apiClient.get(`/ai/proposals/${projectId}/proposals`)
  }

  /**
   * Cancel proposal generation job
   * Endpoint: DELETE /ai/proposals/jobs/{jobId}
   */
  static async cancelProposalGeneration(jobId: string): Promise<void> {
    return apiClient.delete<void>(`/ai/proposals/jobs/${jobId}`)
  }

  // ============================================================================
  // ⚠️ FUTURE ENDPOINTS (Not yet implemented in backend)
  // ============================================================================
  // The following methods are defined but will throw errors until backend
  // endpoints are implemented. Uncomment when backend is ready.
  // ============================================================================

  /*
  // Chat with AI assistant
  static async chat(request: {
    message: string
    context?: {
      projectId?: string
      agentType?: string
      currentSection?: string
    }
    conversation_history?: Array<{
      role: 'user' | 'assistant' | 'system'
      content: string
      metadata?: Record<string, any>
    }>
  }): Promise<{
    message: string
    suggestions?: string[]
    actions?: Array<{
      type: string
      label: string
      data: any
    }>
    context_updated?: boolean
  }> {
    return apiClient.post('/api/ai/chat', request as any)
  }

  // File analysis
  static async analyzeFile(request: {
    file: File
    projectId?: string
    analysisType: 'water_parameters' | 'technical_specs' | 'cost_analysis' | 'regulatory_docs'
  }): Promise<{
    jobId: string
    extractedData?: Record<string, any>
    insights?: string[]
    recommendations?: string[]
  }> {
    return apiClient.uploadFile('/api/ai/analyze/file', request.file, {
      projectId: request.projectId,
      analysisType: request.analysisType
    })
  }

  // Cost optimization
  static async optimizeCosts(projectId: string, constraints?: {
    maxCapex?: number
    maxOpex?: number
    mustHaveTechnologies?: string[]
    excludeTechnologies?: string[]
  }): Promise<{
    optimizedCapex: number
    optimizedOpex: number
    recommendations: Array<{
      type: 'technology' | 'sizing' | 'vendor'
      description: string
      impact: string
      savings: number
    }>
  }> {
    return apiClient.post(`/api/ai/optimize/costs`, {
      projectId,
      constraints
    })
  }

  // Regulatory compliance check
  static async checkCompliance(projectId: string, jurisdiction?: string): Promise<{
    complianceScore: number
    requirements: Array<{
      regulation: string
      status: 'compliant' | 'non_compliant' | 'partial' | 'unknown'
      description: string
      recommendations?: string[]
    }>
    missingDocuments: string[]
  }> {
    return apiClient.post(`/api/ai/compliance/check`, {
      projectId,
      jurisdiction
    })
  }

  // Technology recommendations
  static async getTechnologyRecommendations(
    projectId: string,
    criteria?: {
      budget?: number
      efficiency_priority?: 'high' | 'medium' | 'low'
      maintenance_priority?: 'high' | 'medium' | 'low'
      space_constraints?: boolean
    }
  ): Promise<{
    recommendations: Array<{
      technology: string
      confidence: number
      reasons: string[]
      pros: string[]
      cons: string[]
      estimatedCost: {
        capex: number
        opex: number
      }
    }>
  }> {
    return apiClient.post(`/api/ai/technology/recommend`, {
      projectId,
      criteria
    })
  }

  // Agent management
  static async getAgentCapabilities(): Promise<{
    agents: Array<{
      id: string
      name: string
      type: string
      capabilities: string[]
      status: 'available' | 'busy' | 'offline'
    }>
  }> {
    return apiClient.get('/api/ai/agents')
  }

  static async setActiveAgent(agentId: string): Promise<void> {
    return apiClient.post<void>('/api/ai/agents/activate', { agentId })
  }

  // Context management
  static async updateContext(context: {
    projectId?: string
    currentSection?: string
    userPreferences?: Record<string, any>
  }): Promise<void> {
    return apiClient.post<void>('/api/ai/context', context)
  }

  static async getContext(): Promise<{
    projectId?: string
    currentSection?: string
    conversationSummary?: string
    relevantData?: Record<string, any>
  }> {
    return apiClient.get('/api/ai/context')
  }

  // Training and feedback
  static async provideFeedback(interaction: {
    type: 'chat' | 'proposal' | 'analysis'
    interactionId: string
    rating: 1 | 2 | 3 | 4 | 5
    feedback?: string
    corrections?: Record<string, any>
  }): Promise<void> {
    return apiClient.post<void>('/api/ai/feedback', interaction)
  }
  */
}

// Export for easy usage
export const aiAPI = AIAPI

// Export types
export type {
  ProposalGenerationRequest,
  ProposalGenerationResponse,
  ProposalJobStatus
}
