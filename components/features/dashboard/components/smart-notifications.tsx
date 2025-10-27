"use client";

import {
	ArrowRight,
	Bell,
	Brain,
	Calendar,
	CheckCircle,
	Clock,
	Target,
	TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProjectSummary } from "@/lib/project-types";
import { routes } from "@/lib/routes";
import { useProjects } from "@/lib/stores";
import { cn } from "@/lib/utils";

interface Notification {
	id: string;
	type: "action" | "alert" | "insight";
	priority: "high" | "medium" | "low";
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	project?: ProjectSummary;
	icon: React.ComponentType<{ className?: string }>;
	timestamp?: string;
}

export function SmartNotifications() {
	const projects = useProjects();
	const router = useRouter();

	const notifications = useMemo(() => {
		const alerts: Notification[] = [];

		// High-priority: Projects ready for proposals
		const readyForProposal = projects.filter(
			(p) => p.status === "In Preparation" && p.progress >= 70,
		);
		readyForProposal.forEach((project) => {
			alerts.push({
				id: `ready-${project.id}`,
				type: "action",
				priority: "high",
				title: "Proposal ready to generate",
				description: `${project.name} is ${project.progress}% complete`,
				action: {
					label: "Generate proposal",
					onClick: () => router.push(routes.project.proposals(project.id)),
				},
				project,
				icon: Brain,
			});
		});

		// Medium-priority: Stalled projects
		const stalledProjects = projects.filter((p) => {
			const daysSinceUpdate = Math.floor(
				(Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
			);
			return p.status === "In Preparation" && daysSinceUpdate > 7;
		});
		stalledProjects.forEach((project) => {
			const daysSinceUpdate = Math.floor(
				(Date.now() - new Date(project.updatedAt).getTime()) /
					(1000 * 60 * 60 * 24),
			);
			alerts.push({
				id: `stalled-${project.id}`,
				type: "alert",
				priority: "medium",
				title: "Project with no activity",
				description: `${project.name} has not been updated for ${daysSinceUpdate} days`,
				action: {
					label: "Continue capture",
					onClick: () => router.push(routes.project.technical(project.id)),
				},
				project,
				icon: Clock,
			});
		});

		// Low-priority: Incomplete projects needing attention
		const incompleteProjects = projects.filter(
			(p) => p.status === "In Preparation" && p.progress < 50,
		);
		if (incompleteProjects.length > 0) {
			alerts.push({
				id: "incomplete-batch",
				type: "insight",
				priority: "low",
				title: "Opportunity to complete projects",
				description: `${incompleteProjects.length} projects need more technical data`,
				action: {
					label: "View projects",
					onClick: () => router.push(routes.dashboard), // Could filter to incomplete
				},
				icon: Target,
			});
		}

		// Insights: Weekly productivity
		const thisWeekUpdates = projects.filter((p) => {
			const daysSinceUpdate = Math.floor(
				(Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
			);
			return daysSinceUpdate <= 7;
		}).length;

		if (thisWeekUpdates > 0) {
			alerts.push({
				id: "weekly-insight",
				type: "insight",
				priority: "low",
				title: "Weekly progress",
				description: `You updated ${thisWeekUpdates} projects this week`,
				icon: TrendingUp,
				timestamp: "This week",
			});
		}

		// Sort by priority and timestamp
		return alerts.sort((a, b) => {
			const priorityOrder = { high: 3, medium: 2, low: 1 };
			const aPriority = priorityOrder[a.priority];
			const bPriority = priorityOrder[b.priority];

			if (aPriority !== bPriority) {
				return bPriority - aPriority;
			}

			// If same priority, sort by type (actions first)
			const typeOrder = { action: 3, alert: 2, insight: 1 };
			return typeOrder[b.type] - typeOrder[a.type];
		});
	}, [projects, router]);

	const getNotificationStyles = (notification: Notification) => {
		const baseStyles = "transition-all duration-200 hover:shadow-md";

		switch (notification.type) {
			case "action":
				return cn(
					baseStyles,
					"bg-gradient-to-r from-green-50 to-green-100/50 border-green-200/60",
					"dark:from-green-950/20 dark:to-green-900/10 dark:border-green-800/30",
				);
			case "alert":
				return cn(
					baseStyles,
					"bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200/60",
					"dark:from-amber-950/20 dark:to-amber-900/10 dark:border-amber-800/30",
				);
			case "insight":
				return cn(
					baseStyles,
					"bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200/60",
					"dark:from-blue-950/20 dark:to-blue-900/10 dark:border-blue-800/30",
				);
		}
	};

	const getIconColor = (notification: Notification) => {
		switch (notification.type) {
			case "action":
				return "text-green-600 dark:text-green-400";
			case "alert":
				return "text-amber-600 dark:text-amber-400";
			case "insight":
				return "text-blue-600 dark:text-blue-400";
		}
	};

	const getPriorityBadge = (priority: Notification["priority"]) => {
		switch (priority) {
			case "high":
				return (
					<Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
						Urgent
					</Badge>
				);
			case "medium":
				return (
					<Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
						Important
					</Badge>
				);
			case "low":
				return (
					<Badge
						variant="secondary"
						className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
					>
						Info
					</Badge>
				);
		}
	};

	if (notifications.length === 0) {
		return (
			<Card className="aqua-panel">
				<CardContent className="p-6 text-center">
					<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
					<h3 className="font-medium text-foreground mb-1">All caught up</h3>
					<p className="text-sm text-muted-foreground">
						No pending actions. Great work!
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="aqua-panel">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5 text-primary" />
					Notification Center
					{notifications.filter((n) => n.priority === "high").length > 0 && (
						<Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
							{notifications.filter((n) => n.priority === "high").length} urgent
						</Badge>
					)}
				</CardTitle>
				<p className="text-sm text-muted-foreground">
					Recommended actions and alerts for your projects
				</p>
			</CardHeader>
			<CardContent className="space-y-3">
				{notifications.map((notification, index) => {
					const Icon = notification.icon;

					return (
						<div key={notification.id}>
							<Card className={getNotificationStyles(notification)}>
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<div className="mt-0.5">
											<Icon
												className={cn("h-5 w-5", getIconColor(notification))}
											/>
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="font-medium text-sm text-foreground">
													{notification.title}
												</h4>
												{getPriorityBadge(notification.priority)}
											</div>

											<p className="text-sm text-muted-foreground mb-2">
												{notification.description}
											</p>

											{notification.project && (
												<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
													<Calendar className="h-3 w-3" />
													<span>
														Updated{" "}
														{new Date(
															notification.project.updatedAt,
														).toLocaleDateString("en-US")}
													</span>
												</div>
											)}

											{notification.action && (
												<Button
													size="sm"
													variant={
														notification.priority === "high"
															? "default"
															: "outline"
													}
													onClick={notification.action.onClick}
													className="h-8 text-xs"
												>
													{notification.action.label}
													<ArrowRight className="h-3 w-3 ml-1" />
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

							{index < notifications.length - 1 && (
								<Separator className="my-3" />
							)}
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
