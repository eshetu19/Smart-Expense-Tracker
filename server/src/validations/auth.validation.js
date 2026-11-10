
import { z } from 'zod';


const emailField = z
  .string({ required_error: 'Email is required' })
  .email('Please provide a valid email')
  .max(255, 'Email is too long');

const passwordField = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters');

const usernameField = z
  .string({ required_error: 'Username is required' })
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username can only contain letters, numbers, and underscores'
  );

const nameField = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .min(1, `${label} cannot be empty`)
    .max(100, `${label} is too long`);


export const registerSchema = z
  .object({
    username: usernameField,
    email: emailField,
    password: passwordField,
    firstName: nameField('First name'),
    lastName: nameField('Last name'),
    phoneNumber: z
      .string()
      .max(20, 'Phone number is too long')
      .regex(/^[+\d][\d\s\-()]*$/, 'Phone number contains invalid characters')
      .optional(),
  })
  .strict();


export const loginSchema = z
  .object({
    email: emailField,
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
    deviceInfo: z
      .object({
        deviceName: z.string().max(100).optional(),
      })
      .optional(),
  })
  .strict();


export const refreshSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, 'Refresh token cannot be empty')
      .optional(),
  })
  .strict();

export const logoutSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, 'Refresh token cannot be empty')
      .optional(),
  })
  .strict();


export const forgotPasswordSchema = z
  .object({
    email: emailField,
  })
  .strict();


export const resetPasswordSchema = z
  .object({
    token: z
      .string({ required_error: 'Reset token is required' })
      .min(1, 'Reset token cannot be empty'),
    newPassword: passwordField,
  })
  .strict();


export const verifyEmailSchema = z
  .object({
    token: z
      .string({ required_error: 'Verification token is required' })
      .min(1, 'Verification token cannot be empty'),
  })
  .strict();


export const resendVerificationSchema = z.object({}).strict();