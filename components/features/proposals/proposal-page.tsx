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
import { cn } from "@/lib/utils";
import { ProposalAISection } from "./proposal-ai-section";
import { ProposalAssumptions } from "./proposal-assumptions";
import { ProposalEconomics } from "./proposal-economics";
import { ProposalOverview } from "./proposal-overview";
import { ProposalParameters } from "./proposal-parameters";
import { ProposalTechnical } from "./proposal-technical";
import { ProposalWaterQuality } from "./proposal-water-quality";
import {
	DecisionSidebar,
	ComplianceSnapshotCard,
	RiskHighlightsCard,
	QuickActionsCard,
} from "./sidebar";
import type { AIMetadata, EquipmentSpec, Project, Proposal } from "./types";

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

/**
 * Loading skeleton for proposal page
 */
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

/**
 * Format date-time for display
 */
function formatDateTime(value: string): string {
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}
