"use client";

import { Library, Plus, Save, Settings } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Sector, Subsector } from "@/lib/sectors-config";
import { isFixedSection } from "@/lib/technical-sheet-data";
import type { TableField, TableSection } from "@/lib/types/technical-data";
import { cn } from "@/lib/utils";
import { ParameterLibrary } from "./parameter-library";
import { SectionAccordionItem } from "./section-accordion-item";

interface FlexibleDataCaptureProps {
	sections: TableSection[];
	onFieldChange: (
		sectionId: string,
		fieldId: string,
		value: any,
		unit?: string,
		notes?: string,
	) => void;
	projectId?: string | null;
	onAddSection?: (section: Omit<TableSection, "id">) => void;
	onRemoveSection?: (sectionId: string) => void;
	onAddField?: (sectionId: string, field: Omit<TableField, "id">) => void;
	onRemoveField?: (sectionId: string, fieldId: string) => void;
	onSave?: () => void;
	sector?: Sector;
	subsector?: Subsector;
	autoSave?: boolean;
	className?: string;
	showConfiguration?: boolean;
	focusSectionId?: string | null;
	onUpdateSectionNotes?: (sectionId: string, notes: string) => void;
}

interface AddSectionDialogProps {
	onAddSection: (section: Omit<TableSection, "id">) => void;
	trigger: React.ReactNode;
}

