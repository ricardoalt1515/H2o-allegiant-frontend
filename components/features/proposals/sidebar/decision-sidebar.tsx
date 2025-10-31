import {
	Activity,
	AlertCircle,
	CalendarClock,
	FileText,
	ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AIConfidenceCard } from "./ai-confidence-card";
import { ProvenCasesCard } from "./proven-cases-card";
import { QuickActionsCard } from "./quick-actions-card";
import type { AIMetadata, EquipmentSpec, Proposal } from "../types";

interface DecisionSidebarProps {
	proposal: Proposal;
	compliance: boolean | undefined;
	confidenceLevel: AIMetadata["proposal"]["confidenceLevel"];
	confidenceProgress: number | undefined;
	provenCases: AIMetadata["transparency"]["provenCases"];
	criticalParameters: string[];
	criticalEquipment: EquipmentSpec[];
	onDownloadPDF: (() => void) | undefined;
	onStatusChange: ((newStatus: string) => void) | undefined;
}

const PROVEN_CASES_MAX_ITEMS = 4;

/**
 * Decision sidebar for proposal page
 * Shows project status, AI confidence, quick actions, and reference cases
 */
export function DecisionSidebar({
	proposal,
	compliance,
	confidenceLevel,
	confidenceProgress,
	provenCases,
	criticalParameters,
	criticalEquipment,
	onDownloadPDF,
	onStatusChange,
}: DecisionSidebarProps) {
	const highRiskLabel =
		criticalEquipment.length === 0
			? "No critical equipment"
			: `${criticalEquipment.length} critical equipment item(s)`;

	return (
		<div className="h-full space-y-4">
			<Card>
				<CardHeader className="space-y-3 pb-4">
					<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Project status
					</CardTitle>
					<div className="space-y-1 text-sm">
						<div className="flex items-center gap-2">
							<CalendarClock className="h-4 w-4 text-muted-foreground" />
							<span>{formatDateTime(proposal.createdAt)}</span>
						</div>
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4 text-muted-foreground" />
							<span>Version {proposal.version}</span>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					<div className="flex items-center gap-2">
						<ShieldCheck
							className={cn(
								"h-4 w-4",
								compliance === false && "text-destructive",
								compliance && "text-emerald-500",
							)}
						/>
						<span>
							{compliance === undefined
								? "Compliance pending review"
								: compliance
									? "Meets regulatory limits"
									: "Requires compliance review"}
						</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground">
						<AlertCircle className="h-4 w-4" />
						<span>{highRiskLabel}</span>
					</div>
					{criticalParameters.length > 0 && (
						<div className="flex items-start gap-2 text-muted-foreground">
							<Activity className="mt-0.5 h-4 w-4" />
							<span className="leading-tight">
								Critical parameters: {criticalParameters.join(", ")}
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			<AIConfidenceCard
				confidenceLevel={confidenceLevel}
				confidenceProgress={confidenceProgress}
			/>

			<QuickActionsCard
				proposal={proposal}
				criticalParameters={criticalParameters}
				criticalEquipment={criticalEquipment}
				onDownloadPDF={onDownloadPDF}
				onStatusChange={onStatusChange}
			/>

			{provenCases.length > 0 && (
				<ProvenCasesCard
					provenCases={provenCases.slice(0, PROVEN_CASES_MAX_ITEMS)}
				/>
			)}
		</div>
	);
}

/**
 * Format date-time for display
 */
function formatDateTime(value: string): string {
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}
