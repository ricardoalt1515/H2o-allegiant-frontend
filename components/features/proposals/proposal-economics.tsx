"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import {
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { capexChartConfig, opexChartConfig } from "@/lib/chart-config";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Proposal } from "./types";

interface ProposalEconomicsProps {
	proposal: Proposal;
}

/**
 * Format CAPEX breakdown from backend data
 * Falls back to calculated values if backend data not available
 */
const formatCapexData = (
	capexBreakdown?: {
		equipmentCost: number;
		civilWorks: number;
		installationPiping: number;
		engineeringSupervision: number;
		contingency?: number;
	},
	equipment?: { capexUsd: number }[],
) => {
	// Use real backend data if available
	if (capexBreakdown) {
		return [
			{
				name: "equipment",
				label: "Equipment",
				value: capexBreakdown.equipmentCost,
			},
			{
				name: "civilWorks",
				label: "Civil Works",
				value: capexBreakdown.civilWorks,
			},
			{
				name: "installation",
				label: "Installation & Piping",
				value: capexBreakdown.installationPiping,
			},
			{
				name: "engineering",
				label: "Engineering",
				value: capexBreakdown.engineeringSupervision,
			},
			...(capexBreakdown.contingency
				? [
						{
							name: "contingency",
							label: "Contingency",
							value: capexBreakdown.contingency,
						},
					]
				: []),
		];
	}

	// Fallback: calculate from equipment if backend data not available
	const totalEquipment =
		equipment?.reduce((sum, eq) => sum + eq.capexUsd, 0) || 0;
	return [
		{ name: "equipment", label: "Equipment", value: totalEquipment },
		{ name: "civilWorks", label: "Civil Works", value: totalEquipment * 0.4 },
		{
			name: "installation",
			label: "Installation",
			value: totalEquipment * 0.2,
		},
		{
			name: "engineering",
			label: "Engineering",
			value: totalEquipment * 0.15,
		},
		{
			name: "contingency",
			label: "Contingency",
			value: totalEquipment * 0.15,
		},
	];
};

/**
 * Format OPEX breakdown from backend data
 * Returns null if no backend data available
 */
const formatOpexData = (opexBreakdown?: {
	electricalEnergy: number;
	chemicals: number;
	personnel: number;
	maintenanceSpareParts: number;
}) => {
	if (!opexBreakdown) return null;

	return [
		{
			name: "energy",
			label: "Electrical Energy",
			value: opexBreakdown.electricalEnergy,
		},
		{ name: "chemicals", label: "Chemicals", value: opexBreakdown.chemicals },
		{ name: "personnel", label: "Personnel", value: opexBreakdown.personnel },
		{
			name: "maintenance",
			label: "Maintenance",
			value: opexBreakdown.maintenanceSpareParts,
		},
	];
};

