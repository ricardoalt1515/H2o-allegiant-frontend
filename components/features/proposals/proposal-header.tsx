"use client";

import { Download, FileText, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Project, Proposal } from "./types";

interface ProposalHeaderProps {
	proposal: Proposal;
	project: Project;
	activeSection: string;
	onSectionChange: (section: string) => void;
	onStatusChange?: (newStatus: string) => void;
	onDownloadPDF?: () => void;
}

const sections = [
	{ id: "overview", label: "Overview" },
	{ id: "technical", label: "Technical" },
	{ id: "water-quality", label: "Water Quality" },
	{ id: "economics", label: "Economics" },
	{ id: "assumptions", label: "Assumptions" },
	{ id: "ai-analysis", label: "AI Analysis" },
];

function getConfidenceBadgeVariant(
	confidence: string,
): "default" | "secondary" | "destructive" {
	switch (confidence) {
		case "High":
			return "default";
		case "Medium":
			return "secondary";
		case "Low":
			return "destructive";
		default:
			return "secondary";
	}
}

export function ProposalHeader({
	proposal,
	project,
	activeSection,
	onSectionChange,
	onStatusChange,
	onDownloadPDF,
}: ProposalHeaderProps) {
	const confidence = proposal.aiMetadata?.confidenceLevel || "Medium";

	return (
		<div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				{/* Title Row */}
				<div className="flex items-center justify-between py-4">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3">
							<FileText className="h-5 w-5 text-primary flex-shrink-0" />
							<h1 className="text-2xl font-bold truncate">{proposal.title}</h1>
							<Badge variant="outline" className="flex-shrink-0">
								v{proposal.version}
							</Badge>
							{proposal.aiMetadata && (
								<Badge
									variant={getConfidenceBadgeVariant(confidence)}
									className="flex-shrink-0"
								>
									AI: {confidence}
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							{project.name} • {proposal.type}
						</p>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						<Button onClick={onDownloadPDF} variant="outline" size="sm">
							<Download className="mr-2 h-4 w-4" />
							PDF
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => onStatusChange?.("draft")}>
									Mark as Draft
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => onStatusChange?.("approved")}>
									Approve
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => onStatusChange?.("rejected")}>
									Reject
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
					{sections.map((section) => {
						const isActive = activeSection === section.id;

						return (
							<button
								key={section.id}
								type="button"
								onClick={() => {
									onSectionChange(section.id);
									document
										.getElementById(section.id)
										?.scrollIntoView({ behavior: "smooth" });
								}}
								className={cn(
									"px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
									isActive
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:text-foreground hover:bg-muted",
								)}
							>
								{section.label}
							</button>
						);
					})}
				</nav>
			</div>
		</div>
	);
}
