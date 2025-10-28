"use client";

import {
	ArrowRight,
	CheckCircle,
	Clock,
	DollarSign,
	TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Proposal } from "./types";

interface ProposalOverviewProps {
	proposal: Proposal;
}

export function ProposalOverview({ proposal }: ProposalOverviewProps) {
	const technicalData = proposal.aiMetadata?.technicalData;
	const problemAnalysis = proposal.aiMetadata?.problemAnalysis;

	// Calculate total stages from equipment
	const stages = new Set(proposal.equipmentList?.map((eq) => eq.stage) || [])
		.size;
	const hasCompliance = proposal.treatmentEfficiency?.overallCompliance;

	return (
		<div className="space-y-8">
			{/* Hero Section - System at a Glance */}
			<div className="text-center space-y-6">
				<div>
					<h1 className="text-4xl font-bold mb-2">{proposal.title}</h1>
					<p className="text-xl text-muted-foreground">
						Design Flow:{" "}
						{technicalData?.flowRateM3Day ||
							proposal.operationalData?.flowRateM3Day ||
							"N/A"}{" "}
						m³/day
					</p>
				</div>

				{/* Key Metrics Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<MetricCard
						icon={DollarSign}
						label="Total Investment"
						value={formatCurrency(proposal.capex, {
							locale: "en-US",
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						})}
						subtitle={`ROI: ${technicalData?.roiPercent ? formatNumber(technicalData.roiPercent) + "%" : "N/A"}`}
						variant="primary"
					/>

					<MetricCard
						icon={TrendingUp}
						label="Annual Operating Cost"
						value={formatCurrency(proposal.opex, {
							locale: "en-US",
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						})}
						subtitle="OPEX/year"
						variant="chart-2"
					/>

					{stages > 0 && (
						<MetricCard
							icon={CheckCircle}
							label="Treatment Stages"
							value={stages}
							subtitle="Process steps"
							variant="chart-4"
						/>
					)}

					{hasCompliance !== undefined && (
						<MetricCard
							icon={CheckCircle}
							label="Compliance"
							value={hasCompliance ? "PASS" : "FAIL"}
							subtitle="Regulatory"
							variant={hasCompliance ? "success" : "warning"}
						/>
					)}
				</div>
			</div>

			{/* Problem → Solution Hero - Glass morphism effect */}
			{problemAnalysis && (
				<Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background/50 to-primary/5 backdrop-blur-sm shadow-xl">
					<CardContent className="p-6">
						<div className="grid md:grid-cols-3 gap-6 items-center">
							{/* Problem */}
							<div className="space-y-2">
								<Badge variant="destructive">Problem</Badge>
								<h3 className="font-semibold">Current Situation</h3>
								<ul className="text-sm text-muted-foreground space-y-1">
									{problemAnalysis.conditionsRestrictions
										?.slice(0, 3)
										.map((restriction) => (
											<li key={restriction}>• {restriction}</li>
										))}
								</ul>
							</div>

							{/* Arrow */}
							<div className="flex justify-center">
								<ArrowRight className="h-8 w-8 text-primary" />
							</div>

							{/* Solution */}
							<div className="space-y-2">
								<Badge variant="default">Solution</Badge>
								<h3 className="font-semibold">Proposed System</h3>
								<ul className="text-sm text-muted-foreground space-y-1">
									{problemAnalysis.qualityObjectives?.slice(0, 3).map((obj) => (
										<li key={obj} className="flex items-start gap-1">
											<CheckCircle className="h-4 w-4 text-[var(--compliance-pass)] mt-0.5 flex-shrink-0" />
											<span>{obj}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Additional Metrics - Implementation timeline and payback */}
			{(technicalData?.implementationMonths || technicalData?.paybackYears) && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{technicalData?.implementationMonths && (
						<MetricCard
							icon={Clock}
							label="Implementation Timeline"
							value={`${technicalData.implementationMonths} months`}
							subtitle="Construction period"
							variant="chart-4"
						/>
					)}

					{technicalData?.paybackYears && (
						<MetricCard
							icon={TrendingUp}
							label="Payback Period"
							value={`${technicalData.paybackYears} years`}
							subtitle="Investment recovery"
							variant="success"
						/>
					)}
				</div>
			)}

			{/* Executive Summary - Restructured for scannability */}
			{proposal.snapshot?.executiveSummary && (
				<Card>
					<CardHeader>
						<CardTitle>Executive Summary</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Key highlights and project overview
						</p>
					</CardHeader>
					<CardContent>
						{/* Full text - keeping it simple and data-driven */}
						<p className="text-sm text-muted-foreground leading-relaxed">
							{proposal.snapshot.executiveSummary}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
