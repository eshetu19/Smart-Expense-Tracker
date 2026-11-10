
import { z } from 'zod';
import { NOTIFICATION_TYPES } from '../config/constants.js';

const objectIdField = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  isRead: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => v === true || v === 'true')
    .optional(),
  notificationType: z.enum(Object.values(NOTIFICATION_TYPES)).optional(),
});

export const listUnreadQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});


export const notificationIdSchema = z.object({ id: objectIdField }).strict();

export const markAllReadSchema = z.object({}).strict();