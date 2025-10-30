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
	const technicalData = proposal.aiMetadata.proposal.technicalData;
	const equipment = technicalData.mainEquipment || [];
	const treatmentEfficiency = technicalData.treatmentEfficiency;

	// Calculate total stages from equipment
	const stages = new Set(equipment.map((eq) => eq.stage)).size;
	const hasCompliance = treatmentEfficiency?.overallCompliance;

	return (
		<div className="space-y-8">
			{/* Hero Section - System at a Glance */}
			<div className="text-center space-y-6">
				<div>
					<h1 className="text-4xl font-bold mb-2">{proposal.title}</h1>
					<p className="text-xl text-muted-foreground">
						Design Flow:{" "}
						{technicalData?.designFlowM3Day || "N/A"} m³/day
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
						subtitle={`ROI: ${technicalData?.roiPercent ? `${formatNumber(technicalData.roiPercent)}%` : "N/A"}`}
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

			{/* Executive Summary - Data-driven */}

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

			{/* Executive Summary */}
			{proposal.executiveSummary && (
				<Card>
					<CardHeader>
						<CardTitle>Executive Summary</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Key highlights and recommendations
						</p>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{proposal.executiveSummary}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
