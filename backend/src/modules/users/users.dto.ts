import { z } from 'zod';

export const updateProfileDto = z.object({
  firstName: z.string().min(2).max(100).trim(),
  lastName:  z.string().min(2).max(100).trim(),
  phone:     z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
});

export const changePasswordDto = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
export type ChangePasswordDto = z.infer<typeof changePasswordDto>;
