"use client";

import {
	ArrowLeft,
	ArrowRight,
	Building2,
	Check,
	ChevronRight,
	Droplets,
	Factory,
	Home,
	MapPin,
	Sparkles,
	Store,
	Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ProjectSector } from "@/lib/project-types";
import { routes } from "@/lib/routes";
import { sectorsConfig } from "@/lib/sectors-config";
import { useProjectActions } from "@/lib/stores";
import { cn } from "@/lib/utils";

interface PremiumProjectWizardProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onProjectCreated?: (projectId: string) => void;
}

interface ProjectData {
	name: string;
	client: string;
	sector: string;
	subsector: string;
	location: string;
	description: string;
}

interface Sector {
	id: string;
	name: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	subsectors: string[];
	examples: string[];
}

// Icon mapping for sectors
const SECTOR_ICONS = {
	municipal: Building2,
	commercial: Store,
	industrial: Factory,
	residential: Home,
	other: Target,
};

// Map sectorsConfig to wizard format
const SECTORS: Sector[] = sectorsConfig.map((sector) => ({
	id: sector.id,
	name: sector.label,
	description: sector.description || "",
	icon: SECTOR_ICONS[sector.id] || Target,
	color:
		sector.id === "municipal"
			? "blue"
			: sector.id === "commercial"
				? "purple"
				: sector.id === "industrial"
					? "gray"
					: sector.id === "residential"
						? "green"
						: "gray",
	subsectors: sector.subsectors.map((sub) => sub.id), // Use ID instead of label
	examples: [],
}));

// Helper to get subsector label from ID
const getSubsectorLabel = (sectorId: string, subsectorId: string): string => {
	const sector = sectorsConfig.find((s) => s.id === sectorId);
	const subsector = sector?.subsectors.find((sub) => sub.id === subsectorId);
	return subsector?.label || subsectorId;
};

const STEPS = [
	{ id: 1, title: "Basic Information", description: "Name and client" },
	{ id: 2, title: "Sector and Focus", description: "Project type" },
	{ id: 3, title: "Location", description: "Geographic location" },
	{ id: 4, title: "Confirmation", description: "Final review" },
];

