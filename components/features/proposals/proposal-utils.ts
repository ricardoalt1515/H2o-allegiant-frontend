/**
 * Utility functions for proposal components
 *
 * Note: formatCurrency and formatNumber have been consolidated into @/lib/utils
 * for consistency across the application. Use those instead.
 */

/**
 * Get badge variant based on compliance
 */
export function getComplianceBadgeVariant(
	passes: boolean,
): "default" | "destructive" {
	return passes ? "default" : "destructive";
}

/**
 * Get criticality badge variant
 */
export function getCriticalityBadgeVariant(
	criticality: "high" | "medium" | "low",
): "destructive" | "secondary" | "outline" {
	switch (criticality) {
		case "high":
			return "destructive";
		case "medium":
			return "secondary";
		case "low":
			return "outline";
	}
}

/**
 * Get confidence badge color (semantic, dark/light mode compatible)
 */
export function getConfidenceColor(
	confidence: "High" | "Medium" | "Low",
): string {
	switch (confidence) {
		case "High":
			return "text-[var(--confidence-high)]";
		case "Medium":
			return "text-[var(--confidence-medium)]";
		case "Low":
			return "text-[var(--confidence-low)]";
	}
}
