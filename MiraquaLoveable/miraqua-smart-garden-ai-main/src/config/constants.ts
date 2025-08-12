export const APP_CONFIG = {
  NAME: 'Miraqua',
  VERSION: '1.0.0',
  API_TIMEOUT: 30000,
  MAX_RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  OFFLINE_RETRY_INTERVAL: 30000, // 30 seconds
  MAX_LOG_ENTRIES: 1000,
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de'],
  THEME_OPTIONS: ['light', 'dark', 'system'] as const,
  MAP_ZOOM_LEVELS: {
    MIN: 1,
    MAX: 20,
    DEFAULT: 15
  },
  CHART_COLORS: {
    PRIMARY: 'hsl(var(--primary))',
    SECONDARY: 'hsl(var(--secondary))',
    SUCCESS: 'hsl(var(--success))',
    WARNING: 'hsl(var(--warning))',
    ERROR: 'hsl(var(--destructive))'
  }
} as const;

export const FEATURE_FLAGS = {
  ENABLE_VOICE_COMMANDS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_ANALYTICS: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_MAP_VIEW: true,
  ENABLE_EXPORT_REPORTS: true
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PLOT_NAME_MAX_LENGTH: 50,
  COORDINATES_PRECISION: 6,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
} as const;