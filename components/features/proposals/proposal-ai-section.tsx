"use client";

import {
	Brain,
	CheckCircle,
	Cpu,
	Database,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { CircularGauge } from "@/components/ui/circular-gauge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { Proposal } from "./types";

interface ProposalAISectionProps {
	proposal: Proposal;
}

export function ProposalAISection({ proposal }: ProposalAISectionProps) {
	const aiMetadata = proposal.aiMetadata;

	if (!aiMetadata) {
		return null;
	}

	// Constants - avoid magic numbers
	const CONFIDENCE_THRESHOLDS = {
		High: 80,
		Medium: 60,
		Low: 40,
	} as const;

	const confidence = aiMetadata.proposal.confidenceLevel || "Medium";
	const provenCases = aiMetadata.transparency.provenCases || [];
	
	// Technology selection from technical data
	const selectedTechnologies = aiMetadata.proposal.technicalData.technologySelection?.selectedTechnologies || [];
	const rejectedAlternatives = aiMetadata.proposal.technicalData.technologySelection?.rejectedAlternatives || [];

	// Helper: Calculate confidence score from level
	const getConfidenceScore = (level: typeof confidence): number => {
		return CONFIDENCE_THRESHOLDS[level] || CONFIDENCE_THRESHOLDS.Medium;
	};

	// Helper: Get mock breakdown (TODO: get from backend)
	const getConfidenceBreakdown = () => ({
		dataQuality: Math.min(100, getConfidenceScore(confidence) + 20),
		caseSimilarity: getConfidenceScore(confidence),
		technologyMatch: Math.min(100, getConfidenceScore(confidence) + 10),
	});

	const confidenceScore = getConfidenceScore(confidence);
	const breakdown = getConfidenceBreakdown();

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
					<Brain className="h-8 w-8 text-primary" />
					AI Analysis
				</h2>
				<p className="text-muted-foreground">
					Engineering reasoning and proven references
				</p>
			</div>

			{/* AI Confidence - Enhanced visualization with circular gauge */}
			<Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-lg">
				<CardContent className="p-6">
					<div className="flex items-center gap-2 mb-6">
						<Brain className="h-5 w-5 text-primary" />
						<h3 className="text-lg font-semibold">AI Confidence Assessment</h3>
					</div>

					<div className="flex items-start justify-between gap-8">
						{/* Circular gauge */}
						<div className="flex flex-col items-center gap-3">
							<CircularGauge
								value={confidenceScore}
								size="lg"
								color={`var(--confidence-${
									confidence === "High"
										? "high"
										: confidence === "Medium"
											? "medium"
											: "low"
								})`}
							/>
							<Badge
								variant="outline"
								className={`${
									confidence === "High"
										? "border-[var(--confidence-high)] text-[var(--confidence-high)]"
										: confidence === "Medium"
											? "border-[var(--confidence-medium)] text-[var(--confidence-medium)]"
											: "border-[var(--confidence-low)] text-[var(--confidence-low)]"
								}`}
							>
								{confidence} Confidence
							</Badge>
							<p className="text-xs text-muted-foreground text-center max-w-[160px]">
								Based on {provenCases.length} proven{" "}
								{provenCases.length === 1 ? "case" : "cases"}
							</p>
						</div>

						{/* Confidence factors breakdown */}
						<div className="flex-1 space-y-4">
							<p className="text-sm font-medium">Confidence Factors:</p>

							<div className="space-y-3">
								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-2">
										<Database className="h-3.5 w-3.5 text-muted-foreground" />
										<span className="text-muted-foreground">Data Quality</span>
									</div>
									<div className="flex items-center gap-2">
										<Progress
											value={breakdown.dataQuality}
											className="w-24 h-2"
										/>
										<span className="font-medium w-12 text-right">
											{breakdown.dataQuality}%
										</span>
									</div>
								</div>

								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-2">
										<TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
										<span className="text-muted-foreground">
											Case Similarity
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Progress
											value={breakdown.caseSimilarity}
											className="w-24 h-2"
										/>
										<span className="font-medium w-12 text-right">
											{breakdown.caseSimilarity}%
										</span>
									</div>
								</div>

								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-2">
										<Cpu className="h-3.5 w-3.5 text-muted-foreground" />
										<span className="text-muted-foreground">
											Technology Match
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Progress
											value={breakdown.technologyMatch}
											className="w-24 h-2"
										/>
										<span className="font-medium w-12 text-right">
											{breakdown.technologyMatch}%
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Technology Selection Reasoning */}
			{selectedTechnologies.length > 0 && (
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Brain className="h-5 w-5 text-primary" />
							Technology Selection Reasoning
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{selectedTechnologies.map((tech) => (
								<div
									key={`${tech.stage}-${tech.technology}`}
									className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors"
								>
									<div className="flex items-center gap-2">
										<Badge variant="outline" className="font-medium">
											{tech.stage}
										</Badge>
										<span className="font-semibold">{tech.technology}</span>
									</div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{tech.justification}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Alternatives Evaluated */}
			{rejectedAlternatives.length > 0 && (
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<XCircle className="h-5 w-5 text-muted-foreground" />
							Alternatives Evaluated
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Technologies considered but not recommended
						</p>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{rejectedAlternatives.map((alternative) => (
								<div
									key={alternative.technology}
									className="p-3 rounded-lg bg-muted/20 border border-border"
								>
									<div className="flex items-start gap-3">
										<XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<p className="font-medium text-sm mb-1">
												{alternative.technology}
											</p>
											<p className="text-sm text-muted-foreground">
												{alternative.reasonRejected}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Proven Cases */}
			{provenCases.length > 0 && (
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-success" />
							Similar Proven Cases
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							This proposal is based on {provenCases.length} proven case
							{provenCases.length > 1 ? "s" : ""} with similar characteristics
						</p>

						<Carousel className="w-full">
							<CarouselContent>
								{provenCases.map((provenCase) => (
									<CarouselItem
										key={
											provenCase.caseId ||
											provenCase.projectName ||
											provenCase.applicationType
										}
									>
										<Card>
											<CardContent className="p-6">
												<div className="space-y-3">
													<div>
														<Badge variant="secondary" className="mb-2">
															Case #{provenCases.indexOf(provenCase) + 1}
														</Badge>
														{provenCase.projectName && (
															<h4 className="font-semibold text-lg">
																{provenCase.projectName}
															</h4>
														)}
													</div>

													<div className="grid md:grid-cols-2 gap-4">
														<div>
															<p className="text-sm text-muted-foreground">
																Application
															</p>
															<p className="font-medium">
																{provenCase.applicationType}
															</p>
														</div>

														{provenCase.sector && (
															<div>
																<p className="text-sm text-muted-foreground">
																	Sector
																</p>
																<p className="font-medium">
																	{provenCase.sector}
																</p>
															</div>
														)}

														{(provenCase.flowRate || provenCase.flowRange) && (
															<div>
																<p className="text-sm text-muted-foreground">
																	Flow Rate
																</p>
																<p className="font-medium">
																	{provenCase.flowRate
																		? `${provenCase.flowRate} m³/d`
																		: provenCase.flowRange}
																</p>
															</div>
														)}

														{provenCase.capexUsd && (
															<div>
																<p className="text-xs text-muted-foreground">
																	CAPEX
																</p>
																<p className="font-medium">
																	{formatCurrency(provenCase.capexUsd, {
																		locale: "en-US",
																		minimumFractionDigits: 0,
																		maximumFractionDigits: 0,
																	})}
																</p>
															</div>
														)}
													</div>

													<div className="pt-3 border-t">
														<p className="text-sm text-muted-foreground mb-1">
															Treatment Train
														</p>
														<p className="font-medium">
															{provenCase.treatmentTrain}
														</p>
													</div>

													{provenCase.similarityScore && (
														<div className="pt-3 border-t">
															<div className="flex items-center justify-between mb-1">
																<span className="text-sm text-muted-foreground">
																	Similarity Score
																</span>
																<span className="font-semibold">
																	{Math.round(provenCase.similarityScore * 100)}
																	%
																</span>
															</div>
															<div className="w-full bg-muted rounded-full h-2">
																<div
																	className="bg-primary h-2 rounded-full"
																	style={{
																		width: `${provenCase.similarityScore * 100}%`,
																	}}
																/>
															</div>
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									</CarouselItem>
								))}
							</CarouselContent>
							{provenCases.length > 1 && (
								<>
									<CarouselPrevious />
									<CarouselNext />
								</>
							)}
						</Carousel>
					</CardContent>
				</Card>
			)}

			{/* AI Analysis Info */}
			<Card className="bg-gradient-to-br from-muted/50 to-muted/20 border-dashed">
				<CardContent className="p-6">
					<div className="flex items-start gap-4">
						<Brain className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
						<div className="space-y-2">
							<h4 className="font-semibold">How this proposal was generated</h4>
							<p className="text-sm text-muted-foreground leading-relaxed">
								This proposal was generated using advanced AI that analyzed your
								water quality data, compared it against a database of proven
								treatment systems, and applied engineering best practices to
								recommend the most suitable solution. The AI considered factors
								such as contaminant types, flow rates, regulatory requirements,
								and cost-effectiveness.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
