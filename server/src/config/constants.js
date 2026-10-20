export const TRANSACTION_TYPES = Object.freeze({
  INCOME:  'INCOME',
  EXPENSE: 'EXPENSE',
});

export const TRANSACTION_STATUSES = Object.freeze({
  PENDING:   'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED:    'FAILED',
  CANCELLED: 'CANCELLED',
});

export const ACCOUNT_TYPES = Object.freeze({
  CASH:         'CASH',
  BANK:         'BANK',
  MOBILE_MONEY: 'MOBILE_MONEY',
  SAVINGS:      'SAVINGS',
  OTHER:        'OTHER',
});

export const PERIODS = Object.freeze({
  DAILY:   'DAILY',
  WEEKLY:  'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY:  'YEARLY',
});

export const GOAL_STATUSES = Object.freeze({
  ACTIVE:    'ACTIVE',
  COMPLETED: 'COMPLETED',
  PAUSED:    'PAUSED',
  CANCELLED: 'CANCELLED',
});

export const PRIORITIES = Object.freeze({
  LOW:    'LOW',
  MEDIUM: 'MEDIUM',
  HIGH:   'HIGH',
});

export const NOTIFICATION_TYPES = Object.freeze({
  BUDGET_ALERT:     'BUDGET_ALERT',
  BUDGET_EXCEEDED:  'BUDGET_EXCEEDED',
  GOAL_REACHED:     'GOAL_REACHED',
  GOAL_MILESTONE:   'GOAL_MILESTONE',
  RECURRING_DUE:    'RECURRING_DUE',
  RECURRING_FAILED: 'RECURRING_FAILED',
  ACCOUNT_LOW:      'ACCOUNT_LOW',
  WEEKLY_SUMMARY:   'WEEKLY_SUMMARY',
  MONTHLY_SUMMARY:  'MONTHLY_SUMMARY',
  SYSTEM:           'SYSTEM',
});

export const REPORT_TYPES = Object.freeze({
  CATEGORY_BREAKDOWN: 'CATEGORY_BREAKDOWN',
  SAVINGS_PROGRESS:   'SAVINGS_PROGRESS',
  MONTHLY_SUMMARY:    'MONTHLY_SUMMARY',
  CASH_FLOW:          'CASH_FLOW',
  ACCOUNT_BALANCE:    'ACCOUNT_BALANCE',
});

export const EXPORT_FORMATS = Object.freeze({
  PDF:  'PDF',
  CSV:  'CSV',
  XLSX: 'XLSX',
});

export const LANGUAGES = Object.freeze({
  ENGLISH:  'en',
  AMHARIC:  'am',
  CHINESE:  'zh',
  OROMIFA:  'om',
  ARABIC:   'ar',
});

export const THEMES = Object.freeze({
  LIGHT:  'light',
  DARK:   'dark',
  SYSTEM: 'system',
});

export const DATE_FORMATS = Object.freeze({
  ISO: 'YYYY-MM-DD',
  US:  'MM/DD/YYYY',
  EU:  'DD/MM/YYYY',
  LONG:'MMMM D, YYYY',
});

export const TIME_FORMATS = Object.freeze({
  HOUR_12: '12-hour',
  HOUR_24: '24-hour',
});

export const FIRST_DAY_OF_WEEK = Object.freeze({
  MONDAY:   'monday',
  SUNDAY:   'sunday',
  SATURDAY: 'saturday',
});

export const DEFAULTS = Object.freeze({
  CURRENCY:             'ETB',
  LANGUAGE:             LANGUAGES.ENGLISH,
  THEME:                THEMES.SYSTEM,
  DATE_FORMAT:          DATE_FORMATS.ISO,
  TIME_FORMAT:          TIME_FORMATS.HOUR_24,
  FIRST_DAY_OF_WEEK:    FIRST_DAY_OF_WEEK.MONDAY,
  EXPORT_FORMAT:        EXPORT_FORMATS.PDF,
  TIMEZONE:             'Africa/Addis_Ababa',
  BUDGET_ALERT_PERCENT: 80,
  TRANSACTION_STATUS:   TRANSACTION_STATUSES.COMPLETED,
  GOAL_STATUS:          GOAL_STATUSES.ACTIVE,
  GOAL_PRIORITY:        PRIORITIES.MEDIUM,
});

export const LIMITS = Object.freeze({
  MAX_FILE_SIZE_MB:                5,
  MAX_TAGS_PER_TRANSACTION:        10,
  MAX_ATTACHMENTS_PER_TRANSACTION: 5,
  MAX_ACCOUNTS_PER_USER:           20,
  MAX_CATEGORIES_PER_USER:         100,
  MAX_BUDGETS_PER_USER:            50,
  MAX_GOALS_PER_USER:              20,
  MAX_RECURRING_PER_USER:          50,
  DEFAULT_PAGE_SIZE:               20,
  MAX_PAGE_SIZE:                   100,
});

const constants = Object.freeze({
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  ACCOUNT_TYPES,
  PERIODS,
  GOAL_STATUSES,
  PRIORITIES,
  NOTIFICATION_TYPES,
  REPORT_TYPES,
  EXPORT_FORMATS,
  LANGUAGES,
  THEMES,
  DATE_FORMATS,
  TIME_FORMATS,
  FIRST_DAY_OF_WEEK,
  DEFAULTS,
  LIMITS,
});

export default constants;