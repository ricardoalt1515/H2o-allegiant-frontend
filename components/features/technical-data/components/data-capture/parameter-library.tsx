"use client";

import {
	Beaker,
	Bug,
	Droplet,
	Leaf,
	Plus,
	Scale,
	Search,
	Settings,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	filterOutExisting,
	getParametersForSection,
	type ParameterCategory,
	type ParameterDefinition,
	searchParameters,
} from "@/lib/parameters";
import type { Sector, Subsector } from "@/lib/sectors-config";
import type { TableField } from "@/lib/types/technical-data";

// Category configuration
const CATEGORY_CONFIG: Record<
	ParameterCategory,
	{ label: string; icon: any; color: string }
> = {
	design: { label: "Design", icon: Settings, color: "bg-blue-500" },
	physical: { label: "Physical", icon: Droplet, color: "bg-cyan-500" },
	"chemical-inorganic": {
		label: "Chemical Inorganic",
		icon: Beaker,
		color: "bg-purple-500",
	},
	"chemical-organic": {
		label: "Chemical Organic",
		icon: Leaf,
		color: "bg-green-500",
	},
	bacteriological: { label: "Bacteriological", icon: Bug, color: "bg-red-500" },
	operational: { label: "Operational", icon: Settings, color: "bg-orange-500" },
	regulatory: { label: "Regulatory", icon: Scale, color: "bg-yellow-500" },
};

interface ParameterLibraryProps {
	sectionId?: string;
	sector?: Sector;
	subsector?: Subsector;
	existingFieldIds?: string[];
	onAddParameters: (parameters: TableField[]) => void;
	trigger: React.ReactNode;
}

