/**
 * BASE TEMPLATE - Universal starting point for all projects
 *
 * This is the core template applied to ALL projects regardless of sector.
 * Sector-specific templates extend this base.
 *
 * Philosophy:
 * - 20 essential fields that apply to 80%+ of projects
 * - Organized in 5 logical sections
 * - Only field IDs (metadata comes from parameter-library)
 * - Clean, minimal, focused
 *
 * Sections:
 * 1. Project Context (7 fields) - What, why, where
 * 2. Economics & Scale (5 fields) - Volumes, costs, people
 * 3. Project Constraints (2 fields) - Limitations, regulations
 * 4. Water Quality (5 fields) - Core parameters
 * 5. Field Notes (1 field) - Engineer observations (ALWAYS LAST)
 */

import type { TemplateConfig } from "./template-types";

export const BASE_TEMPLATE: TemplateConfig = {
	id: "base",
	name: "Base Template",
	description:
		"Universal template with essential fields for any water treatment project",
	complexity: "simple",
	estimatedTime: 15,
	tags: ["base", "universal", "core"],

	sections: [
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		// SECTION 1: Project Context
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		{
			id: "project-context",
			title: "Project Context",
			description: "Essential project context and objectives",
			allowCustomFields: false,
			addFields: [
				"water-source",
				"water-uses",
				"existing-system",
				"existing-system-description",
				"project-objective",
				"reuse-goals",
				"discharge-point",
			],
		},

		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		// SECTION 2: Economics & Scale
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		{
			id: "economics-scale",
			title: "Economics & Scale",
			description: "Volumes and operational costs",
			allowCustomFields: true,
			addFields: [
				"water-cost",
				"water-consumption",
				"wastewater-generated",
				"people-served-daily",
				"peak-factor",
			],
		},

		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		// SECTION 3: Project Constraints
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		{
			id: "project-constraints",
			title: "Project Constraints",
			description: "Limitations and special considerations affecting design",
			allowCustomFields: true,
			addFields: ["constraints", "regulatory-requirements"],
		},

		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		// SECTION 4: Water Quality
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		{
			id: "water-quality",
			title: "Water Quality",
			description: "Physical, chemical and bacteriological characteristics",
			allowCustomFields: true,
			addFields: ["ph", "turbidity", "tds", "hardness", "temperature"],
		},

		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		// SECTION 5: Field Notes (ALWAYS LAST)
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		{
			id: "field-notes",
			title: "Field Notes",
			description:
				"Engineer observations, assumptions and detected risks on site",
			allowCustomFields: false,
			addFields: ["field-notes"],
		},
	],
};