export function PremiumProjectWizard({
	open,
	onOpenChange,
	onProjectCreated,
}: PremiumProjectWizardProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [projectData, setProjectData] = useState<ProjectData>({
		name: "",
		client: "",
		sector: "",
		subsector: "",
		location: "",
		description: "",
	});
	const [isCreating, setIsCreating] = useState(false);
	const { createProject } = useProjectActions();
	const router = useRouter();

	const progress = (currentStep / STEPS.length) * 100;
	const selectedSector = SECTORS.find((s) => s.id === projectData.sector);

	const canContinue = useMemo(() => {
		switch (currentStep) {
			case 1:
				return (
					projectData.name.trim() !== "" && projectData.client.trim() !== ""
				);
			case 2:
				return projectData.sector !== "" && projectData.subsector !== "";
			case 3:
				return projectData.location.trim() !== "";
			case 4:
				return true;
			default:
				return false;
		}
	}, [currentStep, projectData]);

	const updateProjectData = useCallback((updates: Partial<ProjectData>) => {
		setProjectData((prev) => ({ ...prev, ...updates }));
	}, []);

	const nextStep = useCallback(() => {
		if (canContinue && currentStep < STEPS.length) {
			setCurrentStep((prev) => prev + 1);
		}
	}, [canContinue, currentStep]);

	const prevStep = useCallback(() => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
		}
	}, [currentStep]);

	const handleCreateProject = useCallback(async () => {
		if (!canContinue) return;

		setIsCreating(true);
		try {
			const newProject = await createProject({
				name: projectData.name,
				client: projectData.client,
				sector: projectData.sector as ProjectSector,
				subsector: projectData.subsector,
				location: projectData.location,
				description:
					projectData.description ||
					`Proyecto ${projectData.sector.toLowerCase()} para ${projectData.client}`,
				tags: [projectData.sector, projectData.subsector].filter(Boolean),
			});

			// ✅ DISABLED: Auto-template application (users can apply templates manually)
			// Templates are now applied manually from the UI, not automatically
			// This ensures users get the standard createInitialTechnicalSheetData() template
			//
			// To re-enable automatic templates, uncomment the code below:
			/*
      try {
        const { getTemplateForProject } = await import('@/lib/templates/technical-templates')
        const { projectDataAPI } = await import('@/lib/api/project-data')
        
        const template = getTemplateForProject(projectData.sector, projectData.subsector)
        if (template) {
          await projectDataAPI.updateData(newProject.id, {
            technical_sections: template.sections
          })
        }
      } catch (templateError) {
        // Template application failed - will use fallback on load
      }
      */

			toast.success("Project created successfully!", {
				description: `${projectData.name} is ready to configure`,
			});

			onProjectCreated?.(newProject.id);
			onOpenChange(false);

			// Navigate to the new project with quickstart
			router.push(
				routes.project.technical(newProject.id, { quickstart: true }),
			);

			// Reset form
			setCurrentStep(1);
			setProjectData({
				name: "",
				client: "",
				sector: "",
				subsector: "",
				location: "",
				description: "",
			});
		} catch (_error) {
			toast.error("Error creating project", {
				description: "Please try again",
			});
		} finally {
			setIsCreating(false);
		}
	}, [
		canContinue,
		projectData,
		createProject,
		onProjectCreated,
		onOpenChange,
		router,
	]);

	const getSectorColors = (color: string) => {
		const colorMap = {
			blue: {
				bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
				border: "border-blue-200 dark:border-blue-800/30",
				text: "text-blue-900 dark:text-blue-100",
				accent: "text-blue-600 dark:text-blue-400",
			},
			gray: {
				bg: "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/20 dark:to-gray-900/10",
				border: "border-gray-200 dark:border-gray-800/30",
				text: "text-gray-900 dark:text-gray-100",
				accent: "text-gray-600 dark:text-gray-400",
			},
			green: {
				bg: "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
				border: "border-green-200 dark:border-green-800/30",
				text: "text-green-900 dark:text-green-100",
				accent: "text-green-600 dark:text-green-400",
			},
			purple: {
				bg: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
				border: "border-purple-200 dark:border-purple-800/30",
				text: "text-purple-900 dark:text-purple-100",
				accent: "text-purple-600 dark:text-purple-400",
			},
		};
		return colorMap[color as keyof typeof colorMap] || colorMap.blue;
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4">
								<Target className="h-8 w-8 text-primary-foreground" />
							</div>
							<h3 className="text-2xl font-semibold text-foreground">
								Basic Information
							</h3>
							<p className="text-muted-foreground">
								Let&apos;s start with the fundamental project data
							</p>
						</div>

						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name" className="text-sm font-medium">
									Project Name *
								</Label>
								<Input
									id="name"
									placeholder="e.g. Los Alamos Treatment Plant"
									value={projectData.name}
									onChange={(e) => updateProjectData({ name: e.target.value })}
									className="h-12 text-base"
									autoFocus
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="client" className="text-sm font-medium">
									Client *
								</Label>
								<Input
									id="client"
									placeholder="e.g. City of Guadalajara"
									value={projectData.client}
									onChange={(e) =>
										updateProjectData({ client: e.target.value })
									}
									className="h-12 text-base"
								/>
							</div>
						</div>
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						{/* Header */}
						<div className="text-center space-y-2">
							<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4">
								<Building2 className="h-8 w-8 text-primary-foreground" />
							</div>
							<h3 className="text-2xl font-semibold text-foreground">
								Sector and Focus
							</h3>
							<p className="text-muted-foreground">
								Select the project type to get specific recommendations
							</p>
						</div>

						{/* Split View Layout */}
						<div className="grid md:grid-cols-12 gap-6">
							{/* Left Panel - Sectors */}
							<div className="md:col-span-5 space-y-3">
								<Label className="text-sm font-medium">Project Sector *</Label>
								<RadioGroup
									value={projectData.sector}
									onValueChange={(value) =>
										updateProjectData({
											sector: value,
											subsector: "", // Reset subsector when changing sector
										})
									}
									className="gap-2"
								>
									{SECTORS.map((sector) => {
										const Icon = sector.icon;
										const colors = getSectorColors(sector.color);
										const isSelected = projectData.sector === sector.id;

										return (
											<div
												key={sector.id}
												className={cn(
													"relative rounded-lg border-2 transition-all duration-200",
													"hover:shadow-md cursor-pointer",
													isSelected
														? "border-primary bg-primary/5 shadow-md"
														: "border-border hover:border-primary/30",
												)}
											>
												<Label
													htmlFor={`sector-${sector.id}`}
													className="flex items-center gap-3 p-4 cursor-pointer"
												>
													<RadioGroupItem
														value={sector.id}
														id={`sector-${sector.id}`}
														className="shrink-0"
													/>
													<div
														className={cn(
															"h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
															colors.bg,
														)}
													>
														<Icon className={cn("h-5 w-5", colors.accent)} />
													</div>
													<div className="flex-1 min-w-0">
														<div className="font-medium text-sm text-foreground">
															{sector.name}
														</div>
														<div className="text-xs text-muted-foreground line-clamp-1">
															{sector.description}
														</div>
													</div>
												</Label>
											</div>
										);
									})}
								</RadioGroup>
							</div>

							{/* Right Panel - Subsectors */}
							<div className="md:col-span-7 space-y-3">
								<Label className="text-sm font-medium">
									Specific Subsector *
								</Label>
								{selectedSector ? (
									<>
										<ScrollArea className="h-[320px] rounded-lg border border-border">
											<div className="p-3">
												<RadioGroup
													value={projectData.subsector}
													onValueChange={(value) =>
														updateProjectData({ subsector: value })
													}
													className="gap-1"
												>
													{selectedSector.subsectors.map((subsectorId) => {
														const subsectorLabel = getSubsectorLabel(
															projectData.sector,
															subsectorId,
														);
														const isSelected =
															projectData.subsector === subsectorId;

														return (
															<div
																key={subsectorId}
																className={cn(
																	"flex items-center space-x-3 rounded-md px-3 py-3",
																	"hover:bg-accent/50 transition-colors cursor-pointer",
																	isSelected && "bg-accent",
																)}
															>
																<RadioGroupItem
																	value={subsectorId}
																	id={`subsector-${subsectorId}`}
																	className="shrink-0"
																/>
																<Label
																	htmlFor={`subsector-${subsectorId}`}
																	className="flex-1 cursor-pointer text-sm font-medium leading-none"
																>
																	{subsectorLabel}
																</Label>
															</div>
														);
													})}
												</RadioGroup>
											</div>
										</ScrollArea>
										<div className="rounded-lg bg-muted/50 p-3 border border-border">
											<div className="flex items-start gap-2">
												<Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
												<div className="text-xs text-muted-foreground">
													<span className="font-medium text-foreground">
														Tip:
													</span>{" "}
													Select the most specific subsector that matches your
													project for better recommendations
												</div>
											</div>
										</div>
									</>
								) : (
									<div className="h-[320px] rounded-lg border-2 border-dashed border-border flex items-center justify-center">
										<div className="text-center space-y-2 p-6">
											<Target className="h-12 w-12 text-muted-foreground/50 mx-auto" />
											<p className="text-sm text-muted-foreground">
												Select a sector to view subsectors
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				);

			case 3:
				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4">
								<MapPin className="h-8 w-8 text-primary-foreground" />
							</div>
							<h3 className="text-2xl font-semibold text-foreground">
								Project Location
							</h3>
							<p className="text-muted-foreground">
								Define where the project will be developed for technical
								considerations
							</p>
						</div>

						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="location" className="text-sm font-medium">
									Geographic Location *
								</Label>
								<LocationAutocomplete
									value={projectData.location}
									onChange={(value) => updateProjectData({ location: value })}
									placeholder="Search cities, states, or countries..."
									autoFocus
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description" className="text-sm font-medium">
									Additional Description (optional)
								</Label>
								<Input
									id="description"
									placeholder="Additional project context..."
									value={projectData.description}
									onChange={(e) =>
										updateProjectData({ description: e.target.value })
									}
									className="h-12 text-base"
								/>
							</div>

							{selectedSector && (
								<div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
									<h4 className="font-medium text-sm text-foreground mb-2">
										💡 Popular locations for {selectedSector.name}
									</h4>
									<div className="flex flex-wrap gap-2">
										{selectedSector.examples.map((example) => (
											<Badge
												key={example}
												variant="secondary"
												className="cursor-pointer hover:bg-primary/10 transition-colors"
												onClick={() =>
													updateProjectData({ location: `${example}, México` })
												}
											>
												<MapPin className="h-3 w-3 mr-1" />
												{example}
											</Badge>
										))}
									</div>
									<p className="text-xs text-muted-foreground mt-2">
										Click any example to select it
									</p>
								</div>
							)}
						</div>
					</div>
				);

			case 4:
				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4">
								<Check className="h-8 w-8 text-white" />
							</div>
							<h3 className="text-2xl font-semibold text-foreground">
								Ready to Create!
							</h3>
							<p className="text-muted-foreground">
								Review the information and confirm project creation
							</p>
						</div>

						<Card className="aqua-panel">
							<CardContent className="p-6 space-y-4">
								<div className="flex items-center gap-3">
									<div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
										<Droplets className="h-6 w-6 text-primary" />
									</div>
									<div>
										<h4 className="font-semibold text-lg text-foreground">
											{projectData.name}
										</h4>
										<p className="text-muted-foreground">
											{projectData.client}
										</p>
									</div>
								</div>

								<Separator />

								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-muted-foreground">Sector:</span>
										<p className="font-medium text-foreground">
											{selectedSector?.name}
										</p>
									</div>
									<div>
										<span className="text-muted-foreground">Subsector:</span>
										<p className="font-medium text-foreground">
											{getSubsectorLabel(
												projectData.sector,
												projectData.subsector,
											)}
										</p>
									</div>
									<div className="col-span-2">
										<span className="text-muted-foreground">Location:</span>
										<p className="font-medium text-foreground">
											{projectData.location}
										</p>
									</div>
									{projectData.description && (
										<div className="col-span-2">
											<span className="text-muted-foreground">
												Description:
											</span>
											<p className="font-medium text-foreground">
												{projectData.description}
											</p>
										</div>
									)}
								</div>

								<div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30">
									<div className="flex items-center gap-2 text-green-700 dark:text-green-400">
										<Sparkles className="h-4 w-4" />
										<span className="font-medium text-sm">Next Step</span>
									</div>
									<p className="text-xs text-green-600 dark:text-green-400 mt-1">
										We&apos;ll take you to the technical sheet to start data
										capture
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl h-auto max-h-[95vh] p-0 flex flex-col">
				{/* Header with Progress - Fixed at top */}
				<DialogHeader className="p-6 pb-4 shrink-0 border-b border-border/50">
					<div className="space-y-4">
						<DialogTitle className="text-2xl font-bold text-center">
							Create New Project
						</DialogTitle>

						{/* Progress Bar */}
						<div className="space-y-2">
							<div className="flex justify-between text-xs">
								<span className="font-medium text-foreground">
									{STEPS[currentStep - 1]?.title || "Loading..."}
								</span>
								<span className="text-muted-foreground">
									Step {currentStep} of {STEPS.length}
								</span>
							</div>
							<Progress value={progress} className="h-2" />
							<p className="text-xs text-muted-foreground text-center">
								{STEPS[currentStep - 1]?.description || ""}
							</p>
						</div>

						{/* Steps Indicator */}
						<div className="flex justify-center">
							<div className="flex items-center gap-2">
								{STEPS.map((step, index) => (
									<div key={step.id} className="flex items-center">
										<div
											className={cn(
												"w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
												currentStep > step.id
													? "bg-primary text-primary-foreground"
													: currentStep === step.id
														? "bg-primary text-primary-foreground"
														: "bg-muted text-muted-foreground",
											)}
										>
											{currentStep > step.id ? (
												<Check className="h-4 w-4" />
											) : (
												step.id
											)}
										</div>
										{index < STEPS.length - 1 && (
											<ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</DialogHeader>

				{/* Content - Scrollable area */}
				<ScrollArea className="flex-1 overflow-y-auto px-6 py-6">
					<div className="min-h-[400px]">{renderStepContent()}</div>
				</ScrollArea>

				{/* Footer - Fixed at bottom */}
				<div className="shrink-0 p-6 pt-4 border-t border-border bg-background/95 backdrop-blur-sm">
					<div className="flex justify-between gap-4">
						<Button
							variant="outline"
							onClick={prevStep}
							disabled={currentStep === 1}
							className="flex items-center gap-2 min-w-[100px]"
							size="lg"
						>
							<ArrowLeft className="h-4 w-4" />
							Back
						</Button>

						{currentStep < STEPS.length ? (
							<Button
								onClick={nextStep}
								disabled={!canContinue}
								className="flex items-center gap-2 min-w-[120px]"
								size="lg"
							>
								Continue
								<ArrowRight className="h-4 w-4" />
							</Button>
						) : (
							<Button
								onClick={handleCreateProject}
								disabled={!canContinue || isCreating}
								className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 min-w-[140px]"
								size="lg"
							>
								{isCreating ? (
									<>Creating...</>
								) : (
									<>
										<Sparkles className="h-4 w-4" />
										Create Project
									</>
								)}
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
