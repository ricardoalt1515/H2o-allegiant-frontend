/**
 * TEMPLATES - Public API
 *
 * Modular template system for water treatment projects.
 *
 * Usage:
 * ```typescript
 * import { applyTemplate, createTemplateRegistry } from "@/lib/templates"
 *
 * const registry = createTemplateRegistry()
 * const sections = applyTemplate("industrial-oil-gas", registry)
 * ```
 */

// Types
export type {
	TemplateConfig,
	SectionConfig,
	FieldOverride,
	TemplateRegistry,
} from "./template-types";

// Base template
export { BASE_TEMPLATE } from "./base-template";

// Sector templates
export { INDUSTRIAL_TEMPLATE } from "./sector-templates/industrial.template";

// Subsector templates
export { OIL_GAS_TEMPLATE } from "./subsector-templates/oil-gas.template";

// Engine functions
export {
	applyTemplate,
	createTemplateRegistry,
	getTemplateForProject,
} from "./template-engine";
