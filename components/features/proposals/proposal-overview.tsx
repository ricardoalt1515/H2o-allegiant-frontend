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
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Proposal } from "./types";

interface ProposalOverviewProps {
	proposal: Proposal;
}

export function ProposalOverview({ proposal }: ProposalOverviewProps) {
	const technicalData = proposal.aiMetadata?.technicalData;
	const problemAnalysis = proposal.aiMetadata?.problemAnalysis;

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold mb-2">Overview</h2>
				<p className="text-muted-foreground">
					Technical proposal for water treatment system
				</p>
			</div>

			{/* Problem → Solution Hero */}
			{problemAnalysis && (
				<Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-lg">
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

			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* CAPEX - Primary decision factor */}
				<Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] relative">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-lg bg-primary/10">
								<DollarSign className="h-4 w-4 text-primary" />
							</div>
							<CardTitle className="text-sm font-medium">
								Capital Investment
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(proposal.capex, {
								locale: "en-US",
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							})}
						</div>
						<p className="text-xs text-muted-foreground mt-2">Total CAPEX</p>
					</CardContent>
				</Card>

				{/* OPEX */}
				<Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-lg bg-chart-2/10">
								<TrendingUp className="h-4 w-4 text-[hsl(var(--chart-2))]" />
							</div>
							<CardTitle className="text-sm font-medium">
								Annual Operating Cost
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(proposal.opex, {
								locale: "en-US",
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							})}
						</div>
						<p className="text-xs text-muted-foreground mt-2">Annual OPEX</p>
					</CardContent>
				</Card>

				{/* Implementation Time */}
				{technicalData?.implementationMonths && (
					<Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
						<CardHeader className="pb-2">
							<div className="flex items-center gap-2">
								<div className="p-2 rounded-lg bg-chart-4/10">
									<Clock className="h-4 w-4 text-[hsl(var(--chart-4))]" />
								</div>
								<CardTitle className="text-sm font-medium">
									Implementation
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{technicalData.implementationMonths}
							</div>
							<p className="text-xs text-muted-foreground mt-2">months</p>
						</CardContent>
					</Card>
				)}

				{/* ROI */}
				{technicalData?.roiPercent && (
					<Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
						<CardHeader className="pb-2">
							<div className="flex items-center gap-2">
								<div className="p-2 rounded-lg bg-success/10">
									<TrendingUp className="h-4 w-4 text-success" />
								</div>
								<CardTitle className="text-sm font-medium">
									Return on Investment
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatNumber(technicalData.roiPercent)}%
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								{technicalData.paybackYears &&
									`Payback: ${technicalData.paybackYears} years`}
							</p>
						</CardContent>
					</Card>
				)}
			</div>

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
