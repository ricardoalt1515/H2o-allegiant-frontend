/**
 * Proposal Feature Components - Simplified and Consolidated
 *
 * Clean, focused components that display data from the backend.
 * No business logic, just presentation.
 */

// Legacy components (kept for backward compatibility)
export { AITransparency } from "./ai-transparency";
export { EquipmentListImproved } from "./equipment-list-improved";
export { ProposalAISection } from "./proposal-ai-section";
export { ProposalAssumptions } from "./proposal-assumptions";
export { ProposalEconomics } from "./proposal-economics";
// Modular section components
export { ProposalHeader } from "./proposal-header";
export { ProposalOverview } from "./proposal-overview";
// Main proposal page component
export { ProposalPage, ProposalPage as ProposalDetail } from "./proposal-page";
export { ProposalTechnical } from "./proposal-technical";
export { ProposalWaterQuality } from "./proposal-water-quality";

// Types
export type * from "./types";
