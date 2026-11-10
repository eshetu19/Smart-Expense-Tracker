
import { z } from 'zod';
import { TRANSACTION_TYPES, PERIODS } from '../config/constants.js';

const objectIdField = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');


export const createRecurringTransactionSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title cannot be empty')
      .max(150, 'Title is too long'),

    description: z.string().max(2000, 'Description is too long').nullable().optional(),

    transactionType: z.enum(Object.values(TRANSACTION_TYPES), {
      required_error: 'Transaction type is required',
    }),

    amountCents: z
      .number({ required_error: 'Amount is required' })
      .int('Amount must be a whole number of cents')
      .positive('Amount must be greater than 0')
      .max(1_000_000_000, 'Amount is too large'),

    categoryId: objectIdField.nullable().optional(),

    accountId: objectIdField,

    frequency: z.enum(Object.values(PERIODS), {
      required_error: 'Frequency is required',
      invalid_type_error: 'Frequency must be DAILY, WEEKLY, MONTHLY, or YEARLY',
    }),

    startDate: z
      .string({ required_error: 'Start date is required' })
      .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid start date'),

    endDate: z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid end date')
      .nullable()
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


export const updateRecurringTransactionSchema = z
  .object({
    title: z.string().min(1, 'Title cannot be empty').max(150).optional(),
    description: z.string().max(2000).nullable().optional(),
    amountCents: z.number().int().positive().max(1_000_000_000).optional(),
    categoryId: objectIdField.nullable().optional(),
    accountId: objectIdField.optional(),
    frequency: z.enum(Object.values(PERIODS)).optional(),
    endDate: z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid end date')
      .nullable()
      .optional(),
  })
  .strict();


export const listRecurringTransactionsQuerySchema = z.object({
  includeInactive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => v === true || v === 'true')
    .optional()
    .default(false),
});

export const recurringTransactionIdSchema = z.object({ id: objectIdField }).strict();