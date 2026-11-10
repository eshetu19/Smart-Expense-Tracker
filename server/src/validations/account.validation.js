
import { z } from 'zod';
import { ACCOUNT_TYPES } from '../config/constants.js';

const objectIdField = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID format');



export const createAccountSchema = z
  .object({
    name: z
      .string({ required_error: 'Account name is required' })
      .min(1, 'Account name cannot be empty')
      .max(100, 'Account name is too long'),

    accountType: z.enum(Object.values(ACCOUNT_TYPES), {
      required_error: 'Account type is required',
      invalid_type_error: 'Invalid account type',
    }),

    openingBalanceCents: z
      .number({ required_error: 'Opening balance is required' })
      .int('Opening balance must be a whole number of cents')
      .min(0, 'Opening balance cannot be negative')
      .optional()
      .default(0),

    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter code')
      .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters (e.g., ETB, USD)')
      .optional(),

    color: z
      .string()
      .max(20, 'Color is too long')
      .nullable()
      .optional(),

    icon: z
      .string()
      .max(100, 'Icon is too long')
      .nullable()
      .optional(),
  })
  .strict();



export const updateAccountSchema = z
  .object({
    name: z.string().min(1, 'Account name cannot be empty').max(100).optional(),
    accountType: z.enum(Object.values(ACCOUNT_TYPES)).optional(),
    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter code')
      .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
      .optional(),
    color: z.string().max(20).nullable().optional(),
    icon: z.string().max(100).nullable().optional(),
  })
  .strict();

export const listAccountsQuerySchema = z
  .object({
    includeInactive: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((v) => v === true || v === 'true')
      .optional()
      .default(false),
  })
  .strict();



export const accountIdSchema = z.object({ id: objectIdField }).strict();