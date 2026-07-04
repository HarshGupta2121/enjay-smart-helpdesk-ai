import { z } from 'zod';

const emptyAsUndefined = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((val) => (val === '' ? undefined : val), schema);

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
