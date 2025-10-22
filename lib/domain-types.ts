// ❌ REMOVED: Legacy technical data types
// These were only used by the obsolete getTechnicalData/updateTechnicalData APIs
// ✅ USE INSTEAD: TableSection and TableField types from @/lib/types/technical-data

export type ProposalGenerationType = "Conceptual" | "Technical" | "Detailed"

export interface ProposalGenerationRequestPayload extends Record<string, unknown> {
  projectId: string
  type: ProposalGenerationType
  parameters?: Record<string, unknown>
  preferences?: {
    focusAreas?: string[]
    constraints?: Record<string, unknown>
  }
}

export type ProposalJobStatusValue = "queued" | "processing" | "completed" | "failed"

export interface ProposalJobPreview {
  executiveSummary: string
  capex: number
  opex: number
  keyTechnologies: string[]
}

export interface ProposalJobResult extends Record<string, unknown> {
  proposalId: string
  preview: ProposalJobPreview
}

export interface ProposalJobSnapshot extends Record<string, unknown> {
  jobId: string
  status: ProposalJobStatusValue
  progress: number
  currentStep: string
  result?: ProposalJobResult
  error?: string
}

export type AIChatRole = "user" | "assistant" | "system"

export interface AIChatMessage extends Record<string, unknown> {
  id: string
  role: AIChatRole
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface AIChatContext extends Record<string, unknown> {
  projectId?: string
  agentType?: string
  currentSection?: string
}

export interface AIChatRequestPayload extends Record<string, unknown> {
  message: string
  context?: AIChatContext
  conversationHistory?: AIChatMessage[]
}

export interface AIChatAction extends Record<string, unknown> {
  type: string
  label: string
  data?: Record<string, unknown>
}

export interface AIChatResponsePayload extends Record<string, unknown> {
  message: string
  suggestions?: string[]
  actions?: AIChatAction[]
  contextUpdated?: boolean
}

export interface FileAnalysisRequestPayload extends Record<string, unknown> {
  file: File
  projectId?: string
  analysisType: "water_parameters" | "technical_specs" | "cost_analysis" | "regulatory_docs"
}

export interface FileAnalysisResponsePayload extends Record<string, unknown> {
  jobId: string
  extractedData?: Record<string, unknown>
  insights?: string[]
  recommendations?: string[]
}

export interface AgentCapabilitySnapshot extends Record<string, unknown> {
  id: string
  name: string
  type: string
  status: "available" | "busy" | "offline"
  capabilities: string[]
}

export interface AgentCapabilitiesResponse extends Record<string, unknown> {
  agents: AgentCapabilitySnapshot[]
}
