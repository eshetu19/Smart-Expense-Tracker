
import { z } from 'zod';
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  LIMITS,
} from '../config/constants.js';


const objectIdField = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

const tagsInputField = z
  .array(z.string().min(1, 'Tag cannot be empty').max(50, 'Tag is too long'))
  .max(
    LIMITS.MAX_TAGS_PER_TRANSACTION,
    `At most ${LIMITS.MAX_TAGS_PER_TRANSACTION} tags allowed per transaction`
  )
  .optional();


export const createTransactionSchema = z
  .object({
    transactionType: z.enum(Object.values(TRANSACTION_TYPES), {
      required_error: 'Transaction type is required',
      invalid_type_error: 'Transaction type must be INCOME or EXPENSE',
    }),
    amountCents: z
      .number({ required_error: 'Amount is required' })
      .int('Amount must be a whole number of cents')
      .positive('Amount must be greater than 0')
      .max(1_000_000_000, 'Amount is too large'),
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title cannot be empty')
      .max(150, 'Title is too long'),
    description: z.string().max(2000, 'Description is too long').nullable().optional(),
    categoryId: objectIdField.nullable().optional(),
    fromAccount: objectIdField.nullable().optional(),
    toAccount: objectIdField.nullable().optional(),
    transactionDate: z
      .string({ required_error: 'Transaction date is required' })
      .refine((v) => !isNaN(new Date(v).getTime()), 'Transaction date must be a valid date'),
    status: z.enum(Object.values(TRANSACTION_STATUSES)).optional(),
    paymentMethod: z.string().max(50, 'Payment method is too long').nullable().optional(),
    referenceNumber: z.string().max(100, 'Reference number is too long').nullable().optional(),
    location: z.string().max(255, 'Location is too long').nullable().optional(),
    tags: tagsInputField,
  })
  .strict()
  .refine(
    (data) => {
      if (data.transactionType === 'EXPENSE') {
        return !!data.fromAccount && !data.toAccount;
      }
      return true;
    },
    {
      message: 'Expense transactions require a fromAccount and must not have a toAccount',
      path: ['fromAccount'],
    }
  )
  .refine(
    (data) => {
      if (data.transactionType === 'INCOME') {
        return !!data.toAccount && !data.fromAccount;
      }
      return true;
    },
    {
      message: 'Income transactions require a toAccount and must not have a fromAccount',
      path: ['toAccount'],
    }
  );


export const updateTransactionSchema = z
  .object({
    transactionType: z.enum(Object.values(TRANSACTION_TYPES)).optional(),
    amountCents: z
      .number()
      .int('Amount must be a whole number of cents')
      .positive('Amount must be greater than 0')
      .max(1_000_000_000, 'Amount is too large')
      .optional(),
    title: z.string().min(1, 'Title cannot be empty').max(150).optional(),
    description: z.string().max(2000).nullable().optional(),
    categoryId: objectIdField.nullable().optional(),
    fromAccount: objectIdField.nullable().optional(),
    toAccount: objectIdField.nullable().optional(),
    transactionDate: z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), 'Transaction date must be a valid date')
      .optional(),
    status: z.enum(Object.values(TRANSACTION_STATUSES)).optional(),
    paymentMethod: z.string().max(50).nullable().optional(),
    referenceNumber: z.string().max(100).nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    tags: tagsInputField,
  })
  .strict();


export const listTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  transactionType: z.enum(Object.values(TRANSACTION_TYPES)).optional(),
  categoryId: objectIdField.optional(),
  accountId: objectIdField.optional(),
  status: z.enum(Object.values(TRANSACTION_STATUSES)).optional(),
  startDate: z
    .string()
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid start date')
    .optional(),
  endDate: z
    .string()
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid end date')
    .optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  search: z.string().max(200, 'Search term is too long').optional(),
  sortBy: z
    .enum(['transactionDate', 'amountCents', 'createdAt', 'title'])
    .optional()
    .default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});


export const transactionIdSchema = z.object({ id: objectIdField }).strict();


export const updateTransactionTagsSchema = z
  .object({
    tags: z
      .array(z.string().min(1).max(50))
      .max(
        LIMITS.MAX_TAGS_PER_TRANSACTION,
        `At most ${LIMITS.MAX_TAGS_PER_TRANSACTION} tags allowed`
      ),
  })
  .strict();


export const recentTransactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});


export const summaryQuerySchema = z.object({
  startDate: z
    .string({ required_error: 'Start date is required' })
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid start date'),
  endDate: z
    .string({ required_error: 'End date is required' })
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid end date'),
});


export const categorySummaryQuerySchema = summaryQuerySchema.extend({
  transactionType: z.enum(Object.values(TRANSACTION_TYPES)).optional(),
});


export const dateRangeQuerySchema = z.object({
  startDate: z
    .string({ required_error: 'Start date is required' })
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid start date'),
  endDate: z
    .string({ required_error: 'End date is required' })
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid end date'),
  status: z.enum(Object.values(TRANSACTION_STATUSES)).optional(),
});


export const monthlyTotalsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).optional().default(6),
});


export const objectIdSchema = z.object({ id: objectIdField }).strict();

export const accountIdParamSchema = z
  .object({ accountId: objectIdField })
  .strict();

export const categoryIdParamSchema = z
  .object({ categoryId: objectIdField })
  .strict();