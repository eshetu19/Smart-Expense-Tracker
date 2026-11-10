
import { z } from 'zod';
import {
  REPORT_TYPES,
  EXPORT_FORMATS,
  TRANSACTION_TYPES,
} from '../config/constants.js';

const objectIdField = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const createReportRequestSchema = z
  .object({
    reportType: z.enum(Object.values(REPORT_TYPES), {
      required_error: 'Report type is required',
      invalid_type_error: `Report type must be one of: ${Object.values(
        REPORT_TYPES
      ).join(', ')}`,
    }),
    exportFormat: z.enum(Object.values(EXPORT_FORMATS), {
      required_error: 'Export format is required',
      invalid_type_error: `Export format must be one of: ${Object.values(
        EXPORT_FORMATS
      ).join(', ')}`,
    }),
    filters: z
      .object({
        startDate: z
          .string({ required_error: 'Start date is required in filters' })
          .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid start date'),
        endDate: z
          .string({ required_error: 'End date is required in filters' })
          .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid end date'),
        transactionType: z.enum(Object.values(TRANSACTION_TYPES)).optional(),
      })
      .refine(
        (f) => new Date(f.endDate) >= new Date(f.startDate),
        {
          message: 'End date must be on or after start date',
          path: ['endDate'],
        }
      ),
  })
  .strict();


export const listReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  reportType: z.enum(Object.values(REPORT_TYPES)).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
});


export const reportIdSchema = z.object({ id: objectIdField }).strict();


export const reportRangeQuerySchema = z.object({
  startDate: z
    .string({ required_error: 'Start date is required' })
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid start date'),
  endDate: z
    .string({ required_error: 'End date is required' })
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid end date'),
});


export const categoryBreakdownQuerySchema = reportRangeQuerySchema.extend({
  transactionType: z.enum(Object.values(TRANSACTION_TYPES)).optional(),
});


export const monthlySummaryQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).optional().default(6),
});


export const reportAccountIdParamSchema = z
  .object({ accountId: objectIdField })
  .strict();