function AddSectionDialog({ onAddSection, trigger }: AddSectionDialogProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = () => {
		if (!title.trim()) return;

		const section: Omit<TableSection, "id"> = {
			title: title.trim(),
			fields: [],
			...(description.trim() && { description: description.trim() }),
		};

		onAddSection(section);

		// Reset form
		setTitle("");
		setDescription("");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Section</DialogTitle>
					<DialogDescription>
						Add a custom section to organize your technical data
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="section-title">Section Title *</Label>
						<Input
							id="section-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Process-Specific Parameters"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="section-description">Description (optional)</Label>
						<Textarea
							id="section-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Describe what type of information will be captured in this section"
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!title.trim()}>
						Create Section
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function FlexibleDataCapture({
	sections,
	onFieldChange,
	projectId,
	onAddSection,
	onRemoveSection,
	onAddField,
	onRemoveField,
	onSave,
	sector,
	subsector,
	autoSave = true,
	className,
	showConfiguration = true,
	focusSectionId,
}: FlexibleDataCaptureProps) {
	// State for custom sections accordion
	const [accordionValue, setAccordionValue] = useState<string[]>(() => {
		const incompleteSections = sections
			.filter((s) => !isFixedSection(s.id))
			.filter((s) => {
				const completed = s.fields.filter(
					(f) => f.value && f.value !== "",
				).length;
				const total = s.fields.length;
				return total > 0 && completed < total;
			})
			.slice(0, 3)
			.map((s) => s.id);

		return incompleteSections.length > 0 ? incompleteSections : [];
	});

	// State for fixed sections accordion
	const [fixedAccordionValue, setFixedAccordionValue] = useState<string[]>(
		() => {
			// ✅ OPTIMIZACIÓN: Solo expandir las primeras 2 secciones para mejorar rendimiento inicial
			// Expandir todas causa render masivo de cientos de campos
			return sections
				.filter((s) => isFixedSection(s.id))
				.slice(0, 2)
				.map((s) => s.id);
		},
	);

	// When a specific section is requested to be focused, ensure it is open and scrolled into view
	useEffect(() => {
		if (!focusSectionId) return;
		setAccordionValue((current) =>
			current.includes(focusSectionId) ? current : [...current, focusSectionId],
		);
		// Smooth scroll to the section container
		const el = document.getElementById(`section-${focusSectionId}`);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
			// Optional: brief highlight could be added here
		}
	}, [focusSectionId]);

	// ✅ OPTIMIZACIÓN: Metadata-driven routing (elimina hardcoding)
	const handleAddParametersFromLibrary = useCallback(
		(parameters: TableField[]) => {
			if (!onAddField) return;

			// Group parameters by their target section (from metadata)
			const parametersBySection: Record<string, TableField[]> = {};

			parameters.forEach((param) => {
				// ✅ Usa metadata explícita (targetSection)
				const targetSection = param.targetSection || "custom-section";

				if (!parametersBySection[targetSection]) {
					parametersBySection[targetSection] = [];
				}

				// Remover campos metadata-only antes de agregar
				const { targetSection: _, ...cleanParam } = param;
				parametersBySection[targetSection]?.push({
					...cleanParam,
					source: "manual", // Override source to manual when added from library
				});
			});

			// Add parameters to their respective sections
			Object.entries(parametersBySection).forEach(([sectionId, params]) => {
				params.forEach((param) => {
					onAddField(sectionId, param);
				});
			});
		},
		[onAddField],
	);

	// ✅ OPTIMIZACIÓN: Memoizar cálculos pesados
	const completedFields = useMemo(
		() =>
			sections.reduce((acc, section) => {
				return (
					acc +
					section.fields.filter((field) => field.value && field.value !== "")
						.length
				);
			}, 0),
		[sections],
	);

	const totalFields = useMemo(
		() => sections.reduce((acc, section) => acc + section.fields.length, 0),
		[sections],
	);

	const completionPercentage = useMemo(
		() =>
			totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0,
		[completedFields, totalFields],
	);

	return (
		<div className={cn("space-y-6", className)}>
			{/* Configuration Panel */}
			{showConfiguration && (
				<Card>
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Settings className="h-5 w-5" />
									Configuración de Datos
								</CardTitle>
								<CardDescription>
									Organiza y captura la información técnica de tu proyecto
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="text-xs">
									{completedFields} / {totalFields} campos
								</Badge>
								<Badge
									variant={completionPercentage >= 80 ? "default" : "secondary"}
									className="text-xs"
								>
									{completionPercentage}% completo
								</Badge>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="flex flex-wrap gap-2">
							{/* Add from Library */}
							<ParameterLibrary
								onAddParameters={handleAddParametersFromLibrary}
								{...(sector ? { sector } : {})}
								{...(subsector ? { subsector } : {})}
								trigger={
									<Button variant="outline" size="sm">
										<Library className="h-4 w-4 mr-2" />
										Parameter Library
									</Button>
								}
							/>

							{/* Add Custom Section */}
							{onAddSection && (
								<AddSectionDialog
									onAddSection={(section) => onAddSection(section)}
									trigger={
										<Button variant="outline" size="sm">
											<Plus className="h-4 w-4 mr-2" />
											New Section
										</Button>
									}
								/>
							)}

							{/* Manual Save */}
							{!autoSave && onSave && (
								<Button size="sm" onClick={onSave}>
									<Save className="h-4 w-4 mr-2" />
									Save Changes
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Sections */}
			{sections.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<div className="space-y-4">
							<div className="text-muted-foreground">
								No data sections configured
							</div>
							{onAddSection && (
								<ParameterLibrary
									onAddParameters={handleAddParametersFromLibrary}
									{...(sector ? { sector } : {})}
									{...(subsector ? { subsector } : {})}
									trigger={
										<Button>
											<Library className="h-4 w-4 mr-2" />
											Start with Parameter Library
										</Button>
									}
								/>
							)}
						</div>
					</CardContent>
				</Card>
			) : (
				<>
					{/* Accordion Controls */}
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							{accordionValue.length + fixedAccordionValue.length} of{" "}
							{sections.length} sections expanded
						</p>
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									// Expand all sections (both custom and fixed)
									const customSections = sections.filter(
										(s) => !isFixedSection(s.id),
									);
									const fixedSections = sections.filter((s) =>
										isFixedSection(s.id),
									);
									setAccordionValue(customSections.map((s) => s.id));
									setFixedAccordionValue(fixedSections.map((s) => s.id));
								}}
							>
								Expand All
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									// Collapse all sections
									setAccordionValue([]);
									setFixedAccordionValue([]);
								}}
								disabled={
									accordionValue.length === 0 &&
									fixedAccordionValue.length === 0
								}
							>
								Collapse All
							</Button>
						</div>
					</div>

					{/* Normal Sections - ✅ OPTIMIZACIÓN: Componente reutilizable */}
					<Accordion
						type="multiple"
						value={accordionValue}
						onValueChange={setAccordionValue}
						className="space-y-4"
					>
						{sections
							.filter((s) => !isFixedSection(s.id))
							.map((section) => (
								<SectionAccordionItem
									key={section.id}
									section={section}
									onFieldChange={onFieldChange}
									onAddField={onAddField}
									onRemoveField={onRemoveField}
									onRemoveSection={onRemoveSection}
								/>
							))}
					</Accordion>

					{/* Fixed Sections - ✅ OPTIMIZACIÓN: Mismo componente reutilizable */}
					{sections.filter((s) => isFixedSection(s.id)).length > 0 && (
						<div className="space-y-4 mt-8">
							<Separator />
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Badge variant="outline" className="text-xs">
									Permanent
								</Badge>
								<span>This section will always be available</span>
							</div>
							<Accordion
								type="multiple"
								value={fixedAccordionValue}
								onValueChange={setFixedAccordionValue}
								className="space-y-4"
							>
								{sections
									.filter((s) => isFixedSection(s.id))
									.map((section) => (
										<SectionAccordionItem
											key={section.id}
											section={section}
											isFixed={true}
											onFieldChange={onFieldChange}
											onAddField={onAddField}
											onRemoveField={onRemoveField}
										/>
									))}
							</Accordion>
						</div>
					)}
				</>
			)}
		</div>
	);
}
