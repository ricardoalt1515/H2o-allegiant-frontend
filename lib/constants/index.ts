/**
 * Centralized constants export
 * Import from here: import { ROUTES, PROJECT_SECTORS } from '@/lib/constants'
 */

// Route constants
export {
  ROUTES,
  PROJECT_TABS,
  QUERY_PARAMS,
  type ProjectTab,
} from './routes'

// Project domain constants
export {
  PROJECT_SECTORS,
  PROJECT_STATUSES,
  DATA_SOURCES,
  FIELD_IMPORTANCE,
  FIELD_TYPES,
  TECHNICAL_DATA_CONFIG,
  PROJECT_DEFAULTS,
  SECTOR_CONFIG,
  PROJECT_STATUS_GROUPS,
  type ProjectSector,
  type ProjectStatus,
  type DataSource,
  type FieldImportance,
  type FieldType,
} from './project'

// UI and UX constants
export {
  ANIMATION,
  KEYBOARD_SHORTCUTS,
  SOURCE_CONFIG,
  IMPORTANCE_CONFIG,
  NOTIFICATIONS,
  BREAKPOINTS,
  LAYOUT,
  FILE_UPLOAD,
  TABLE_CONFIG,
} from './ui'

// Unit constants
export {
  COMMON_UNITS,
  ALL_COMMON_UNITS,
  getUnitsByCategory,
  searchUnits,
  type UnitCategory,
} from './units'

/**
 * Global application constants
 */
export const APP_CONFIG = {
  NAME: 'H2O Allegiant',
  VERSION: '1.0.0',
  DESCRIPTION: 'Central hub for water treatment project management',

  // Environment
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  // API
  API_DISABLED: false, // Backend connected mode

  // Storage keys
  STORAGE_KEYS: {
    THEME: 'h2o-theme',
    PROJECT_STORE: 'h2o-project-store',
    TECHNICAL_DATA_STORE: 'h2o-technical-data-store',
    UI_STORE: 'h2o-ui-store',
    AI_STORE: 'h2o-ai-store',
  },

  // Cache settings
  CACHE_TTL: {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const