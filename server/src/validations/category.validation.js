
import { z } from 'zod';
import { TRANSACTION_TYPES } from '../config/constants.js';

const objectIdField = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID format');


export const createCategorySchema = z
  .object({
    name: z
      .string({ required_error: 'Category name is required' })
      .min(1, 'Category name cannot be empty')
      .max(50, 'Category name is too long'),

    transactionType: z.enum(Object.values(TRANSACTION_TYPES), {
      required_error: 'Transaction type is required',
      invalid_type_error: 'Invalid transaction type',
    }),

    icon: z.string().max(100).nullable().optional(),
    color: z.string().max(20).nullable().optional(),
  })
  .strict();


export const updateCategorySchema = z
  .object({
    name: z.string().min(1, 'Category name cannot be empty').max(50).optional(),
    icon: z.string().max(100).nullable().optional(),
    color: z.string().max(20).nullable().optional(),
  })
  .strict();


export const listCategoriesQuerySchema = z.object({
  transactionType: z.enum(Object.values(TRANSACTION_TYPES)).optional(),
});


export const categoryIdSchema = z.object({ id: objectIdField }).strict();