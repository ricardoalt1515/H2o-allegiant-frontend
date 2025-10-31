/**
 * TEMPLATE TYPES - TypeScript definitions for template system
 *
 * Core types for modular template architecture:
 * - Templates define structure (sections + field IDs)
 * - Metadata comes from parameter-library.ts
 * - Engine merges templates intelligently
 */

import type { Sector, Subsector } from "@/lib/sectors-config";
import type { FieldImportance } from "@/lib/types/technical-data";

/**
 * Template configuration (lightweight - just IDs and overrides)
 *
 * Philosophy: Templates are data structures, not code.
 * All field metadata comes from parameter-library.
 */
export interface TemplateConfig {
	/** Unique template identifier */
	id: string;

	/** Human-readable name */
	name: string;

	/** Description of template purpose */
	description: string;

	/** Target sector (optional) */
	sector?: Sector;

	/** Target subsector (optional) */
	subsector?: Subsector;

	/** Template to extend from (for inheritance) */
	extends?: string;

	/** Section definitions */
	sections: SectionConfig[];

	/** Metadata */
	tags?: string[];
	icon?: string;
	complexity?: "simple" | "standard" | "advanced";
	estimatedTime?: number; // minutes to complete
}

/**
 * Section configuration within a template
 *
 * Defines how to build or modify a section.
 */
export interface SectionConfig {
	/** Section identifier (must be unique within template) */
	id: string;

	/** How to handle this section when merging */
	operation?: "extend" | "replace" | "remove"; // Default: extend

	/** Field IDs to add (references to parameter-library) */
	addFields?: string[];

	/** Field IDs to remove (when extending a base template) */
	removeFields?: string[];

	/** Override default values for specific fields */
	fieldOverrides?: Record<string, FieldOverride>;

	// For new sections (not in base template)
	/** Section title (required if new section) */
	title?: string;

	/** Section description */
	description?: string;

	/** Allow custom fields to be added by user */
	allowCustomFields?: boolean;
}

/**
 * Override configuration for a specific field
 *
 * Allows templates to customize field behavior without changing
 * the core parameter definition.
 */
export interface FieldOverride {
	/** Override default value */
	defaultValue?: any;

	/** Override importance level */
	importance?: FieldImportance;

	/** Override required flag */
	required?: boolean;

	/** Override placeholder text */
	placeholder?: string;

	/** Override description */
	description?: string;
}

/**
 * Template registry type
 *
 * Maps template IDs to template configurations
 */
export type TemplateRegistry = Map<string, TemplateConfig>;
