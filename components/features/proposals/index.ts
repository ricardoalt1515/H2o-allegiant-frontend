/**
 * Proposal Feature Components
 * 
 * Centralized exports for all proposal-related components.
 * Import from this index file to maintain clean imports.
 */

// Core proposal components
export { AITransparency } from './ai-transparency'
export { ProblemSolutionHero } from './problem-solution-hero'
export { TreatmentTrainFlow } from './treatment-train-flow'
export { ROIMetricsCards } from './roi-metrics-cards'
export { IndustryComparison } from './industry-comparison'
export { StickyDecisionPanel } from './sticky-decision-panel'
export { EquipmentListImproved } from './equipment-list-improved'
export { TechnicalApproachCollapsed } from './technical-approach-collapsed'

// NEW: Modular proposal detail with tabs
export { ProposalDetail } from './proposal-detail'
export type * from './proposal-detail/types'

// Phase 1 UX Improvements
export { 
  EquipmentCapacityProgress,
  CompactCapacityProgress,
  EquipmentCapacityOverview,
  calculateUtilization
} from './equipment-capacity-progress'
export { 
  TechnicalTermTooltip,
  InlineTerm
} from './technical-term-tooltip'

// Type exports
export type * from './types'
