import { z } from 'zod';

export const createEmployeeDto = z.object({
  userId: z.string().uuid('Invalid user ID'),
  hotelId: z.string().uuid('Invalid hotel ID'),
  department: z.string().min(2).max(100).trim(),
  position: z.string().min(2).max(100).trim(),
  salary: z.number().positive('Salary must be positive'),
  hireDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .refine((d) => !isNaN(new Date(d).getTime()), 'Invalid date'),
});

export const updateEmployeeDto = createEmployeeDto
  .omit({ userId: true, hotelId: true })
  .partial();

export const employeeQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  hotelId: z.string().uuid().optional(),
  department: z.string().optional(),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeDto>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeDto>;
