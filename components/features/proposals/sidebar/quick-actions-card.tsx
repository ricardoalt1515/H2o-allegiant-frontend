import { AlertCircle, Download, ListChecks, ShieldCheck } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { DecisionActionButton } from "../shared/decision-action-button";
import type { EquipmentSpec, Proposal } from "../types";

interface QuickActionsCardProps {
	proposal: Proposal;
	criticalParameters: string[];
	criticalEquipment: EquipmentSpec[];
	onDownloadPDF: (() => void) | undefined;
	onStatusChange: ((newStatus: string) => void) | undefined;
	closeDrawer?: (() => void) | undefined;
}

/**
 * Quick actions card for proposal decisions
 * Provides download PDF and mark as current actions
 * Shows risk warnings if critical parameters or equipment detected
 */
export function QuickActionsCard({
	proposal,
	criticalParameters,
	criticalEquipment,
	onDownloadPDF,
	onStatusChange,
	closeDrawer,
}: QuickActionsCardProps) {
	const handleDownload = () => {
		if (!onDownloadPDF) return;
		onDownloadPDF();
		closeDrawer?.();
	};

	const handleSetCurrent = () => {
		if (!onStatusChange) return;
		onStatusChange("Current");
		closeDrawer?.();
	};

	const hasCriticals =
		criticalParameters.length > 0 || criticalEquipment.length > 0;

	return (
		<Card>
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
					<ListChecks className="h-4 w-4" />
					Quick actions
				</CardTitle>
				<CardDescription>
					Prioritize next steps based on the agent's findings.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 text-sm">
				<DecisionActionButton
					icon={Download}
					label="Download PDF report"
					description="Complete package with technical annexes and executive summary."
					onAction={handleDownload}
					disabled={!onDownloadPDF}
				/>
				<Separator />
				<DecisionActionButton
					icon={ShieldCheck}
					label="Mark as current proposal"
					description="Set this version as the reference for follow-up."
					onAction={handleSetCurrent}
					disabled={!onStatusChange || proposal.status === "Current"}
				/>
				<Separator />
				<div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
					<Tooltip delayDuration={200}>
						<TooltipTrigger asChild>
							<div className="rounded-full bg-amber-200/60 p-2">
								<AlertCircle className="h-4 w-4 text-amber-700" />
							</div>
						</TooltipTrigger>
						<TooltipContent>
							Monitor risks before moving into detailed engineering.
						</TooltipContent>
					</Tooltip>
					<div className="space-y-1">
						<p className="text-sm font-medium">
							{hasCriticals
								? "Review detected risks"
								: "No major risks detected"}
						</p>
						<p className="text-xs text-muted-foreground leading-tight">
							{hasCriticals
								? "Share with your team to validate critical parameters and high-impact equipment."
								: "Proceed with commercial validation or request support from the core team as needed."}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
