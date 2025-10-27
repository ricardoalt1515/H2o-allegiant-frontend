import type { DataSource } from "@/lib/constants";
import type { Sector } from "@/lib/sectors-config";
import type {
	AIMetadata,
	CostBreakdown,
	Equipment,
	OperationalCosts,
	TreatmentEfficiency,
} from "@/lib/types/proposal";
import type { TableSection } from "@/lib/types/technical-data";

// Define ProjectStatus here (moved from constants to avoid circular dependency)
export type ProjectStatus =
	| "In Preparation"
	| "Generating Proposal"
	| "Proposal Ready"
	| "In Development"
	| "Completed"
	| "On Hold";

// Type aliases for backwards compatibility
export type ProjectSector = Sector;
export type { DataSource };

export type ProjectSubsector = {
	Commercial: "Shopping Mall" | "Hotel" | "Office Building" | "Other";
	Residential: "Single Home" | "Multi-Family Complex" | "Other";
	Industrial: "Food & Beverage" | "Textile" | "Pharmaceuticals" | "Other";
	Municipal: "City Government Building" | "Public Utility" | "Other";
};

export interface ProjectSummary {
	id: string;
	name: string;
	client: string;
	sector: ProjectSector;
	subsector?: string;
	location: string;
	status: ProjectStatus;
	progress: number;
	createdAt: string;
	updatedAt: string; // Changed from lastUpdated to match backend
	type: string;
	description: string;
	budget: number;
	scheduleSummary: string;
	proposalsCount: number;
	tags?: string[];
}

export interface ProposalSnapshot {
	executiveSummary: string;
	technicalApproach: string;
	costBreakdown: CostBreakdown;
	implementationPlan: string;
	risks: string[];
	metrics?: {
		capex: number;
		opex: number;
		efficiency?: number;
		duration?: string;
	};
}

export interface ProposalVersion {
	id: string;
	version: string;
	title: string;
	type: "Conceptual" | "Technical" | "Detailed";
	status: "Draft" | "Current" | "Archived";
	createdAt: string;
	author: string;
	capex: number;
	opex: number;
	snapshot: ProposalSnapshot;
	content: Record<string, unknown>;

	// AI-generated data (from backend)
	aiMetadata?: AIMetadata;
	treatmentEfficiency?: TreatmentEfficiency;
	equipmentList?: Equipment[];
	operationalCosts?: OperationalCosts;
	pdfPath?: string;
}

export interface ProposalComparison {
	fromVersionId: string;
	toVersionId: string;
	changes: Array<{
		id: string;
		section: string;
		field: string;
		oldValue: string | number | null;
		newValue: string | number | null;
		changeType: "added" | "modified" | "removed";
	}>;
}

export type VersionSource = "manual" | "import" | "ai" | "rollback";

export interface VersionChange {
	id: string;
	sectionId: string;
	fieldId: string;
	label: string;
	oldValue: string | number | string[] | null;
	newValue: string | number | string[] | null;
	unit?: string;
	source: VersionSource;
	changeType: "added" | "modified" | "removed";
}

export interface TechnicalDataVersion {
	id: string;
	projectId: string;
	versionLabel: string;
	createdAt: string;
	createdBy: string;
	source: VersionSource;
	notes?: string;
	snapshot: TableSection[];
	changes: VersionChange[];
}

export interface ProjectVersionSummary {
	id: string;
	projectId: string;
	versionLabel: string;
	type: "technical-data" | "proposal" | "file" | "decision";
	createdAt: string;
	createdBy: string;
	source: VersionSource;
	notes?: string;
}

export type TimelineEventType =
	| "version"
	| "proposal"
	| "edit"
	| "upload"
	| "assistant"
	| "import";

export interface TimelineEvent {
	id: string;
	type: TimelineEventType;
	title: string;
	description: string;
	user: string;
	timestamp: string;
	metadata?: Record<string, unknown>;
}

export interface ProjectFile {
	id: string;
	name: string;
	type: string;
	size: number;
	uploadedAt: string;
	uploadedBy: string;
	url?: string;
	status?: "processing" | "ready" | "error";
}

export interface ProjectDetail extends ProjectSummary {
	technicalSections: TableSection[];
	proposals: ProposalVersion[];
	timeline: TimelineEvent[];
	files: ProjectFile[];
	analytics?: {
		capexDelta?: number;
		opexDelta?: number;
		riskHighlights?: string[];
	};
}
