// Technical data feature exports
export { ResizableDataLayout } from "./components/data-capture/resizable-data-layout"
export { FlexibleDataCapture } from "./components/data-capture/flexible-data-capture"
export { DynamicSection } from "./components/data-capture/dynamic-section"
export { TechnicalDataSummary } from "./components/data-capture/technical-data-summary"
export { EngineeringDataTable } from "./components/data-capture/engineering-data-table"
export { ParameterLibrary } from "./components/data-capture/parameter-library"

// ✅ REMOVED (2025-10-11): Phase 1 cleanup
// - CompactDataTable (only used by EngineerDataView)
// - EngineerDataView (imported but never rendered)

// ✅ REMOVED (2025-10-12): Phase 2 cleanup - Dead code elimination
// - EditableTable (exported but never used, legacy component)
// - EngineerFieldBuilder (orphaned after CompactDataTable removal, duplicate of ParameterLibrary)
// - EngineeringShortcuts (decorative only, promises features that don't exist)

// Types - Export any types that are defined in these components
export type { TableField, TableSection, DataSource, FieldType } from '@/lib/types/technical-data'