
import { z } from 'zod';

const objectIdField = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const attachmentIdSchema = z.object({ id: objectIdField }).strict();

export const transactionIdParamSchema = z
  .object({ transactionId: objectIdField })
  .strict();