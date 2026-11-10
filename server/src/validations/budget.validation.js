
import { z } from 'zod';
import { PERIODS } from '../config/constants.js';

const objectIdField = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');



export const createBudgetSchema = z
  .object({
    name: z
      .string({ required_error: 'Budget name is required' })
      .min(1, 'Budget name cannot be empty')
      .max(100, 'Budget name is too long'),

    categoryId: objectIdField.nullable().optional(),

    amountCents: z
      .number({ required_error: 'Amount is required' })
      .int('Amount must be a whole number of cents')
      .positive('Amount must be greater than 0')
      .max(1_000_000_000, 'Amount is too large'),

    period: z.enum(Object.values(PERIODS), {
      required_error: 'Budget period is required',
      invalid_type_error: 'Invalid budget period',
    }),

    startDate: z
      .string({ required_error: 'Start date is required' })
      .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid start date'),

    endDate: z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid end date')
      .optional(),

    alertPercentage: z
      .number()
      .int('Alert percentage must be a whole number')
      .min(1, 'Alert percentage must be at least 1')
      .max(100, 'Alert percentage must be at most 100')
      .optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );


export const updateBudgetSchema = z
  .object({
    name: z.string().min(1, 'Budget name cannot be empty').max(100).optional(),
    categoryId: objectIdField.nullable().optional(),
    amountCents: z.number().int().positive().max(1_000_000_000).optional(),
    startDate: z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid start date')
      .optional(),
    endDate: z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid end date')
      .optional(),
    alertPercentage: z.number().int().min(1).max(100).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );


export const listBudgetsQuerySchema = z.object({
  includeInactive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => v === true || v === 'true')
    .optional()
    .default(false),
});


export const budgetIdSchema = z.object({ id: objectIdField }).strict();