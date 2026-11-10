
import { z } from 'zod';

const objectIdField = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');


export const createSavingsContributionSchema = z
  .object({
    savingsGoalId: objectIdField,
    transactionId: objectIdField,
    note: z
      .string()
      .max(255, 'Note is too long')
      .nullable()
      .optional(),
  })
  .strict();


export const contributionIdSchema = z.object({ id: objectIdField }).strict();
export const savingsGoalIdParamSchema = z.object({ goalId: objectIdField }).strict();