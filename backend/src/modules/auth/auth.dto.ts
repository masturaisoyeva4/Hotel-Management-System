import { z } from 'zod';

// ─── Password rule ────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ─── Register ─────────────────────────────────────────────
export const registerDto = z.object({
  firstName: z.string().max(100).trim().optional(),
  lastName: z.string().max(100).trim().optional(),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
});

// ─── Login ────────────────────────────────────────────────
export const loginDto = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

// ─── Refresh token ────────────────────────────────────────
export const refreshDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Forgot / Reset password ──────────────────────────────
export const forgotPasswordDto = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const resetPasswordDto = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

// ─── Types ────────────────────────────────────────────────
export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