export function ProposalEconomics({ proposal }: ProposalEconomicsProps) {
	const technicalData = proposal.aiMetadata.proposal.technicalData;
	const equipment = technicalData.mainEquipment || [];
	const capexBreakdown = technicalData.capexBreakdown;
	const opexBreakdown = technicalData.opexBreakdown;

	// CAPEX Breakdown - use real backend data or fallback to calculated
	const capexData = formatCapexData(capexBreakdown, equipment);
	const totalCapex = capexData.reduce((sum, item) => sum + item.value, 0);

	// OPEX Breakdown - only show if backend provides data
	const opexData = formatOpexData(opexBreakdown);

	// OPEX Projection (5 years)
	const opexProjection = Array.from({ length: 5 }, (_, i) => ({
		year: `Year ${i + 1}`,
		opex: proposal.opex * (1 + i * 0.03), // 3% annual increase
	}));

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold mb-2">Economics</h2>
				<p className="text-muted-foreground">
					Investment and operational costs
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid md:grid-cols-3 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">Total CAPEX</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{formatCurrency(proposal.capex, {
								locale: "en-US",
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							})}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Capital investment
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm">Annual OPEX</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{formatCurrency(proposal.opex, {
								locale: "en-US",
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							})}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Operating costs per year
						</p>
					</CardContent>
				</Card>

				{technicalData?.paybackYears && (
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Payback Period</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">
								{formatNumber(technicalData.paybackYears)} years
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Return on investment
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* CAPEX & OPEX Breakdown */}
			<div className="grid md:grid-cols-2 gap-6">
				{/* CAPEX Chart */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PieChartIcon className="h-5 w-5 text-primary" />
							CAPEX Breakdown
						</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Distribution of capital expenditure
						</p>
					</CardHeader>
					<CardContent>
						<ChartContainer config={capexChartConfig} className="h-[300px]">
							<PieChart>
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatter={(value) =>
												formatCurrency(value as number, {
													locale: "en-US",
													minimumFractionDigits: 0,
													maximumFractionDigits: 0,
												})
											}
										/>
									}
								/>
								<Pie
									data={capexData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={90}
									strokeWidth={2}
									stroke="hsl(var(--background))"
								>
									{capexData.map((entry) => (
										<Cell
											key={entry.name}
											fill={`var(--color-${entry.name})`}
										/>
									))}
								</Pie>
								<ChartLegend content={<ChartLegendContent />} />
								{/* Center label with total */}
								<text
									x="50%"
									y="50%"
									textAnchor="middle"
									dominantBaseline="middle"
									className="fill-foreground"
								>
									<tspan x="50%" dy="-0.5em" className="text-2xl font-bold">
										{formatCurrency(totalCapex, {
											locale: "en-US",
											minimumFractionDigits: 0,
											maximumFractionDigits: 0,
										})}
									</tspan>
									<tspan
										x="50%"
										dy="1.5em"
										className="text-sm fill-muted-foreground"
									>
										Total CAPEX
									</tspan>
								</text>
							</PieChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* OPEX Breakdown or Projection */}
				{opexData ? (
					// Show OPEX breakdown if backend provides data
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<PieChartIcon className="h-5 w-5 text-chart-2" />
								OPEX Breakdown
							</CardTitle>
							<p className="text-sm text-muted-foreground mt-1">
								Annual operating cost distribution
							</p>
						</CardHeader>
						<CardContent>
							<ChartContainer config={opexChartConfig} className="h-[300px]">
								<PieChart>
									<ChartTooltip
										content={
											<ChartTooltipContent
												formatter={(value) =>
													formatCurrency(value as number, {
														locale: "en-US",
														minimumFractionDigits: 0,
														maximumFractionDigits: 0,
													})
												}
											/>
										}
									/>
									<Pie
										data={opexData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={90}
										strokeWidth={2}
										stroke="hsl(var(--background))"
									>
										{opexData.map((entry) => (
											<Cell
												key={entry.name}
												fill={`var(--color-${entry.name})`}
											/>
										))}
									</Pie>
									<ChartLegend content={<ChartLegendContent />} />
									{/* Center label with total */}
									<text
										x="50%"
										y="50%"
										textAnchor="middle"
										dominantBaseline="middle"
										className="fill-foreground"
									>
										<tspan x="50%" dy="-0.5em" className="text-2xl font-bold">
											{formatCurrency(proposal.opex, {
												locale: "en-US",
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
											})}
										</tspan>
										<tspan
											x="50%"
											dy="1.5em"
											className="text-sm fill-muted-foreground"
										>
											Annual OPEX
										</tspan>
									</text>
								</PieChart>
							</ChartContainer>
						</CardContent>
					</Card>
				) : (
					// Fallback: Show 5-year projection if no breakdown data
					<Card>
						<CardHeader>
							<CardTitle>OPEX Projection (5 years)</CardTitle>
							<p className="text-sm text-muted-foreground mt-1">
								Estimated annual costs with 3% inflation
							</p>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={opexProjection}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="year" />
									<YAxis />
									<Tooltip
										formatter={(value: number) =>
											formatCurrency(value, {
												locale: "en-US",
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
											})
										}
									/>
									<Line
										type="monotone"
										dataKey="opex"
										stroke="hsl(var(--primary))"
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Cost Details Table */}
			<Card>
				<CardHeader>
					<CardTitle>Cost Details</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{capexData.map((item) => (
							<div
								key={item.name}
								className="flex items-center justify-between py-2 border-b last:border-0"
							>
								<div className="flex items-center gap-3">
									<div
										className="w-4 h-4 rounded"
										style={{ backgroundColor: `var(--color-${item.name})` }}
									/>
									<span className="font-medium">{item.label}</span>
								</div>
								<span className="font-mono">
									{formatCurrency(item.value, {
										locale: "en-US",
										minimumFractionDigits: 0,
										maximumFractionDigits: 0,
									})}
								</span>
							</div>
						))}
						<div className="flex items-center justify-between py-2 pt-4 border-t-2 font-bold">
							<span>Total CAPEX</span>
							<span>
								{formatCurrency(proposal.capex, {
									locale: "en-US",
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								})}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
