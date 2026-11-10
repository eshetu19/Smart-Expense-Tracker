
import { z } from 'zod';
import {
  LANGUAGES,
  THEMES,
  DATE_FORMATS,
  TIME_FORMATS,
  FIRST_DAY_OF_WEEK,
  EXPORT_FORMATS,
  TRANSACTION_TYPES,
} from '../config/constants.js';


export const updateSettingsSchema = z
  .object({
    preferredCurrency: z
      .string()
      .length(3, 'Currency must be a 3-letter code')
      .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters (e.g., ETB, USD)')
      .optional(),

    language: z.enum(Object.values(LANGUAGES)).optional(),

    timezone: z
      .string()
      .max(100, 'Timezone is too long')
      .min(1, 'Timezone cannot be empty')
      .optional(),

    dateFormat: z.enum(Object.values(DATE_FORMATS)).optional(),

    timeFormat: z.enum(Object.values(TIME_FORMATS)).optional(),

    theme: z.enum(Object.values(THEMES)).optional(),

    defaultAccountId: z
      .string()
      .regex(/^[a-f\d]{24}$/i, 'Invalid account ID')
      .nullable()
      .optional(),

    defaultTransactionType: z.enum(Object.values(TRANSACTION_TYPES)).optional(),

    defaultExportFormat: z.enum(Object.values(EXPORT_FORMATS)).optional(),

    firstDayOfWeek: z.enum(Object.values(FIRST_DAY_OF_WEEK)).optional(),

    defaultBudgetAlertPercentage: z
      .number()
      .int('Must be a whole number')
      .min(1, 'Must be at least 1')
      .max(100, 'Must be at most 100')
      .optional(),

    quietHoursEnabled: z.boolean().optional(),

    quietHoursStart: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm format (24-hour)')
      .optional(),

    quietHoursEnd: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm format (24-hour)')
      .optional(),

    notificationEnabled: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
  })
  .strict();