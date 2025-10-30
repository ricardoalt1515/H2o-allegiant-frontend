"use client";

import {
	Activity,
	AlertCircle,
	ArrowLeft,
	Bot,
	Brain,
	CalendarClock,
	CheckCircle2,
	ClipboardList,
	Download,
	FileText,
	LayoutDashboard,
	LineChart,
	ListChecks,
	ShieldAlert,
	ShieldCheck,
	SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { ProposalAISection } from "./proposal-ai-section";
import { ProposalAssumptions } from "./proposal-assumptions";
import { ProposalEconomics } from "./proposal-economics";
import { ProposalOverview } from "./proposal-overview";
import { ProposalParameters } from "./proposal-parameters";
import { ProposalTechnical } from "./proposal-technical";
import { ProposalWaterQuality } from "./proposal-water-quality";
import type { AIMetadata, EquipmentSpec, OperationalData, Project, Proposal } from "./types";

interface ProposalPageProps {
	proposal: Proposal;
	project: Project;
	isLoading?: boolean;
	onStatusChange?: (newStatus: string) => void;
	onDownloadPDF?: () => void;
}

// Tab sections configuration
const PROPOSAL_SECTIONS = [
	{ value: "summary", label: "Summary", icon: LayoutDashboard },
	{ value: "process", label: "Process", icon: SlidersHorizontal },
	{ value: "water", label: "Water Quality", icon: Activity },
	{ value: "economics", label: "Economics", icon: LineChart },
	{ value: "ai", label: "AI & Audit", icon: Bot },
	{ value: "assumptions", label: "Assumptions", icon: ClipboardList },
] as const;

type ProposalSection = (typeof PROPOSAL_SECTIONS)[number]["value"];

// Layout constants
const MAIN_PANEL_DEFAULT_SIZE = 72;
const SIDEBAR_DEFAULT_SIZE = 28;
const SIDEBAR_MIN_HEIGHT = 400;

// Proven cases display limits
const PROVEN_CASES_MAX_ITEMS = 4;
const PROVEN_CASES_SCROLL_HEIGHT = 220;

// Criticality threshold for equipment
const HIGH_CRITICALITY = "high" as const;

const CONFIDENCE_PERCENT_BY_LEVEL: Record<
	NonNullable<AIMetadata["proposal"]["confidenceLevel"]>,
	number
> = {
	High: 90,
	Medium: 65,
	Low: 35,
};

const STATUS_BADGE_VARIANT: Record<
	Proposal["status"],
	"default" | "secondary" | "outline"
> = {
	Draft: "outline",
	Current: "default",
	Archived: "secondary",
};

export function ProposalPage({
	proposal,
	project,
	isLoading = false,
	onStatusChange,
	onDownloadPDF,
}: ProposalPageProps) {
	const [activeTab, setActiveTab] = useState<ProposalSection>("summary");
	const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);

	const technicalData = proposal.aiMetadata.proposal.technicalData;
	const equipment = technicalData.mainEquipment || [];
	const criticalEquipment = useMemo(
		() => equipment.filter((item) => item.criticality === HIGH_CRITICALITY),
		[equipment],
	);

	// Extract treatment efficiency data
	const { overallCompliance: compliance, criticalParameters = [] } =
		technicalData.treatmentEfficiency || {};

	// Extract AI metadata
	const confidenceLevel = proposal.aiMetadata.proposal.confidenceLevel;
	const provenCases = proposal.aiMetadata.transparency.provenCases;

	const confidenceProgress = confidenceLevel
		? CONFIDENCE_PERCENT_BY_LEVEL[confidenceLevel]
		: undefined;

	if (isLoading) {
		return <ProposalPageSkeleton />;
	}

	return (
		<Tabs
			value={activeTab}
			onValueChange={(value) => setActiveTab(value as ProposalSection)}
			className="min-h-screen bg-muted/10"
		>
			<header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md">
				<div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
						<Link
							href={`/project/${project.id}`}
							className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to {project.name}
						</Link>
						<div>
							<div className="flex flex-wrap items-center gap-3">
								<h1 className="text-xl font-semibold md:text-2xl">
									{proposal.title}
								</h1>
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant={STATUS_BADGE_VARIANT[proposal.status]}>
										{proposal.status}
									</Badge>
									<Badge variant="secondary">{proposal.proposalType}</Badge>
								</div>
							</div>
							<div className="mt-1 text-xs text-muted-foreground md:text-sm">
								Generated on {formatDateTime(proposal.createdAt)} • Version{" "}
								{proposal.version}
							</div>
						</div>
					</div>
					<div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
						{onDownloadPDF && (
							<Button onClick={onDownloadPDF} className="gap-2">
								<Download className="h-4 w-4" />
								Download PDF
							</Button>
						)}
						<Drawer open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
							<Button
								variant="outline"
								className="gap-2"
								onClick={() => setIsChecklistOpen(true)}
							>
								<ListChecks className="h-4 w-4" />
								Checklist
							</Button>
							<DrawerContent className="px-4 pb-6">
								<DrawerHeader className="items-start text-left">
									<DrawerTitle>Project checklist</DrawerTitle>
									<CardDescription>
										Quick actions to align with the team.
									</CardDescription>
								</DrawerHeader>
								<div className="space-y-4">
									<QuickActionsCard
										proposal={proposal}
										criticalParameters={criticalParameters}
										criticalEquipment={criticalEquipment}
										onDownloadPDF={onDownloadPDF}
										onStatusChange={onStatusChange}
										closeDrawer={() => setIsChecklistOpen(false)}
									/>
								</div>
							</DrawerContent>
						</Drawer>
					</div>
				</div>
				<div className="border-t border-border/70 bg-background/80">
					<div className="container mx-auto px-4 py-3">
						<TabsList className="w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
							{PROPOSAL_SECTIONS.map((section) => {
								const Icon = section.icon;
								return (
									<TabsTrigger
										key={section.value}
										value={section.value}
										className="gap-2 rounded-full border border-transparent px-4 py-2 text-xs font-medium text-muted-foreground transition-all data-[state=active]:border-primary/40 data-[state=active]:text-foreground md:text-sm"
									>
										<Icon className="h-4 w-4" />
										{section.label}
									</TabsTrigger>
								);
							})}
						</TabsList>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-6 lg:py-8">
				<ResizablePanelGroup direction="horizontal" className="gap-6">
					<ResizablePanel
						defaultSize={MAIN_PANEL_DEFAULT_SIZE}
						className="space-y-6"
					>
						<TabsContent value="summary" className="space-y-6">
							<ProposalOverview proposal={proposal} />
							<div className="grid gap-6 lg:grid-cols-2">
								<ComplianceSnapshotCard
									compliance={compliance}
									criticalParameters={criticalParameters}
								/>
								<RiskHighlightsCard
									equipment={equipment}
									operationalData={technicalData.operationalData}
								/>
							</div>
						</TabsContent>

						<TabsContent value="process" className="space-y-6">
							{equipment.length > 0 ? (
								<ProposalTechnical proposal={proposal} />
							) : (
								<EmptyState
									icon={ShieldAlert}
									title="No treatment train available"
									description="The agent did not produce equipment data for this run. Review the inputs or request a new analysis."
								/>
							)}
							{technicalData.designParameters ||
							technicalData.operationalData ? (
								<ProposalParameters
									designParameters={technicalData.designParameters}
									operationalData={technicalData.operationalData}
								/>
							) : null}
						</TabsContent>

						<TabsContent value="water" className="space-y-6">
							{technicalData.treatmentEfficiency ? (
								<ProposalWaterQuality proposal={proposal} />
							) : (
								<EmptyState
									icon={Activity}
									title="No water quality metrics"
									description="The agent did not return treatment efficiency data for this scenario."
								/>
							)}
						</TabsContent>

						<TabsContent value="economics" className="space-y-6">
							<ProposalEconomics proposal={proposal} />
						</TabsContent>

						<TabsContent value="ai" className="space-y-6">
							{proposal.aiMetadata ? (
								<ProposalAISection proposal={proposal} />
							) : (
								<EmptyState
									icon={Brain}
									title="No agent log"
									description="This run did not publish AI metadata or the workflow was completed externally."
								/>
							)}
						</TabsContent>

						<TabsContent value="assumptions" className="space-y-6">
							{technicalData.assumptions?.length ? (
								<ProposalAssumptions proposal={proposal} />
							) : (
								<EmptyState
									icon={AlertCircle}
									title="No assumptions provided"
									description="The agent did not log explicit assumptions for this proposal."
								/>
							)}
						</TabsContent>
					</ResizablePanel>

					<ResizableHandle className="hidden lg:flex" withHandle />

					<ResizablePanel
						defaultSize={SIDEBAR_DEFAULT_SIZE}
						className="hidden flex-col space-y-4 lg:flex"
						style={{ minHeight: SIDEBAR_MIN_HEIGHT }}
					>
						<DecisionSidebar
							proposal={proposal}
							compliance={compliance}
							confidenceLevel={confidenceLevel}
							confidenceProgress={confidenceProgress}
							provenCases={provenCases}
							criticalParameters={criticalParameters}
							criticalEquipment={criticalEquipment}
							onDownloadPDF={onDownloadPDF}
							onStatusChange={onStatusChange}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			</main>
		</Tabs>
	);
}

