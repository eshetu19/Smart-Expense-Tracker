
import { z } from 'zod';


const objectIdField = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID format');



export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name cannot be empty')
      .max(100, 'First name is too long')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name cannot be empty')
      .max(100, 'Last name is too long')
      .optional(),
    phoneNumber: z
      .string()
      .max(20, 'Phone number is too long')
      .regex(/^[+\d][\d\s\-()]*$/, 'Phone number contains invalid characters')
      .nullable()
      .optional(),
    profileImage: z
      .string()
      .max(500, 'Profile image path is too long')
      .nullable()
      .optional(),
  })
  .strict();


export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Current password is required' })
      .min(1, 'Current password cannot be empty'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be at most 100 characters'),
  })
  .strict();


export const userIdSchema = z
  .object({
    id: objectIdField,
  })
  .strict();