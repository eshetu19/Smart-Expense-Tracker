
import { z } from 'zod';

const objectIdField = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID format');


export const createTagSchema = z
  .object({
    name: z
      .string({ required_error: 'Tag name is required' })
      .min(1, 'Tag name cannot be empty')
      .max(50, 'Tag name is too long'),
    color: z.string().max(20).nullable().optional(),
  })
  .strict();


export const updateTagSchema = z
  .object({
    name: z.string().min(1, 'Tag name cannot be empty').max(50).optional(),
    color: z.string().max(20).nullable().optional(),
  })
  .strict();


export const listTagsQuerySchema = z.object({});

export const tagIdSchema = z.object({ id: objectIdField }).strict();