/**
 * TypeScript types for Proposal Detail UI
 *
 * All interfaces strictly typed - no 'any' allowed.
 * Aligned with backend schemas and existing types.
 */

// ============================================================================
// Core Proposal Types (from existing types.ts)
// ============================================================================

export interface WaterParameter {
  parameter: string
  value: number
  unit: string
  targetValue?: number
}

export interface TreatmentParameter {
  parameterName: string
  influentConcentration?: number
  effluentConcentration?: number
  removalEfficiencyPercent: number
  unit: string
  treatmentStage?: string
}

export interface TreatmentEfficiency {
  parameters: TreatmentParameter[]
  overallCompliance: boolean
  criticalParameters?: string[]
}

export interface EquipmentSpec {
  type: string
  specifications: string
  capacityM3Day: number
  powerConsumptionKw: number
  capexUsd: number
  dimensions: string
  justification?: string
  criticality?: 'high' | 'medium' | 'low'
  stage: 'primary' | 'secondary' | 'tertiary' | 'auxiliary'
  riskFactor?: number
}

export interface CostBreakdown {
  equipmentCost?: number
  civilWorks?: number
  installationPiping?: number
  engineeringSupervision?: number
  contingency?: number
}

export interface OperationalCosts {
  electricalEnergy: number
  chemicals: number
  personnel: number
  maintenanceSpareParts: number
}

export interface ProvenCase {
  caseId?: string
  applicationType: string
  treatmentTrain: string
  flowRate?: number
  flowRange?: string
  capexUsd?: number
  similarityScore?: number
}

export interface Alternative {
  technology: string
  reasonRejected: string
}

export interface TechnologyJustification {
  stage: string
  technology: string
  justification: string
}

export interface UsageStats {
  totalTokens: number
  modelUsed: string
  costEstimate?: number
  generationTimeSeconds?: number
  success: boolean
}

export interface AIMetadata {
  usageStats: UsageStats
  provenCases: ProvenCase[]
  userSector?: string
  assumptions: string[]
  alternatives: Alternative[]
  technologyJustification: TechnologyJustification[]
  confidenceLevel?: 'High' | 'Medium' | 'Low'  // Optional: not currently used
  recommendations?: string[]
  generatedAt: string
}

export interface ProposalSnapshot {
  executiveSummary: string
  technicalApproach: string
  implementationPlan: string
  costBreakdown: CostBreakdown | null
  risks: string[]
}

export interface Proposal {
  id: string
  version: string
  title: string
  type: 'Conceptual' | 'Technical' | 'Detailed'
  status: 'Draft' | 'Current' | 'Archived'
  createdAt: string
  author: string
  capex: number
  opex: number

  // Structured data
  snapshot?: ProposalSnapshot
  equipmentList?: EquipmentSpec[]
  treatmentEfficiency?: TreatmentEfficiency
  operationalData?: {
    requiredAreaM2?: number
    flowRateM3Day?: number
    sludgeProductionKgDay?: number
    energyConsumptionKwhM3?: number
  }

  // AI transparency
  aiMetadata?: AIMetadata

  // PDF
  pdfPath?: string
}

// ============================================================================
// Component-specific Props Interfaces
// ============================================================================

// Atomic Components
export interface MetricCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  loading?: boolean
}

export interface CriticalityBadgeProps {
  level: 'high' | 'medium' | 'low'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface ConfidenceIndicatorProps {
  level: 'High' | 'Medium' | 'Low'
  showDetails?: boolean
  compact?: boolean
}

export interface ParameterBarProps {
  parameter: string
  influent: number
  effluent: number
  removalPercent: number
  unit: string
  target?: number
  showCompliance?: boolean
}

export interface ComplianceBadgeProps {
  passes: boolean
  compact?: boolean
}

// Section Components
export interface HeroSectionProps {
  proposal: Proposal
  projectName: string
}

export interface MetricsCardsProps {
  capex: number
  opex: number
  implementationMonths?: number
  requiredAreaM2?: number
  loading?: boolean
}

export interface EquipmentTableProps {
  equipment: EquipmentSpec[]
  showCriticality?: boolean
  groupByStage?: boolean
  compact?: boolean
}

export interface WaterQualityVizProps {
  parameters: TreatmentParameter[]
  showTargets?: boolean
  compact?: boolean
}

export interface CostBreakdownSectionProps {
  type: 'CAPEX' | 'OPEX'
  breakdown: CostBreakdown | OperationalCosts | null | undefined
  total: number
  validateSum?: boolean
}

export interface ProvenCasesListProps {
  cases: ProvenCase[]
  compact?: boolean
}

export interface AssumptionsListProps {
  assumptions: string[]
  editable?: boolean
}

export interface AlternativesListProps {
  alternatives: Alternative[]
}

export interface TechnologyJustificationsProps {
  justifications: TechnologyJustification[]
}

// Tab Components
export interface OverviewTabProps {
  proposal: Proposal
  projectName: string
}

export interface TechnicalTabProps {
  proposal: Proposal
}

export interface EconomicsTabProps {
  proposal: Proposal
}

export interface AIValidationTabProps {
  proposal: Proposal
}

// Main Component
export interface ProposalDetailProps {
  proposal: Proposal
  projectName: string
  projectId: string
  onStatusChange?: (proposalId: string, status: Proposal['status']) => void
  onDownloadPDF?: (proposalId: string) => Promise<void>
}

// ============================================================================
// Helper Types
// ============================================================================

export type ComplianceCheck = {
  parameter: string
  effluentValue: number
  targetValue: number
  unit: string
  passes: boolean
  removalPercent: number
}

export type ComplianceResult = {
  checks: ComplianceCheck[]
  overallCompliance: boolean
}

export type ValidationWarning = {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export type ProposalDataValidation = {
  isValid: boolean
  warnings: ValidationWarning[]
}

// ============================================================================
// Navigation Types
// ============================================================================

export interface ProposalDetailSection {
  id: string
  label: string
  description?: string
}