function ProposalPageSkeleton() {
	return (
		<div className="min-h-screen bg-background">
			<div className="border-b bg-card/50">
				<div className="container mx-auto px-4 py-3">
					<Skeleton className="h-5 w-40" />
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				<div className="space-y-6">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-72 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		</div>
	);
}

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

function DecisionSidebar({
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

interface AIConfidenceCardProps {
	confidenceLevel: AIMetadata["proposal"]["confidenceLevel"];
	confidenceProgress: number | undefined;
}

function AIConfidenceCard({
	confidenceLevel,
	confidenceProgress,
}: AIConfidenceCardProps) {
	return (
		<Card className="bg-card/80 backdrop-blur">
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
					<Brain className="h-4 w-4" />
					Agent confidence
				</CardTitle>
				<CardDescription>
					Estimated robustness based on the data analyzed and validations
					executed.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between text-sm font-medium">
					<span>Confidence</span>
					<span>{confidenceLevel ?? "TBD"}</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
					<div
						className={cn(
							"h-full rounded-full transition-all",
							confidenceLevel === "High" && "bg-emerald-500",
							confidenceLevel === "Medium" && "bg-amber-500",
							confidenceLevel === "Low" && "bg-destructive",
						)}
						style={{ width: `${confidenceProgress ?? 0}%` }}
					/>
				</div>
				<ul className="space-y-2 text-sm text-muted-foreground">
					<li className="flex items-center gap-2">
						<CheckCircle2 className="h-4 w-4 text-primary" />
						Capacity and mass balance checks
					</li>
					<li className="flex items-center gap-2">
						<CheckCircle2 className="h-4 w-4 text-primary" />
						Reference case comparison
					</li>
					<li className="flex items-center gap-2">
						<CheckCircle2 className="h-4 w-4 text-primary" />
						Documented assumptions for audit
					</li>
				</ul>
			</CardContent>
		</Card>
	);
}

interface QuickActionsCardProps {
	proposal: Proposal;
	criticalParameters: string[];
	criticalEquipment: EquipmentSpec[];
	onDownloadPDF: (() => void) | undefined;
	onStatusChange: ((newStatus: string) => void) | undefined;
	closeDrawer?: (() => void) | undefined;
}

function QuickActionsCard({
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

interface DecisionActionButtonProps {
	icon: typeof Download;
	label: string;
	description: string;
	onAction?: () => void;
	disabled?: boolean;
}

function DecisionActionButton({
	icon: Icon,
	label,
	description,
	onAction,
	disabled,
}: DecisionActionButtonProps) {
	return (
		<button
			type="button"
			onClick={onAction}
			disabled={disabled}
			className={cn(
				"w-full rounded-lg border border-border/70 bg-card/50 p-3 text-left transition hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
				disabled &&
					"cursor-not-allowed opacity-60 hover:border-border/70 hover:bg-card/50",
			)}
		>
			<div className="flex items-start gap-3">
				<div className="mt-1 rounded-full bg-primary/10 p-2">
					<Icon className="h-4 w-4 text-primary" />
				</div>
				<div className="space-y-1">
					<p className="text-sm font-medium">{label}</p>
					<p className="text-xs text-muted-foreground leading-snug">
						{description}
					</p>
				</div>
			</div>
		</button>
	);
}

interface ComplianceSnapshotCardProps {
	compliance: boolean | undefined;
	criticalParameters: string[];
}

function ComplianceSnapshotCard({
	compliance,
	criticalParameters,
}: ComplianceSnapshotCardProps) {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
					<ShieldCheck className="h-4 w-4" />
					Regulatory compliance
				</CardTitle>
				<CardDescription>
					Automatic validation against NOM-001 and internal operating limits.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 text-sm">
				<div
					className={cn(
						"rounded-lg border p-4",
						compliance === undefined && "border-border/70 bg-muted/40",
						compliance === true && "border-emerald-400/50 bg-emerald-100/20",
						compliance === false && "border-destructive/40 bg-destructive/10",
					)}
				>
					<p className="text-base font-semibold">
						{compliance === undefined
							? "Result pending validation"
							: compliance
								? "Proposal compliant"
								: "Attention: parameters out of specification"}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{compliance === undefined
							? "Validate critical parameters to confirm regulatory compliance."
							: compliance
								? "The agent confirmed the proposed parameters meet the target regulation."
								: "Review the flagged parameters and evaluate treatment train adjustments."}
					</p>
				</div>
				{criticalParameters.length > 0 && (
					<div className="space-y-2">
						<p className="font-medium">Parameters under watch</p>
						<ul className="flex flex-wrap gap-2">
							{criticalParameters.map((parameter) => (
								<Badge key={parameter} variant="outline">
									{parameter}
								</Badge>
							))}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

interface RiskHighlightsCardProps {
	equipment: EquipmentSpec[];
	operationalData?: OperationalData | undefined;
}

function RiskHighlightsCard({
	equipment,
	operationalData,
}: RiskHighlightsCardProps) {
	const highCriticality = equipment.filter(
		(item) => item.criticality === HIGH_CRITICALITY,
	);
	const hasOperationalData = Boolean(operationalData);

	// Format operational metrics if available
	const energyConsumption = operationalData?.energyConsumptionKwhM3;
	const sludgeProduction = operationalData?.sludgeProductionKgDay;

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
					<ShieldAlert className="h-4 w-4" />
					Operational alerts
				</CardTitle>
				<CardDescription>
					Items to follow up before moving into detailed engineering.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 text-sm">
				<div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/50 p-3">
					<div className="rounded-full bg-destructive/10 p-2">
						<AlertCircle className="h-4 w-4 text-destructive" />
					</div>
					<div className="space-y-1">
						<p className="font-medium">
							{highCriticality.length > 0
								? `${highCriticality.length} high-criticality equipment`
								: "No high-criticality equipment"}
						</p>
						<p className="text-xs text-muted-foreground">
							{highCriticality.length > 0
								? "Verify availability, maintainability, and redundancy."
								: "The equipment selection does not report major operational risks."}
						</p>
					</div>
				</div>
				{hasOperationalData ? (
					<div className="grid gap-3 sm:grid-cols-2">
						{energyConsumption !== undefined && (
							<MetricCard
								label="Estimated energy"
								value={`${formatNumber(energyConsumption)} kWh/m³`}
							/>
						)}
						{sludgeProduction !== undefined && (
							<MetricCard
								label="Projected sludge"
								value={`${formatNumber(sludgeProduction)} kg/day`}
							/>
						)}
					</div>
				) : (
					<p className="text-xs text-muted-foreground">
						No operational data received. Update the request if you need energy
						or sludge analysis.
					</p>
				)}
			</CardContent>
		</Card>
	);
}

interface ProvenCasesCardProps {
	provenCases: AIMetadata["transparency"]["provenCases"];
}

function ProvenCasesCard({ provenCases }: ProvenCasesCardProps) {
	return (
		<Card className="h-full">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
					<ClipboardList className="h-4 w-4" />
					Reference cases
				</CardTitle>
				<CardDescription>
					Selection based on similarity and historical performance across the
					portfolio.
				</CardDescription>
			</CardHeader>
			<CardContent className="px-0 pb-0">
				<ScrollArea
					className="px-6"
					style={{ height: PROVEN_CASES_SCROLL_HEIGHT }}
				>
					<ul className="space-y-4">
						{provenCases.map((reference: any) => (
							<li
								key={`${reference.projectName}-${reference.treatmentTrain}-${reference.applicationType}`}
								className="rounded-lg border border-border/70 bg-card/60 p-4"
							>
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>{reference.applicationType}</span>
									{reference.similarityScore && (
										<span>
											Similarity {formatNumber(reference.similarityScore)}%
										</span>
									)}
								</div>
								<p className="mt-2 text-sm font-medium text-foreground">
									{reference.projectName ?? "Unnamed case"}
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Train: {reference.treatmentTrain}
								</p>
								{reference.capexUsd && (
									<p className="mt-1 text-xs text-muted-foreground">
										Approx. CAPEX{" "}
										{formatCurrency(reference.capexUsd, {
											minimumFractionDigits: 0,
											maximumFractionDigits: 0,
										})}
									</p>
								)}
							</li>
						))}
					</ul>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

// ============================================================================
// Helper Components & Utilities
// ============================================================================

/**
 * Reusable metric display component
 * Follows DRY principle for consistent metric cards
 */
interface MetricCardProps {
	label: string;
	value: string;
	className?: string;
}

function MetricCard({ label, value, className }: MetricCardProps) {
	return (
		<div
			className={cn(
				"rounded-lg border border-border/60 bg-muted/30 p-3",
				className,
			)}
		>
			<p className="text-xs uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="text-lg font-semibold">{value}</p>
		</div>
	);
}

/**
 * Format date-time for display
 * Single source of truth for date formatting
 */
function formatDateTime(value: string): string {
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}
