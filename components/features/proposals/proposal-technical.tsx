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
	const equipment = proposal.equipmentList || [];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold mb-2">Technical Specifications</h2>
				<p className="text-muted-foreground">Equipment and treatment train</p>
			</div>

			{/* Treatment Train Diagram - Interactive */}
			<Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5 text-primary" />
						Treatment Train
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Hover over each equipment for details
					</p>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap items-center gap-3 md:gap-4">
						{equipment.map((eq) => {
							const equipmentKey = `${eq.type}-${eq.stage}-${eq.capacityM3Day}`;
							// Color por etapa usando variables CSS
							const stageColor =
								eq.stage === "primary"
									? "var(--treatment-primary)"
									: eq.stage === "secondary"
										? "var(--treatment-secondary)"
										: eq.stage === "tertiary"
											? "var(--treatment-tertiary)"
											: "var(--treatment-auxiliary)";

							return (
								<div
									key={equipmentKey}
									className="flex items-center gap-3 md:gap-4"
								>
									<HoverCard>
										<HoverCardTrigger asChild>
											<div className="cursor-pointer group">
												<div
													className="text-center p-4 rounded-lg border-2 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:border-primary"
													style={{
														borderColor: stageColor,
														background: `linear-gradient(135deg, ${stageColor}15, transparent)`,
													}}
												>
													<Badge
														variant={getCriticalityBadgeVariant(eq.criticality)}
														className="mb-2"
														style={{ backgroundColor: stageColor }}
													>
														{eq.stage}
													</Badge>
													<p className="font-semibold text-sm mt-1">
														{eq.type}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														{formatNumber(eq.capacityM3Day)} m³/d
													</p>
												</div>
											</div>
										</HoverCardTrigger>
										<HoverCardContent className="w-80" side="top">
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

									{equipment.indexOf(eq) < equipment.length - 1 && (
										<ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
									)}
								</div>
							);
						})}
					</div>
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
