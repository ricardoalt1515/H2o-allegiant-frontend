/**
 * Shared TypeScript types for Proposal components
 * @module ProposalTypes
 */

export interface WaterParameter {
  parameter: string
  value: number
  unit: string
  targetValue?: number
}

export interface InfluentCharacteristics {
  flowRateM3Day: number
  parameters: WaterParameter[]
}

export interface ProblemAnalysis {
  influentCharacteristics: InfluentCharacteristics
  qualityObjectives: string[]
  conditionsRestrictions: string[]
}

export interface EquipmentSpec {
  type: string
  specifications?: string
  capacityM3Day: number
  powerConsumptionKw: number
  capexUsd: number
  dimensions: string
  justification?: string
  criticality: 'high' | 'medium' | 'low'
  stage: 'primary' | 'secondary' | 'tertiary' | 'auxiliary'
  riskFactor?: number
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

export interface ProvenCase {
  caseId?: string
  projectName?: string
  applicationType: string
  sector?: string
  treatmentTrain: string
  flowRate?: number
  flowRange?: string
  capexUsd?: number
  similarityScore?: number
}

export interface TechnologyJustification {
  stage: string
  technology: string
  justification: string
}

export interface Alternative {
  technology: string
  reasonRejected: string
}

export interface AIMetadata {
  confidenceLevel: 'High' | 'Medium' | 'Low'
  provenCases: ProvenCase[]
  assumptions: string[]
  alternatives: Alternative[]
  technologyJustification: TechnologyJustification[]
  problemAnalysis?: ProblemAnalysis
}

export interface DesignParameters {
  peakFactor: number
  safetyFactor: number
  operatingHours: number
  designLifeYears: number
  regulatoryMarginPercent?: number
}

export interface TechnicalData {
  flowRateM3Day?: number // Design flow rate from agent
  implementationMonths?: number
  paybackYears?: number
  annualSavingsUsd?: number
  roiPercent?: number
  requiredAreaM2?: number
  designParameters?: DesignParameters
}

export interface OperationalData {
  flowRateM3Day?: number // May include recirculation
  requiredAreaM2?: number
  sludgeProductionKgDay?: number
  energyConsumptionKwhM3?: number
}

export interface Project {
  id: string
  name: string
  sector: string
}

export interface Proposal {
  id: string
  title: string
  version: string
  status: string
  type: string
  author: string
  createdAt: string
  capex: number
  opex: number
  equipmentList?: EquipmentSpec[]
  treatmentEfficiency?: TreatmentEfficiency
  aiMetadata?: AIMetadata & {
    technicalData?: TechnicalData
  }
  operationalData?: OperationalData
  snapshot?: {
    executiveSummary?: string
  }
}

export interface ProposalDetailProps {
  proposal: Proposal
  project: Project
}
