/**
 * Project-related constants and configuration
 */

/**
 * Project sectors with strict typing (English lowercase)
 */
export const PROJECT_SECTORS = ['municipal', 'industrial', 'residential', 'commercial'] as const
export type ProjectSector = typeof PROJECT_SECTORS[number]

/**
 * Project statuses with strict typing
 */
export const PROJECT_STATUSES = [
  'In Preparation',
  'Generating Proposal',
  'Proposal Ready',
  'In Development',
  'Completed',
  'On Hold'
] as const
export type ProjectStatus = typeof PROJECT_STATUSES[number]

/**
 * Data source types for fields
 */
export const DATA_SOURCES = ['manual', 'imported', 'ai'] as const
export type DataSource = typeof DATA_SOURCES[number]

/**
 * Field importance levels
 */
export const FIELD_IMPORTANCE = ['critical', 'recommended', 'optional'] as const
export type FieldImportance = typeof FIELD_IMPORTANCE[number]

/**
 * Field types for technical data
 */
export const FIELD_TYPES = ['text', 'number', 'select', 'unit', 'tags'] as const
export type FieldType = typeof FIELD_TYPES[number]

/**
 * Technical data configuration
 */
export const TECHNICAL_DATA_CONFIG = {
  // Completion thresholds
  COMPLETION_THRESHOLD: 70,
  HIGH_COMPLETION_THRESHOLD: 90,

  // UI limits
  MAX_FIELDS_PER_SECTION: 50,
  MAX_SECTIONS_PER_PROJECT: 20,
  MAX_FIELD_LABEL_LENGTH: 100,
  MAX_SECTION_TITLE_LENGTH: 80,

  // Performance
  AUTO_SAVE_DEBOUNCE_MS: 1000,
  SEARCH_DEBOUNCE_MS: 300,

  // Validation
  MIN_PROJECT_NAME_LENGTH: 3,
  MAX_PROJECT_NAME_LENGTH: 100,
  MIN_CLIENT_NAME_LENGTH: 2,
} as const

/**
 * Project creation defaults
 */
export const PROJECT_DEFAULTS = {
  STATUS: 'In Preparation' as ProjectStatus,
  PROGRESS: 0,
  BUDGET: 0,
  PROPOSALS_COUNT: 0,
  TYPE: 'To be defined',
  SCHEDULE_SUMMARY: 'To be defined',
} as const

/**
 * Sector-specific configurations (English lowercase keys)
 */
export const SECTOR_CONFIG = {
  municipal: {
    color: 'blue',
    icon: 'Building2',
    defaultSubsectors: [
      'water_utility',
      'government_building',
      'public_utility',
      'water_distribution'
    ],
    criticalFields: ['population', 'design_flow', 'dbo5'],
    recommendedFields: ['turbidity', 'ph', 'retention_time'],
  },
  industrial: {
    color: 'gray',
    icon: 'Factory',
    defaultSubsectors: [
      'food_processing',
      'beverage_bottling',
      'chemical_processing',
      'textile_manufacturing',
      'pharmaceutical_manufacturing'
    ],
    criticalFields: ['industry_type', 'waste_contaminants', 'discharge_limits'],
    recommendedFields: ['production_volume', 'operating_hours', 'seasonal_variation'],
  },
  residential: {
    color: 'green',
    icon: 'Home',
    defaultSubsectors: [
      'multi_family',
      'single_home',
      'residential_complex',
      'tourist_development'
    ],
    criticalFields: ['units_count', 'occupancy_rate', 'water_demand'],
    recommendedFields: ['peak_factor', 'storage_requirements', 'landscaping_needs'],
  },
  commercial: {
    color: 'purple',
    icon: 'Store',
    defaultSubsectors: [
      'hotel',
      'restaurant',
      'shopping_mall',
      'office_building',
      'food_service'
    ],
    criticalFields: ['building_type', 'capacity', 'operating_schedule'],
    recommendedFields: ['guest_rooms', 'restaurant_seats', 'parking_spaces'],
  },
} as const satisfies Record<ProjectSector, {
  color: string
  icon: string
  defaultSubsectors: string[]
  criticalFields: string[]
  recommendedFields: string[]
}>

/**
 * Status groupings for filtering
 */
export const PROJECT_STATUS_GROUPS = {
  all: PROJECT_STATUSES,
  active: ['In Preparation', 'Generating Proposal'] as const,
  completed: ['Proposal Ready', 'Completed'] as const,
  onhold: [] as const, // For future use
} as const