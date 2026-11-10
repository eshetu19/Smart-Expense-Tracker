
import { z } from 'zod';
import { GOAL_STATUSES, PRIORITIES } from '../config/constants.js';

const objectIdField = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');


export const createSavingsGoalSchema = z
  .object({
    name: z
      .string({ required_error: 'Goal name is required' })
      .min(1, 'Goal name cannot be empty')
      .max(100, 'Goal name is too long'),

    description: z.string().max(1000, 'Description is too long').nullable().optional(),

    accountId: objectIdField,

    targetAmountCents: z
      .number({ required_error: 'Target amount is required' })
      .int('Target amount must be a whole number of cents')
      .positive('Target amount must be greater than 0')
      .max(1_000_000_000, 'Target amount is too large'),

    targetDate: z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid target date')
      .nullable()
      .optional(),

    priority: z.enum(Object.values(PRIORITIES)).optional(),

    icon: z.string().max(100).nullable().optional(),
    color: z.string().max(20).nullable().optional(),
  })
  .strict();


export const updateSavingsGoalSchema = z
  .object({
    name: z.string().min(1, 'Goal name cannot be empty').max(100).optional(),
    description: z.string().max(1000).nullable().optional(),
    targetAmountCents: z.number().int().positive().max(1_000_000_000).optional(),
    targetDate: z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid target date')
      .nullable()
      .optional(),
    priority: z.enum(Object.values(PRIORITIES)).optional(),
    icon: z.string().max(100).nullable().optional(),
    color: z.string().max(20).nullable().optional(),
  })
  .strict();


export const changeGoalStatusSchema = z
  .object({
    status: z.enum(
      [GOAL_STATUSES.PAUSED, GOAL_STATUSES.ACTIVE, GOAL_STATUSES.CANCELLED],
      {
        errorMap: () => ({
          message: 'Status must be PAUSED, ACTIVE, or CANCELLED',
        }),
      }
    ),
  })
  .strict();


export const listSavingsGoalsQuerySchema = z.object({
  includeInactive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => v === true || v === 'true')
    .optional()
    .default(false),
  status: z.enum(Object.values(GOAL_STATUSES)).optional(),
});

export const savingsGoalIdParamSchema = z
  .object({ goalId: objectIdField })
  .strict();

export const savingsGoalIdSchema = z.object({ id: objectIdField }).strict();