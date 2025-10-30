/**
 * Shared TypeScript types for Proposal components
 * @module ProposalTypes
 */

export interface WaterParameter {
	parameter: string;
	value: number;
	unit: string;
	targetValue?: number;
}

export interface InfluentCharacteristics {
	parameters: WaterParameter[]; // Flow is now in TechnicalData
}

export interface ProjectRequirements {
	influentCharacteristics: InfluentCharacteristics;
	dischargeRequirements: string[]; // Renamed from qualityObjectives
	businessObjectives: string[]; // Renamed from projectObjectives
	siteConstraints: string[]; // Renamed from conditionsRestrictions
}

export interface EquipmentSpec {
	type: string;
	specifications?: string;
	capacityM3Day: number;
	powerConsumptionKw: number;
	capexUsd: number;
	dimensions: string;
	justification?: string;
	criticality: "high" | "medium" | "low";
	stage: "primary" | "secondary" | "tertiary" | "auxiliary";
	riskFactor?: number;
}

export interface TreatmentParameter {
	parameterName: string;
	influentConcentration?: number;
	effluentConcentration?: number;
	removalEfficiencyPercent: number;
	unit: string;
	treatmentStage?: string;
}

export interface TreatmentEfficiency {
	parameters: TreatmentParameter[];
	overallCompliance: boolean;
	criticalParameters?: string[];
}

export interface ProvenCase {
	caseId?: string;
	projectName?: string;
	applicationType: string;
	sector?: string;
	treatmentTrain: string;
	flowRate?: number;
	flowRange?: string;
	capexUsd?: number;
	similarityScore?: number;
}

export interface SelectedTechnology {
	stage: string;
	technology: string;
	justification: string;
}

export interface RejectedAlternative {
	technology: string;
	reasonRejected: string;
	stage?: string; // Optional
}

export interface TechnologySelection {
	selectedTechnologies: SelectedTechnology[];
	rejectedAlternatives: RejectedAlternative[];
}

export interface AIMetadata {
	proposal: {
		technicalData: TechnicalData & {
			mainEquipment?: EquipmentSpec[];
			treatmentEfficiency?: TreatmentEfficiency;
			capexBreakdown?: CapexBreakdown;
			opexBreakdown?: OpexBreakdown;
			operationalData?: OperationalData;
			technologySelection?: TechnologySelection;
			assumptions?: string[];
		};
		markdownContent: string;
		confidenceLevel: "High" | "Medium" | "Low";
		recommendations?: string[];
	};
	transparency: {
		provenCases: ProvenCase[];
		userSector?: string;
		clientMetadata?: Record<string, any>;
		generatedAt: string;
		generationTimeSeconds: number;
	};
}

export interface DesignParameters {
	peakFactor: number;
	safetyFactor: number;
	operatingHours: number;
	designLifeYears: number;
	regulatoryMarginPercent?: number;
}

// CAPEX breakdown from backend (real data, not calculated)
export interface CapexBreakdown {
	equipmentCost: number;
	civilWorks: number;
	installationPiping: number;
	engineeringSupervision: number;
	contingency?: number;
}

// OPEX breakdown from backend (real data, not calculated)
export interface OpexBreakdown {
	electricalEnergy: number;
	chemicals: number;
	personnel: number;
	maintenanceSpareParts: number;
}

export interface TechnicalData {
	designFlowM3Day?: number; // ✅ RENAMED from flowRateM3Day
	implementationMonths?: number;
	paybackYears?: number;
	annualSavingsUsd?: number;
	roiPercent?: number;
	designParameters?: DesignParameters;
	capexBreakdown?: CapexBreakdown; // ✅ Now properly mapped from backend
	opexBreakdown?: OpexBreakdown; // ✅ Now properly mapped from backend
	technologySelection?: TechnologySelection; // ✅ From backend technical_data
	assumptions?: string[]; // ✅ From backend technical_data
}

export interface OperationalData {
	requiredAreaM2?: number;
	sludgeProductionKgDay?: number;
	energyConsumptionKwhM3?: number;
	// Note: Flow is in TechnicalData.designFlowM3Day (single source of truth)
}

export interface Project {
	id: string;
	name: string;
	sector: string;
}

export interface Proposal {
	id: string;
	title: string;
	version: string;
	status: "Draft" | "Current" | "Archived";
	proposalType: "Conceptual" | "Technical" | "Detailed";
	author: string;
	createdAt: string;
	capex: number;
	opex: number;
	executiveSummary: string;
	technicalApproach: string;
	
	// Single source of truth - all data here
	aiMetadata: AIMetadata;
	
	pdfPath?: string;
}

export interface ProposalDetailProps {
	proposal: Proposal;
	project: Project;
}
