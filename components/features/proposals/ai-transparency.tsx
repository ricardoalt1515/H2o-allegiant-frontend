"use client";

/**
 * AI Transparency Component
 *
 * Displays the AI's reasoning process, proven cases consulted, assumptions made,
 * and alternative technologies considered. This enables engineers to validate
 * and trust the AI's recommendations.
 *
 * Features:
 * - Tabbed interface for different transparency aspects
 * - Confidence level badge
 * - Usage statistics
 * - Accessibility-compliant
 * - Error boundaries
 * - Loading states
 *
 * @author H2O Allegiant Engineering Team
 * @since October 2025 - Phase 1 (Transparency)
 */

import {
	AlertCircle,
	Brain,
	CheckCircle2,
	Info,
	Lightbulb,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalsAPI } from "@/lib/api/proposals";
import type { AIMetadata } from "@/lib/types/proposal";
import { formatCurrency } from "@/lib/utils";

interface AITransparencyProps {
	projectId: string;
	proposalId: string;
	className?: string;
}

/**
 * Main AI Transparency Component
 */
export function AITransparency({
	projectId,
	proposalId,
	className,
}: AITransparencyProps) {
	const [metadata, setMetadata] = useState<AIMetadata | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		async function loadMetadata() {
			try {
				setIsLoading(true);
				setError(null);
				const data = await ProposalsAPI.getAIMetadata(projectId, proposalId);

				if (mounted) {
					setMetadata(data);
				}
			} catch (err) {
				if (mounted) {
					setError(
						err instanceof Error ? err.message : "Failed to load AI metadata",
					);
				}
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		}

		loadMetadata();

		return () => {
			mounted = false;
		};
	}, [projectId, proposalId]);

	if (isLoading) {
		return <AITransparencyLoading />;
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Failed to load AI transparency data: {error}
				</AlertDescription>
			</Alert>
		);
	}

	if (!metadata) {
		return (
			<Alert>
				<Info className="h-4 w-4" />
				<AlertDescription>
					No AI metadata available for this proposal.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Brain className="h-5 w-5 text-primary" />
					AI Transparency & Reasoning
				</CardTitle>
				<CardDescription>
					Understand how the AI arrived at this solution
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Tabs defaultValue="proven-cases" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="proven-cases">
							Proven Cases
							{metadata.proven_cases.length > 0 && (
								<Badge variant="secondary" className="ml-2 h-5 px-1.5">
									{metadata.proven_cases.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="assumptions">
							Assumptions
							{metadata.assumptions.length > 0 && (
								<Badge variant="secondary" className="ml-2 h-5 px-1.5">
									{metadata.assumptions.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="alternatives">
							Alternatives
							{metadata.alternatives.length > 0 && (
								<Badge variant="secondary" className="ml-2 h-5 px-1.5">
									{metadata.alternatives.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="justification">Justification</TabsTrigger>
					</TabsList>

					{/* Proven Cases Tab */}
					<TabsContent value="proven-cases" className="space-y-4 mt-4">
						<div className="text-sm text-muted-foreground">
							The AI consulted <strong>{metadata.proven_cases.length}</strong>{" "}
							similar proven cases
							{metadata.user_sector &&
								` from the ${metadata.user_sector} sector`}
						</div>

						{metadata.proven_cases.length === 0 ? (
							<Alert>
								<Info className="h-4 w-4" />
								<AlertDescription>
									No proven cases were consulted. The AI designed this solution
									from first principles.
								</AlertDescription>
							</Alert>
						) : (
							<div className="space-y-3">
								{metadata.proven_cases.map((provenCase, index) => (
									<div
										key={provenCase.case_id || `proven-case-${index}`}
										className="rounded-lg border bg-card p-4 space-y-3 hover:bg-accent/50 transition-colors"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Badge variant="outline" className="font-normal">
													{provenCase.application_type}
												</Badge>
												<span className="text-xs text-muted-foreground">
													Case #{index + 1}
												</span>
											</div>
											{provenCase.similarity_score !== undefined && (
												<div className="flex items-center gap-1.5">
													<div className="text-xs text-muted-foreground">
														Similarity:
													</div>
													<Badge
														variant={
															provenCase.similarity_score >= 0.9
																? "default"
																: "secondary"
														}
														className={
															provenCase.similarity_score >= 0.9
																? "bg-success text-success-foreground"
																: ""
														}
													>
														{Math.round(provenCase.similarity_score * 100)}%
													</Badge>
												</div>
											)}
										</div>

										<div className="space-y-1">
											<div className="text-sm font-medium">Treatment Train</div>
											<div className="text-sm text-muted-foreground">
												{provenCase.treatment_train}
											</div>
										</div>

										<div className="grid grid-cols-2 gap-3 pt-2 border-t">
											<div>
												<div className="text-xs text-muted-foreground">
													Flow Rate
												</div>
												<div className="text-sm font-medium">
													{provenCase.flow_rate
														? `${provenCase.flow_rate.toLocaleString()} m³/day`
														: provenCase.flow_range || "N/A"}
												</div>
											</div>
											{provenCase.capex_usd !== undefined && (
												<div>
													<div className="text-xs text-muted-foreground">
														CAPEX
													</div>
													<div className="text-sm font-medium">
														{formatCurrency(provenCase.capex_usd)}
													</div>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</TabsContent>

					{/* Assumptions Tab */}
					<TabsContent value="assumptions" className="space-y-4 mt-4">
						<div className="text-sm text-muted-foreground">
							Key assumptions made by the AI during design
						</div>

						{metadata.assumptions.length === 0 ? (
							<Alert>
								<Info className="h-4 w-4" />
								<AlertDescription>
									No explicit assumptions were recorded for this proposal.
								</AlertDescription>
							</Alert>
						) : (
							<ul className="space-y-2">
								{metadata.assumptions.map((assumption, index) => (
									<li
										key={`assumption-${index}-${assumption.slice(0, 30)}`}
										className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
									>
										<Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
										<span className="text-sm">{assumption}</span>
									</li>
								))}
							</ul>
						)}

						<Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50">
							<Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
							<AlertDescription className="text-blue-700 dark:text-blue-300">
								<strong>Note:</strong> Verify these assumptions align with your
								project's specific conditions before proceeding with
								implementation.
							</AlertDescription>
						</Alert>
					</TabsContent>

					{/* Alternatives Tab */}
					<TabsContent value="alternatives" className="space-y-4 mt-4">
						<div className="text-sm text-muted-foreground">
							Technologies considered but not selected
						</div>

						{metadata.alternatives.length === 0 ? (
							<Alert>
								<Info className="h-4 w-4" />
								<AlertDescription>
									No alternative technologies were explicitly evaluated.
								</AlertDescription>
							</Alert>
						) : (
							<div className="space-y-3">
								{metadata.alternatives.map((alternative, index) => (
									<div
										key={`alt-${index}-${alternative.technology}`}
										className="rounded-lg border bg-card p-4 space-y-2 hover:bg-accent/50 transition-colors"
									>
										<div className="flex items-center gap-2">
											<XCircle className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium">
												{alternative.technology}
											</span>
										</div>
										<div className="text-sm text-muted-foreground pl-6">
											<strong>Reason not selected:</strong>{" "}
											{alternative.reason_rejected}
										</div>
									</div>
								))}
							</div>
						)}
					</TabsContent>

					{/* Justification Tab */}
					<TabsContent value="justification" className="space-y-4 mt-4">
						<div className="text-sm text-muted-foreground">
							Technical justification for each treatment stage
						</div>

						{metadata.technology_justification.length === 0 ? (
							<Alert>
								<Info className="h-4 w-4" />
								<AlertDescription>
									No detailed justifications were recorded.
								</AlertDescription>
							</Alert>
						) : (
							<div className="space-y-3">
								{metadata.technology_justification.map(
									(justification, index) => (
										<div
											key={`just-${index}-${justification.stage}`}
											className="rounded-lg border bg-card p-4 space-y-3 hover:bg-accent/50 transition-colors"
										>
											<div className="flex items-center gap-2">
												<Badge variant="default">{justification.stage}</Badge>
												<span className="font-medium text-sm">
													{justification.technology}
												</span>
											</div>
											<div className="text-sm text-muted-foreground leading-relaxed">
												{justification.justification}
											</div>
										</div>
									),
								)}
							</div>
						)}
					</TabsContent>
				</Tabs>

				{/* Confidence Level Section */}
				<div className="pt-4 border-t">
					<div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
						<div className="flex items-center gap-2">
							{metadata.confidence_level === "High" && (
								<CheckCircle2 className="h-5 w-5 text-success" />
							)}
							{metadata.confidence_level === "Medium" && (
								<AlertCircle className="h-5 w-5 text-amber-500" />
							)}
							{metadata.confidence_level === "Low" && (
								<XCircle className="h-5 w-5 text-destructive" />
							)}
							<span className="font-medium">AI Confidence Level:</span>
						</div>
						<Badge
							variant={
								metadata.confidence_level === "High"
									? "default"
									: metadata.confidence_level === "Medium"
										? "secondary"
										: "destructive"
							}
							className={
								metadata.confidence_level === "High"
									? "bg-success text-success-foreground"
									: ""
							}
						>
							{metadata.confidence_level}
						</Badge>
					</div>
				</div>

				{/* Recommendations Section */}
				{metadata.recommendations && metadata.recommendations.length > 0 && (
					<div className="space-y-2">
						<div className="font-medium text-sm">AI Recommendations</div>
						<ul className="space-y-1.5">
							{metadata.recommendations.map((recommendation, index) => (
								<li
									key={`rec-${index}-${recommendation.slice(0, 30)}`}
									className="flex items-start gap-2 text-sm text-muted-foreground"
								>
									<span className="text-primary">•</span>
									<span>{recommendation}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Usage Statistics */}
				<div className="pt-4 border-t">
					<div className="space-y-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
						<div className="text-xs font-medium text-blue-900 dark:text-blue-100">
							Generation Statistics
						</div>
						<div className="grid grid-cols-2 gap-3 text-xs">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Model:</span>
								<span className="font-medium">
									{metadata.usage_stats.model_used}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tokens:</span>
								<span className="font-medium">
									{metadata.usage_stats.total_tokens.toLocaleString()}
								</span>
							</div>
							{metadata.usage_stats?.cost_estimate != null && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Est. Cost:</span>
									<span className="font-medium">
										${metadata.usage_stats.cost_estimate.toFixed(2)}
									</span>
								</div>
							)}
							{metadata.usage_stats?.generation_time_seconds != null && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Time:</span>
									<span className="font-medium">
										{metadata.usage_stats.generation_time_seconds}s
									</span>
								</div>
							)}
						</div>
						<div className="text-xs text-muted-foreground pt-2 border-t border-blue-200/50 dark:border-blue-800/50">
							Generated: {new Date(metadata.generated_at).toLocaleString()}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Loading skeleton for AI Transparency component
 */
function AITransparencyLoading() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-64" />
				<Skeleton className="h-4 w-48 mt-2" />
			</CardHeader>
			<CardContent className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<div className="space-y-3">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			</CardContent>
		</Card>
	);
}
