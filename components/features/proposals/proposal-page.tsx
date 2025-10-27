"use client";

import {
	ArrowLeft,
	CheckCircle,
	DollarSign,
	Download,
	FileText,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ProposalAISection } from "./proposal-ai-section";
import { ProposalAssumptions } from "./proposal-assumptions";
import { ProposalEconomics } from "./proposal-economics";
import { ProposalHeader } from "./proposal-header";
import { ProposalOverview } from "./proposal-overview";
import { ProposalTechnical } from "./proposal-technical";
import { ProposalWaterQuality } from "./proposal-water-quality";
import type { Project, Proposal } from "./types";

interface ProposalPageProps {
	proposal: Proposal;
	project: Project;
	isLoading?: boolean;
	onStatusChange?: (newStatus: string) => void;
	onDownloadPDF?: () => void;
}

export function ProposalPage({
	proposal,
	project,
	isLoading = false,
	onStatusChange,
	onDownloadPDF,
}: ProposalPageProps) {
	const [activeSection, setActiveSection] = useState<string>("overview");

	if (isLoading) {
		return <ProposalPageSkeleton />;
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Breadcrumb */}
			<div className="border-b bg-card/50">
				<div className="container mx-auto px-4 py-3">
					<Link
						href={`/project/${project.id}`}
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to {project.name}
					</Link>
				</div>
			</div>

			{/* Header */}
			<ProposalHeader
				proposal={proposal}
				project={project}
				activeSection={activeSection}
				onSectionChange={setActiveSection}
				{...(onStatusChange && { onStatusChange })}
				{...(onDownloadPDF && { onDownloadPDF })}
			/>

			{/* Main Content - New Hierarchy */}
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="space-y-12">
					{/* 1. Overview - Lo más importante primero */}
					<section id="overview" className="scroll-mt-24">
						<ProposalOverview proposal={proposal} />
					</section>

					{/* 2. Water Quality - Visualización impactante */}
					{proposal.treatmentEfficiency && (
						<section id="water-quality" className="scroll-mt-24">
							<ProposalWaterQuality proposal={proposal} />
						</section>
					)}

					{/* 3. AI Analysis - Insights accionables */}
					{proposal.aiMetadata && (
						<section id="ai-analysis" className="scroll-mt-24">
							<ProposalAISection proposal={proposal} />
						</section>
					)}

					<Separator className="my-12" />

					{/* 4. Next Steps CTA - Llamada a la acción prominente */}
					<section className="scroll-mt-24">
						<Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
							<CardContent className="p-8 md:p-10">
								<div className="text-center mb-8">
									<Badge className="mb-3" variant="outline">
										<Sparkles className="h-3 w-3 mr-1" />
										Next Steps
									</Badge>
									<h2 className="text-3xl font-bold mb-2">What's Next?</h2>
									<p className="text-muted-foreground max-w-2xl mx-auto">
										Advance to detailed engineering or download this proposal
									</p>
								</div>

								<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
									{/* Primary CTA - Ingeniería Detallada */}
									<Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-transparent hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
										<CardHeader>
											<Badge className="w-fit mb-2 bg-primary">
												Recommended
											</Badge>
											<CardTitle className="text-2xl">
												Detailed Engineering
											</CardTitle>
											<p className="text-sm text-muted-foreground">
												Complete design ready for implementation
											</p>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex items-baseline gap-2">
												<span className="text-4xl font-bold">$7,500</span>
												<span className="text-muted-foreground">USD</span>
											</div>

											<ul className="space-y-3">
												<li className="flex items-start gap-2 text-sm">
													<CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
													<span>Complete P&IDs and drawings</span>
												</li>
												<li className="flex items-start gap-2 text-sm">
													<CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
													<span>Detailed BOM with quotations</span>
												</li>
												<li className="flex items-start gap-2 text-sm">
													<CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
													<span>Technical support</span>
												</li>
											</ul>

											<Button size="lg" className="w-full" disabled>
												Request Detailed Engineering
											</Button>
											<p className="text-xs text-center text-muted-foreground">
												Coming soon
											</p>
										</CardContent>
									</Card>

									{/* Secondary CTA - Download PDF */}
									<Card className="border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
										<CardHeader>
											<CardTitle className="text-2xl flex items-center gap-2">
												<FileText className="h-6 w-6" />
												Download PDF
											</CardTitle>
											<p className="text-sm text-muted-foreground">
												Share this proposal with your team
											</p>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex items-baseline gap-2">
												<span className="text-4xl font-bold">Free</span>
											</div>

											<ul className="space-y-3">
												<li className="flex items-start gap-2 text-sm text-muted-foreground">
													<CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
													<span>Complete conceptual proposal</span>
												</li>
												<li className="flex items-start gap-2 text-sm text-muted-foreground">
													<CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
													<span>AI analysis included</span>
												</li>
												<li className="flex items-start gap-2 text-sm text-muted-foreground">
													<CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
													<span>Professional format</span>
												</li>
											</ul>

											<Button
												size="lg"
												variant="outline"
												className="w-full"
												onClick={onDownloadPDF}
											>
												<Download className="mr-2 h-4 w-4" />
												Download Now
											</Button>
										</CardContent>
									</Card>
								</div>
							</CardContent>
						</Card>
					</section>

					<Separator className="my-12" />

					{/* 5. Technical Details - Cleaner accordion structure */}
					<section className="scroll-mt-24">
						<Accordion type="multiple" className="w-full space-y-4">
							{/* Equipment Section */}
							<AccordionItem
								value="equipment"
								className="border rounded-lg px-1"
							>
								<AccordionTrigger className="text-lg font-semibold hover:no-underline px-4">
									<div className="flex items-center gap-2">
										<FileText className="h-5 w-5" />
										Equipment & Treatment Train
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-4 pt-6">
									<ProposalTechnical proposal={proposal} />
								</AccordionContent>
							</AccordionItem>

							{/* Economics Section */}
							<AccordionItem
								value="economics"
								className="border rounded-lg px-1"
							>
								<AccordionTrigger className="text-lg font-semibold hover:no-underline px-4">
									<div className="flex items-center gap-2">
										<DollarSign className="h-5 w-5" />
										Economic Analysis
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-4 pt-6">
									<ProposalEconomics proposal={proposal} />
								</AccordionContent>
							</AccordionItem>

							{/* Assumptions Section */}
							{proposal.aiMetadata?.assumptions && (
								<AccordionItem
									value="assumptions"
									className="border rounded-lg px-1"
								>
									<AccordionTrigger className="text-lg font-semibold hover:no-underline px-4">
										<div className="flex items-center gap-2">
											<FileText className="h-5 w-5" />
											Assumptions & Limitations
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-4 pt-6">
										<ProposalAssumptions proposal={proposal} />
									</AccordionContent>
								</AccordionItem>
							)}
						</Accordion>
					</section>
				</div>

				{/* Footer */}
				<div className="mt-16 pt-8 border-t">
					<div className="text-center text-sm text-muted-foreground">
						<p>
							Proposal generated on{" "}
							{new Date(proposal.createdAt).toLocaleDateString()}
						</p>
						<p className="mt-2">
							Powered by H2O Allegiant AI • Version {proposal.version}
						</p>
					</div>
				</div>
			</div>
		</div>
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
					<Skeleton className="h-96 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		</div>
	);
}
