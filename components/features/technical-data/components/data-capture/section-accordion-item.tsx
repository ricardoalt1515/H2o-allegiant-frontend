"use client";

import { memo } from "react";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { TableField, TableSection } from "@/lib/types/technical-data";
import { cn } from "@/lib/utils";
import { DynamicSection } from "./dynamic-section";

interface SectionAccordionItemProps {
	section: TableSection;
	isFixed?: boolean | undefined;
	onFieldChange: (
		sectionId: string,
		fieldId: string,
		value: any,
		unit?: string,
		notes?: string,
	) => void;
	onAddField?:
		| ((sectionId: string, field: Omit<TableField, "id">) => void)
		| undefined;
	onRemoveField?: ((sectionId: string, fieldId: string) => void) | undefined;
	onRemoveSection?: ((sectionId: string) => void) | undefined;
}

/**
 * ✅ OPTIMIZACIÓN: Componente reutilizable para items de accordion
 * - Elimina ~100 líneas de código duplicado
 * - React.memo previene re-renders innecesarios
 * - Se re-renderiza solo cuando section o props cambian
 */
export const SectionAccordionItem = memo(function SectionAccordionItem({
	section,
	isFixed = false,
	onFieldChange,
	onAddField,
	onRemoveField,
	onRemoveSection,
}: SectionAccordionItemProps) {
	const completedFields = section.fields.filter(
		(f) => f.value && f.value !== "",
	).length;
	const totalFields = section.fields.length;
	const isEmpty = totalFields === 0;

	return (
		<AccordionItem
			key={section.id}
			value={section.id}
			className={cn("border rounded-lg px-0", isFixed && "bg-muted/20")}
			id={`section-${section.id}`}
		>
			<AccordionTrigger className="px-6 py-4 hover:no-underline">
				<div className="flex items-center justify-between w-full mr-4">
					<div className="text-left">
						<h3 className="font-serif font-semibold">{section.title}</h3>
						{section.description && (
							<p className="text-sm text-muted-foreground mt-1">
								{section.description}
							</p>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="text-xs">
							{completedFields} / {totalFields}
						</Badge>
						{isEmpty && (
							<Badge variant="outline" className="text-xs">
								Vacía
							</Badge>
						)}
						{isFixed && (
							<Badge variant="outline" className="text-xs">
								Permanent
							</Badge>
						)}
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="px-0 pb-0">
				<div className="border-t px-6 py-4">
					<DynamicSection
						section={section}
						onFieldChange={onFieldChange}
						onAddField={onAddField ?? ((_, __) => {})}
						onRemoveField={onRemoveField ?? ((_, __) => {})}
						{...(onRemoveSection && !isFixed ? { onRemoveSection } : {})}
						isCollapsible={false}
						showAddField={!!onAddField}
						showRemoveSection={!!onRemoveSection && !isFixed}
					/>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
});
