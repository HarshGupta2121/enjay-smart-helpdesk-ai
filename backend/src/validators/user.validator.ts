import { z } from 'zod';

const emptyAsUndefined = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((val) => (val === '' ? undefined : val), schema);

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.enum(['ADMIN', 'MANAGER', 'ENGINEER', 'CUSTOMER']),
    isActive: z.boolean().default(true),
  }),
});

export const userSearchFilterSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(20),
    search: emptyAsUndefined(z.string().trim().min(2).max(100).optional()),
    role: emptyAsUndefined(z.enum(['ADMIN', 'MANAGER', 'ENGINEER', 'CUSTOMER']).optional()),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'MANAGER', 'ENGINEER', 'CUSTOMER']),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});
