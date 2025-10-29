import { getParameterById } from "@/lib/parameters";
import type {
	DataSource,
	TableField,
	TableSection,
} from "@/lib/types/technical-data";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS - Avoid magic numbers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Conversion factors (avoid magic numbers)
const HOURS_TO_M3_DAY = 3.6; // L/s * hours → m³/day
const LS_TO_L_DAY = 86.4; // L/s → L/day
const PEAK_FACTOR = 1.8; // Standard peak flow multiplier

// Re-export from parameter library
export { isFixedSection } from "@/lib/parameters";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIELD REHYDRATION - Restore metadata and functions from library
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { logger } from "@/lib/utils/logger";

/**
 * Rehydrate field with library metadata (DRY: separates concerns)
 */
function rehydrateSingleField(field: TableField): TableField {
	const param = getParameterById(field.id);

	// Missing param = custom field, keep as-is
	if (!param) {
		logger.warn(
			`Field "${field.id}" not in parameter library`,
			"TechnicalSheet",
		);
		return field;
	}

	// Build rehydrated field: library metadata + user values
	const rehydrated: TableField = {
		// Core from library
		id: field.id,
		label: param.label,
		type: param.type,
		// User data preserved
		value: field.value,
		source: field.source,
		importance: param.importance ?? field.importance,
		// Functions restored (lost in JSON)
		validationRule: param.validationRule,
		validationMessage: param.validationMessage,
		// Metadata restored
		options: param.options,
		required: param.required,
		description: param.description,
		multiline: param.multiline,
		placeholder: param.placeholder,
	} as TableField;

	// Apply unit configuration
	if (field.unit) rehydrated.unit = field.unit;
	else if (param.defaultUnit) rehydrated.unit = param.defaultUnit;
	if (param.availableUnits) rehydrated.units = param.availableUnits;

	// Preserve user metadata
	if (field.notes) rehydrated.notes = field.notes;
	if (field.lastUpdatedAt) rehydrated.lastUpdatedAt = field.lastUpdatedAt;
	if (field.lastUpdatedBy) rehydrated.lastUpdatedBy = field.lastUpdatedBy;
	if (field.suggestedValue !== undefined)
		rehydrated.suggestedValue = field.suggestedValue;
	if (field.conditional) rehydrated.conditional = field.conditional;

	return rehydrated;
}

/**
 * Rehydrate sections with metadata from parameter library
 */
export const rehydrateFieldsFromLibrary = (
	sections: TableSection[],
): TableSection[] => {
	return sections.map((section) => ({
		...section,
		fields: section.fields.map(rehydrateSingleField),
	}));
};

// ========================================
// HELPER FUNCTIONS
// ========================================

export const getFieldValue = (
	sections: TableSection[],
	sectionId: string,
	fieldId: string,
) => {
	const section = sections.find((s) => s.id === sectionId);
	const field = section?.fields.find((f) => f.id === fieldId);
	return field?.value;
};

/** Calculate daily volume, per capita consumption, and flow rates */
export const calculateDerivedValues = (sections: TableSection[]) => {
	const designFlow =
		(getFieldValue(sections, "general-data", "design-flow") as number) || 0;
	const operationHours =
		(getFieldValue(sections, "general-data", "operation-hours") as number) || 0;
	const population =
		(getFieldValue(sections, "general-data", "population-served") as number) ||
		0;

	return {
		dailyVolume: designFlow * operationHours * HOURS_TO_M3_DAY,
		perCapitaConsumption:
			population > 0 ? (designFlow * LS_TO_L_DAY) / population : 0,
		peakFactor: PEAK_FACTOR,
		averageFlow: designFlow / PEAK_FACTOR,
	};
};

/** Save technical sheet data to localStorage and backend */
export const saveTechnicalSheetData = async (
	projectId: string,
	sections: TableSection[],
): Promise<void> => {
	if (typeof window === "undefined") return;

	// localStorage backup (non-critical)
	try {
		window.localStorage.setItem(
			`technical-sheet-data:${projectId}`,
			JSON.stringify(sections),
		);
	} catch (_error) {
		logger.warn("localStorage save failed", "TechnicalSheet");
	}

	// Backend sync (critical)
	try {
		const { projectDataAPI } = await import("@/lib/api/project-data");
		await projectDataAPI.updateData(
			projectId,
			{ technical_sections: sections },
			true, // merge
		);
	} catch (error) {
		logger.error("Backend sync failed", error, "TechnicalSheet");
	}
};

export interface FieldUpdate {
	sectionId: string;
	fieldId: string;
	value: string | number | string[];
	unit?: string | undefined;
	source?: DataSource | undefined;
	notes?: string | undefined;
}

export const updateFieldInSections = (
	sections: TableSection[],
	update: FieldUpdate,
): TableSection[] => {
	return sections.map((section) => {
		if (section.id !== update.sectionId) return section;
		return {
			...section,
			fields: section.fields.map((field) => {
				if (field.id !== update.fieldId) return field;
				return {
					...field,
					value: update.value,
					...(update.unit !== undefined ? { unit: update.unit } : {}),
					...(update.source ? { source: update.source } : {}),
					...(update.notes !== undefined ? { notes: update.notes } : {}),
				};
			}),
		};
	});
};

export const applyFieldUpdates = (
	sections: TableSection[],
	updates: FieldUpdate[],
): TableSection[] => {
	return updates.reduce(
		(acc, update) => updateFieldInSections(acc, update),
		sections,
	);
};

export const sectionCompletion = (section: TableSection) => {
	const total = section.fields.length;
	const completed = section.fields.filter(
		(field) =>
			field.value !== undefined && field.value !== "" && field.value !== null,
	).length;
	const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
	return { total, completed, percentage };
};

export const overallCompletion = (sections: TableSection[]) => {
	const totals = sections.reduce(
		(acc, section) => {
			const stats = sectionCompletion(section);
			return {
				total: acc.total + stats.total,
				completed: acc.completed + stats.completed,
			};
		},
		{ total: 0, completed: 0 },
	);
	const percentage =
		totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0;
	return { ...totals, percentage };
};

export interface SummaryRow {
	sectionId: string;
	sectionTitle: string;
	fieldId: string;
	fieldLabel: string;
	fieldType: string;
	currentValue?: string | number | string[] | null;
	unit?: string;
	description?: string;
	source?: DataSource;
}

export const mapSectionsToSummaryRows = (
	sections: TableSection[],
): SummaryRow[] => {
	return sections.flatMap((section) =>
		section.fields.map((field) => {
			const row: SummaryRow = {
				sectionId: section.id,
				sectionTitle: section.title,
				fieldId: field.id,
				fieldLabel: field.label,
				fieldType: field.type,
			};
			if (field.value !== undefined && field.value !== null)
				row.currentValue = field.value;
			if (field.unit !== undefined) row.unit = field.unit;
			if (field.description) row.description = field.description;
			if (field.source) row.source = field.source;
			return row;
		}),
	);
};

export const sourceBreakdown = (sections: TableSection[]) => {
	return sections.reduce(
		(acc, section) => {
			section.fields.forEach((field) => {
				const key = field.source || "manual";
				acc[key] = (acc[key] || 0) + (field.value ? 1 : 0);
			});
			return acc;
		},
		{} as Record<DataSource, number>,
	);
};
