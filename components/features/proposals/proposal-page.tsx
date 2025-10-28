"use client";

import { ArrowLeft, DollarSign, Download, FileText } from "lucide-react";
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
import { ProposalParameters } from "./proposal-parameters";
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

			{/* Main Content - Engineer-First Hierarchy */}
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="space-y-12">
					{/* 1. Hero + Overview - System at a glance */}
					<section id="overview" className="scroll-mt-24">
						<ProposalOverview proposal={proposal} />
					</section>

					<Separator className="my-8" />

					{/* 2. Treatment Train - MOST IMPORTANT for engineers */}
					{proposal.equipmentList && proposal.equipmentList.length > 0 && (
						<section id="treatment-train" className="scroll-mt-24">
							<ProposalTechnical proposal={proposal} />
						</section>
					)}

					{/* 3. Water Quality - Shows what the treatment achieves */}
					{proposal.treatmentEfficiency && (
						<section id="water-quality" className="scroll-mt-24">
							<ProposalWaterQuality proposal={proposal} />
						</section>
					)}

					<Separator className="my-8" />

					{/* 4. Economics - Investment breakdown */}
					<section id="economics" className="scroll-mt-24">
						<ProposalEconomics proposal={proposal} />
					</section>

					<Separator className="my-8" />

					{/* 5. Design Parameters & Operational Data */}
					{(proposal.aiMetadata?.technicalData?.designParameters ||
						proposal.operationalData) && (
						<section id="parameters" className="scroll-mt-24">
							<ProposalParameters
								designParameters={
									proposal.aiMetadata?.technicalData?.designParameters ||
									undefined
								}
								operationalData={proposal.operationalData || undefined}
							/>
						</section>
					)}

					{/* 6. AI Analysis - Insights and justification */}
					{proposal.aiMetadata && (
						<section id="ai-analysis" className="scroll-mt-24">
							<ProposalAISection proposal={proposal} />
						</section>
					)}

					{/* 7. Technology Justification & Alternatives */}
					{proposal.aiMetadata?.alternatives &&
						proposal.aiMetadata.alternatives.length > 0 && (
							<section id="alternatives" className="scroll-mt-24">
								<Card>
									<CardHeader>
										<CardTitle>Technology Selection</CardTitle>
										<p className="text-sm text-muted-foreground mt-1">
											Alternative technologies considered and selection
											rationale
										</p>
									</CardHeader>
									<CardContent className="space-y-6">
										{/* Technology Justification */}
										{proposal.aiMetadata.technologyJustification &&
											proposal.aiMetadata.technologyJustification.length >
												0 && (
												<div>
													<h4 className="font-semibold mb-3">
														Selected Technologies
													</h4>
													<div className="space-y-3">
														{proposal.aiMetadata.technologyJustification.map(
															(tech, idx) => (
																<div
																	key={`${tech.stage}-${idx}`}
																	className="p-4 rounded-lg border bg-card/50"
																>
																	<div className="flex items-start gap-3">
																		<Badge variant="outline">
																			{tech.stage}
																		</Badge>
																		<div className="flex-1">
																			<p className="font-medium mb-1">
																				{tech.technology}
																			</p>
																			<p className="text-sm text-muted-foreground">
																				{tech.justification}
																			</p>
																		</div>
																	</div>
																</div>
															),
														)}
													</div>
												</div>
											)}

										{/* Alternatives Rejected */}
										<div>
											<h4 className="font-semibold mb-3">
												Alternatives Considered
											</h4>
											<div className="space-y-2">
												{proposal.aiMetadata.alternatives.map((alt, idx) => (
													<div
														key={`${alt.technology}-${idx}`}
														className="p-3 rounded-lg border border-destructive/20 bg-destructive/5"
													>
														<div className="flex items-start justify-between gap-3">
															<div className="flex-1">
																<p className="font-medium text-sm">
																	{alt.technology}
																</p>
																<p className="text-xs text-muted-foreground mt-1">
																	{alt.reasonRejected}
																</p>
															</div>
															<Badge variant="destructive" className="text-xs">
																Rejected
															</Badge>
														</div>
													</div>
												))}
											</div>
										</div>
									</CardContent>
								</Card>
							</section>
						)}

					<Separator className="my-12" />

					{/* 8. Download CTA - Simplified */}
					<section className="scroll-mt-24">
						<Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 backdrop-blur-sm">
							<CardContent className="p-8 text-center">
								<div className="max-w-2xl mx-auto space-y-6">
									<div>
										<Badge className="mb-3" variant="outline">
											<FileText className="h-3 w-3 mr-1" />
											Export
										</Badge>
										<h2 className="text-3xl font-bold mb-2">
											Download Complete Proposal
										</h2>
										<p className="text-muted-foreground">
											Get a professional PDF with all technical details, AI
											analysis, and engineering justifications
										</p>
									</div>

									<Button
										size="lg"
										className="min-w-[200px]"
										onClick={onDownloadPDF}
									>
										<Download className="mr-2 h-5 w-5" />
										Download PDF
									</Button>

									<p className="text-sm text-muted-foreground">
										Need detailed engineering support?{" "}
										<a
											href="mailto:engineering@h2oallegiant.com"
											className="text-primary hover:underline"
										>
											Contact our team
										</a>
									</p>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* 9. Assumptions - Optional details */}
					{proposal.aiMetadata?.assumptions && (
						<section id="assumptions" className="scroll-mt-24">
							<ProposalAssumptions proposal={proposal} />
						</section>
					)}
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
