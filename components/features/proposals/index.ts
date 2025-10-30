/**
 * Proposal Feature Components - Simplified and Consolidated
 *
 * Clean, focused components that display data from the backend.
 * No business logic, just presentation.
 */

// Main proposal page component
export { ProposalPage, ProposalPage as ProposalDetail } from "./proposal-page";

// Modular section components
export { ProposalAISection } from "./proposal-ai-section";
export { ProposalAssumptions } from "./proposal-assumptions";
export { ProposalEconomics } from "./proposal-economics";
export { ProposalOverview } from "./proposal-overview";
export { ProposalTechnical } from "./proposal-technical";
export { ProposalWaterQuality } from "./proposal-water-quality";

// Types
export type * from "./types";
