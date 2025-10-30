"use client";

import { ArrowRight, Droplet, Filter, Gauge, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getCriticalityBadgeVariant } from "./proposal-utils";
import type { Proposal } from "./types";

interface ProposalTechnicalProps {
	proposal: Proposal;
}

export function ProposalTechnical({ proposal }: ProposalTechnicalProps) {
	const technicalData = proposal.aiMetadata.proposal.technicalData;
	const equipment = technicalData.mainEquipment || [];

	// Group equipment by stage for vertical flow
	const equipmentByStage = equipment.reduce(
		(acc, eq) => {
			if (!acc[eq.stage]) acc[eq.stage] = [];
			acc[eq.stage]?.push(eq);
			return acc;
		},
		{} as Record<string, typeof equipment>,
	);

	// Stage order for vertical flow
	const stageOrder = ["primary", "secondary", "tertiary", "auxiliary"] as const;
	const stages = stageOrder.filter(
		(stage) => (equipmentByStage[stage]?.length ?? 0) > 0,
	);

	// Stage colors - reusing design system
	const getStageColor = (stage: string) => {
		switch (stage) {
			case "primary":
				return "hsl(var(--chart-1))";
			case "secondary":
				return "hsl(var(--chart-2))";
			case "tertiary":
				return "hsl(var(--chart-3))";
			default:
				return "hsl(var(--chart-4))";
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold mb-2">Treatment Train</h2>
				<p className="text-muted-foreground">
					Process flow and equipment specifications
				</p>
			</div>

			{/* Vertical Treatment Flow */}
			<Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5 text-primary" />
						Process Flow Diagram
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Click any equipment for detailed specifications
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					{stages.map((stage, stageIndex) => {
						const stageEquipment = equipmentByStage[stage] || [];
						const stageColor = getStageColor(stage);

						return (
							<div key={stage} className="space-y-4">
								{/* Stage Header */}
								<div className="flex items-center gap-3">
									<div
										className="h-8 w-1 rounded-full"
										style={{ backgroundColor: stageColor }}
									/>
									<div>
										<Badge
											variant="outline"
											className="text-sm font-semibold mb-1"
											style={{ borderColor: stageColor, color: stageColor }}
										>
											{stage.toUpperCase()}
										</Badge>
										<p className="text-xs text-muted-foreground">
											{stageEquipment.length} equipment unit
											{stageEquipment.length > 1 ? "s" : ""}
										</p>
									</div>
								</div>

								{/* Equipment in this stage */}
								<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
									{stageEquipment.map((eq) => {
										const equipmentKey = `${eq.type}-${eq.stage}-${eq.capacityM3Day}`;

										return (
											<HoverCard key={equipmentKey}>
												<HoverCardTrigger asChild>
													<Card
														className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-primary"
														style={{
															borderLeftWidth: "3px",
															borderLeftColor: stageColor,
														}}
													>
														<CardContent className="p-4 space-y-2">
															<div className="flex items-start justify-between gap-2">
																<p className="font-semibold text-sm leading-tight">
																	{eq.type}
																</p>
																<Badge
																	variant={getCriticalityBadgeVariant(
																		eq.criticality,
																	)}
																	className="text-xs"
																>
																	{eq.criticality}
																</Badge>
															</div>

															<div className="grid grid-cols-2 gap-2 text-xs">
																<div className="flex items-center gap-1">
																	<Droplet className="h-3 w-3 text-muted-foreground" />
																	<span>
																		{formatNumber(eq.capacityM3Day)} m³/d
																	</span>
																</div>
																<div className="flex items-center gap-1">
																	<Zap className="h-3 w-3 text-muted-foreground" />
																	<span>
																		{formatNumber(eq.powerConsumptionKw)} kW
																	</span>
																</div>
															</div>

															<div className="text-xs font-semibold text-primary pt-1">
																{formatCurrency(eq.capexUsd, {
																	locale: "en-US",
																	minimumFractionDigits: 0,
																	maximumFractionDigits: 0,
																})}
															</div>
														</CardContent>
													</Card>
												</HoverCardTrigger>

												<HoverCardContent className="w-80" side="right">
													<div className="space-y-3">
														<div>
															<h4 className="font-semibold text-base mb-1">
																{eq.type}
															</h4>
															{eq.specifications && (
																<p className="text-sm text-muted-foreground">
																	{eq.specifications}
																</p>
															)}
														</div>

														<div className="grid grid-cols-2 gap-3 text-sm">
															<div className="flex items-center gap-2">
																<Droplet className="h-4 w-4 text-primary" />
																<div>
																	<p className="text-xs text-muted-foreground">
																		Capacity
																	</p>
																	<p className="font-medium">
																		{formatNumber(eq.capacityM3Day)} m³/d
																	</p>
																</div>
															</div>
															<div className="flex items-center gap-2">
																<Zap className="h-4 w-4 text-chart-4" />
																<div>
																	<p className="text-xs text-muted-foreground">
																		Power
																	</p>
																	<p className="font-medium">
																		{formatNumber(eq.powerConsumptionKw)} kW
																	</p>
																</div>
															</div>
															<div className="flex items-center gap-2">
																<Gauge className="h-4 w-4 text-muted-foreground" />
																<div>
																	<p className="text-xs text-muted-foreground">
																		Dimensions
																	</p>
																	<p className="font-medium text-xs">
																		{eq.dimensions}
																	</p>
																</div>
															</div>
															<div>
																<p className="text-xs text-muted-foreground">
																	CAPEX
																</p>
																<p className="font-semibold">
																	{formatCurrency(eq.capexUsd, {
																		locale: "en-US",
																		minimumFractionDigits: 0,
																		maximumFractionDigits: 0,
																	})}
																</p>
															</div>
														</div>

														{eq.justification && (
															<div className="pt-3 border-t">
																<p className="text-xs text-muted-foreground mb-1">
																	Justification:
																</p>
																<p className="text-xs leading-relaxed">
																	{eq.justification}
																</p>
															</div>
														)}
													</div>
												</HoverCardContent>
											</HoverCard>
										);
									})}
								</div>

								{/* Flow arrow to next stage */}
								{stageIndex < stages.length - 1 && (
									<div className="flex justify-center py-2">
										<ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
									</div>
								)}
							</div>
						);
					})}
				</CardContent>
			</Card>

			{/* Equipment Table */}
			<Card className="hover:shadow-md transition-shadow">
				<CardHeader>
					<CardTitle>Equipment List</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Equipment</TableHead>
								<TableHead>Stage</TableHead>
								<TableHead>Capacity</TableHead>
								<TableHead>Power</TableHead>
								<TableHead>Dimensions</TableHead>
								<TableHead className="text-right">CAPEX</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{equipment.map((eq) => {
								const equipmentKey = `${eq.type}-${eq.stage}-${eq.capacityM3Day}`;
								return (
									<TableRow key={equipmentKey}>
										<TableCell>
											<div>
												<p className="font-medium">{eq.type}</p>
												{eq.specifications && (
													<p className="text-xs text-muted-foreground">
														{eq.specifications}
													</p>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={getCriticalityBadgeVariant(eq.criticality)}
											>
												{eq.stage}
											</Badge>
										</TableCell>
										<TableCell>{formatNumber(eq.capacityM3Day)} m³/d</TableCell>
										<TableCell>
											{formatNumber(eq.powerConsumptionKw)} kW
										</TableCell>
										<TableCell className="text-sm">{eq.dimensions}</TableCell>
										<TableCell className="text-right font-medium">
											{formatCurrency(eq.capexUsd, {
												locale: "en-US",
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
											})}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>

					{/* Total Equipment Cost */}
					<div className="mt-4 pt-4 border-t flex justify-between items-center">
						<span className="font-semibold">Total Equipment Cost</span>
						<span className="text-xl font-bold">
							{formatCurrency(
								equipment.reduce((sum, eq) => sum + eq.capexUsd, 0),
								{
									locale: "en-US",
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								},
							)}
						</span>
					</div>
				</CardContent>
			</Card>

			{/* Equipment Justifications */}
			{equipment.some((eq) => eq.justification) && (
				<Card>
					<CardHeader>
						<CardTitle>Equipment Justification</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{equipment
								.filter((eq) => eq.justification)
								.map((eq) => {
									const equipmentKey = `${eq.type}-${eq.stage}-${eq.capacityM3Day}`;
									return (
										<div key={equipmentKey} className="space-y-1">
											<p className="font-medium text-sm">{eq.type}</p>
											<p className="text-sm text-muted-foreground">
												{eq.justification}
											</p>
										</div>
									);
								})}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