export function ParameterLibrary({
	sectionId,
	sector,
	subsector,
	existingFieldIds = [],
	onAddParameters,
	trigger,
}: ParameterLibraryProps) {
	const [open, setOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<ParameterCategory | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	// Get available parameters
	const availableParams = useMemo(() => {
		let params: ParameterDefinition[] = [];

		// Filter by section if provided
		if (sectionId) {
			params = getParametersForSection(sectionId, sector, subsector);
		} else {
			// Get all parameters from library
			params = searchParameters("");
		}

		// Filter out existing
		params = filterOutExisting(params, existingFieldIds);

		// Filter by category
		if (selectedCategory) {
			params = params.filter((p) => p.category === selectedCategory);
		}

		// Filter by search term
		if (searchTerm) {
			params = searchParameters(searchTerm).filter((p) =>
				params.some((ap) => ap.id === p.id),
			);
		}

		return params;
	}, [
		sectionId,
		sector,
		subsector,
		existingFieldIds,
		selectedCategory,
		searchTerm,
	]);

	// Handle add selected
	const handleAddSelected = () => {
		const paramsToAdd = Array.from(selectedIds).map((id) => {
			const param = availableParams.find((p) => p.id === id)!;

			// Create field with proper types
			const field: any = {
				id: crypto.randomUUID(),
				label: param.label,
				type: param.type,
				value: param.defaultValue ?? "",
				source: param.suggestedSource ?? "manual",
				importance: param.importance,
				// Include targetSection for automatic routing
				targetSection: param.targetSection,
			};

			// Add optional properties only if defined
			if (param.defaultUnit !== undefined) field.unit = param.defaultUnit;
			if (param.availableUnits !== undefined)
				field.units = param.availableUnits;
			if (param.required !== undefined) field.required = param.required;
			if (param.description !== undefined)
				field.description = param.description;
			if (param.validationRule !== undefined)
				field.validationRule = param.validationRule;
			if (param.validationMessage !== undefined)
				field.validationMessage = param.validationMessage;
			if (param.options !== undefined) field.options = param.options;
			if (param.multiline !== undefined) field.multiline = param.multiline;
			if (param.placeholder !== undefined)
				field.placeholder = param.placeholder;

			return field as TableField & { targetSection: string };
		});

		onAddParameters(paramsToAdd as TableField[]);
		setSelectedIds(new Set());
		setOpen(false);
	};

	// Toggle parameter selection
	const toggleParam = (id: string) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedIds(newSelected);
	};

	// Get unique categories from available params
	const availableCategories = useMemo(() => {
		const categories = new Set(availableParams.map((p) => p.category));
		return Array.from(categories);
	}, [availableParams]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh]">
				<DialogHeader>
					<DialogTitle>Parameter Library</DialogTitle>
					<DialogDescription>
						Select parameters to add to your project
						{sectionId && ` (${availableParams.length} available)`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Search and Actions */}
					<div className="flex gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search parameters..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Button
							onClick={handleAddSelected}
							disabled={selectedIds.size === 0}
						>
							<Plus className="h-4 w-4 mr-2" />
							Add ({selectedIds.size})
						</Button>
					</div>

					{/* Category Filters */}
					<div className="flex flex-wrap gap-2">
						{/* Always show "Back" button when a category is selected */}
						{selectedCategory && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedCategory(null)}
								className="gap-2"
							>
								<span>←</span>
								Back to All Categories
							</Button>
						)}

						{/* Show all category buttons only when no category is selected */}
						{!selectedCategory && availableCategories.length > 1 && (
							<>
								<Button
									variant="default"
									size="sm"
									onClick={() => setSelectedCategory(null)}
									className="gap-2"
								>
									All Categories
								</Button>
								{availableCategories.map((category) => {
									const config = CATEGORY_CONFIG[category];
									const Icon = config.icon;
									return (
										<Button
											key={category}
											variant="outline"
											size="sm"
											onClick={() => setSelectedCategory(category)}
											className="gap-2"
										>
											<Icon className="h-3 w-3" />
											{config.label}
										</Button>
									);
								})}
							</>
						)}
					</div>

					{/* Parameters List */}
					<ScrollArea className="h-96">
						<div className="space-y-2">
							{availableParams.map((param) => {
								const isSelected = selectedIds.has(param.id);
								const categoryConfig = CATEGORY_CONFIG[param.category];
								const Icon = categoryConfig.icon;

								return (
									<button
										key={param.id}
										type="button"
										className={`p-3 border rounded-lg transition-colors text-left w-full ${
											isSelected
												? "bg-muted border-primary"
												: "hover:bg-muted/50"
										}`}
										onClick={() => toggleParam(param.id)}
									>
										<div className="flex items-start justify-between gap-3">
											<div className="flex-1 space-y-1">
												<div className="flex items-center gap-2">
													<h4 className="font-medium">{param.label}</h4>
													{param.required && (
														<Badge variant="destructive" className="text-xs">
															Required
														</Badge>
													)}
													<Badge variant="outline" className="text-xs gap-1">
														<Icon className="h-3 w-3" />
														{categoryConfig.label}
													</Badge>
												</div>
												{param.description && (
													<p className="text-sm text-muted-foreground">
														{param.description}
													</p>
												)}
												<div className="flex items-center gap-2 flex-wrap">
													{param.tags.map((tag) => (
														<Badge
															key={tag}
															variant="secondary"
															className="text-xs"
														>
															{tag}
														</Badge>
													))}
													{param.availableUnits && (
														<Badge variant="outline" className="text-xs">
															{param.availableUnits.join(", ")}
														</Badge>
													)}
												</div>
											</div>
											<div className="pt-1">
												<div
													className={`w-4 h-4 rounded border-2 transition-colors ${
														isSelected
															? "bg-primary border-primary"
															: "border-muted-foreground"
													}`}
												>
													{isSelected && (
														<svg
															className="w-3 h-3 text-primary-foreground"
															fill="currentColor"
															viewBox="0 0 20 20"
															aria-label="Selected"
														>
															<title>Selected</title>
															<path
																fillRule="evenodd"
																d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																clipRule="evenodd"
															/>
														</svg>
													)}
												</div>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</ScrollArea>

					{/* Empty state */}
					{availableParams.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							{searchTerm || selectedCategory
								? "No parameters found matching the filters"
								: "No parameters available"}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
