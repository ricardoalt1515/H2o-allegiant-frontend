/**
 * Proposal Types
 * Shared between API layer and domain layer
 */

// ==============================================
// AI METADATA
// ==============================================

/**
 * AI Metadata for transparency and explainability
 * Exposes the AI's reasoning, proven cases consulted, assumptions made,
 * and alternative technologies considered.
 *
 * Added: October 2025 - Phase 1 (Transparency)
 */
export interface AIMetadata {
	usage_stats: {
		total_tokens: number;
		model_used: string;
		cost_estimate?: number;
		generation_time_seconds?: number;
	};
	proven_cases: Array<{
		case_id?: string | null;
		application_type: string;
		treatment_train: string;
		flow_rate?: number | null;
		flow_range?: string | null;
		capex_usd?: number;
		similarity_score?: number;
	}>;
	user_sector?: string;
	assumptions: string[];
	alternatives: Array<{
		technology: string;
		reason_rejected: string;
	}>;
	technology_justification: Array<{
		stage: string;
		technology: string;
		justification: string;
	}>;
	confidence_level: "High" | "Medium" | "Low";
	recommendations?: string[];
	generated_at: string;
}

// ==============================================
// TREATMENT EFFICIENCY
// ==============================================

export interface TreatmentEfficiency {
	parameters: Array<{
		parameterName: string;
		influentConcentration?: number;
		effluentConcentration?: number;
		removalEfficiencyPercent: number;
		unit: string;
		treatmentStage?: string;
	}>;
	overallCompliance?: boolean;
	criticalParameters?: string[];
}

// ==============================================
// EQUIPMENT
// ==============================================

export interface Equipment {
	type: string;
	specifications: string;
	capacityM3Day: number;
	powerConsumptionKw: number;
	capexUsd: number;
	dimensions: string;
	justification?: string;
	criticality?: string;
	stage?: string;
	riskFactor?: number;
}

// ==============================================
// OPERATIONAL COSTS
// ==============================================

export interface OperationalCosts {
	electricalEnergy: number;
	chemicals: number;
	personnel: number;
	maintenanceSpareParts: number;
}

// ==============================================
// COST BREAKDOWN
// ==============================================

export interface CostBreakdown {
	equipmentCost?: number;
	civilWorks?: number;
	installationPiping?: number;
	engineeringSupervision?: number;
	contingency?: number;
}
