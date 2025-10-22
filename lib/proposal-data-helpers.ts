/**
 * Proposal Data Helpers
 * 
 * Helper functions to extract and validate data from AI agent output.
 * NEVER hardcode values - always use data from the agent.
 * 
 * @module ProposalDataHelpers
 */

import type { Proposal, EquipmentSpec, WaterParameter } from '@/components/features/proposals/types'

// Re-export Proposal type for convenience
export type { Proposal } from '@/components/features/proposals/types'

/**
 * Get design flow rate from AI agent data
 * This is the flow rate the agent used for equipment sizing
 */
export function getDesignFlowRate(proposal: Proposal): number | null {
  // Priority 1: Technical data (most reliable)
  const flowFromTechnicalData = proposal.aiMetadata?.technicalData?.flowRateM3Day
  if (flowFromTechnicalData && flowFromTechnicalData > 0) {
    return flowFromTechnicalData
  }

  // Priority 2: Problem analysis influent
  const flowFromProblemAnalysis = 
    proposal.aiMetadata?.problemAnalysis?.influentCharacteristics?.flowRateM3Day
  if (flowFromProblemAnalysis && flowFromProblemAnalysis > 0) {
    return flowFromProblemAnalysis
  }

  // Priority 3: Operational data (may include recirculation)
  const flowFromOperational = proposal.operationalData?.flowRateM3Day
  if (flowFromOperational && flowFromOperational > 0) {
    return flowFromOperational
  }

  return null
}

/**
 * Calculate equipment utilization based on actual design flow from agent
 * Returns null if we don't have reliable data
 */
export function calculateEquipmentUtilization(
  equipment: EquipmentSpec,
  designFlowM3Day: number | null
): number | null {
  if (!designFlowM3Day || designFlowM3Day <= 0) {
    return null
  }

  if (!equipment.capacityM3Day || equipment.capacityM3Day <= 0) {
    return null
  }

  // Simple calculation: (design flow / capacity) * 100
  // Agent already applied safety factors when sizing
  return (designFlowM3Day / equipment.capacityM3Day) * 100
}

/**
 * Get target values for water parameters from agent
 * These are the regulatory limits the agent calculated based on project location
 */
export function getParameterTargets(
  proposal: Proposal
): Map<string, { targetValue: number; unit: string }> {
  const targets = new Map<string, { targetValue: number; unit: string }>()

  const parameters = 
    proposal.aiMetadata?.problemAnalysis?.influentCharacteristics?.parameters || []

  parameters.forEach((param: WaterParameter) => {
    if (param.targetValue !== undefined && param.targetValue !== null) {
      // Normalize parameter names (handle BOD/DBO5, TSS/SST variations)
      const normalizedName = normalizeParameterName(param.parameter)
      targets.set(normalizedName, {
        targetValue: param.targetValue,
        unit: param.unit,
      })
    }
  })

  return targets
}

/**
 * Normalize parameter names to handle variations
 * BOD5, DBO5, BOD → "BOD"
 * TSS, SST → "TSS"
 */
function normalizeParameterName(name: string): string {
  const upper = name.toUpperCase().trim()
  
  // BOD variations
  if (upper.includes('BOD') || upper.includes('DBO')) {
    return 'BOD'
  }
  
  // TSS variations
  if (upper.includes('TSS') || upper.includes('SST')) {
    return 'TSS'
  }
  
  // COD variations
  if (upper.includes('COD') || upper.includes('DQO')) {
    return 'COD'
  }
  
  return upper
}

/**
 * Get effluent values from treatment efficiency data
 */
export function getEffluentValues(
  proposal: Proposal
): Map<string, { effluentValue: number; unit: string; removalPercent: number }> {
  const effluents = new Map<string, { effluentValue: number; unit: string; removalPercent: number }>()

  const parameters = proposal.treatmentEfficiency?.parameters || []

  parameters.forEach((param) => {
    if (param.effluentConcentration !== undefined && param.effluentConcentration !== null) {
      const normalizedName = normalizeParameterName(param.parameterName)
      effluents.set(normalizedName, {
        effluentValue: param.effluentConcentration,
        unit: param.unit,
        removalPercent: param.removalEfficiencyPercent,
      })
    }
  })

  return effluents
}

/**
 * Compliance check result type
 */
export interface ComplianceCheck {
  parameter: string
  effluentValue: number
  targetValue: number
  unit: string
  passes: boolean
  removalPercent: number
}

export interface ComplianceResult {
  checks: ComplianceCheck[]
  overallCompliance: boolean
}

/**
 * Calculate compliance based on ACTUAL agent data
 * Returns null if we don't have sufficient data from agent
 */
export function calculateCompliance(proposal: Proposal): ComplianceResult | null {
  const targets = getParameterTargets(proposal)
  const effluents = getEffluentValues(proposal)

  if (targets.size === 0 || effluents.size === 0) {
    return null
  }

  const checks: Array<{
    parameter: string
    effluentValue: number
    targetValue: number
    unit: string
    passes: boolean
    removalPercent: number
  }> = []

  // For each parameter that has both target and effluent
  targets.forEach((target, paramName) => {
    const effluent = effluents.get(paramName)
    if (effluent) {
      checks.push({
        parameter: paramName,
        effluentValue: effluent.effluentValue,
        targetValue: target.targetValue,
        unit: effluent.unit,
        passes: effluent.effluentValue <= target.targetValue,
        removalPercent: effluent.removalPercent,
      })
    }
  })

  if (checks.length === 0) {
    return null
  }

  return {
    checks,
    overallCompliance: checks.every((c) => c.passes),
  }
}

/**
 * Get design parameters from agent
 */
export function getDesignParameters(proposal: Proposal) {
  return proposal.aiMetadata?.technicalData?.designParameters || null
}

/**
 * Validate that we have sufficient data from agent
 * Returns warnings if data is missing or incomplete
 */
export function validateProposalData(proposal: Proposal): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Check for design flow
  const designFlow = getDesignFlowRate(proposal)
  if (!designFlow) {
    warnings.push('Missing design flow rate from agent')
  }

  // Check for equipment list
  if (!proposal.equipmentList || proposal.equipmentList.length === 0) {
    warnings.push('No equipment list provided by agent')
  }

  // Check for parameter targets
  const targets = getParameterTargets(proposal)
  if (targets.size === 0) {
    warnings.push('No target values for water parameters')
  }

  // Check for effluent data
  const effluents = getEffluentValues(proposal)
  if (effluents.size === 0) {
    warnings.push('No treatment efficiency data')
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}
