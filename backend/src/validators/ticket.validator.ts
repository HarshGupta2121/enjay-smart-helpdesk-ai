import { z } from 'zod';
import { TicketPriority, TicketSource, TicketType, TicketCategory, TicketStatus } from '@prisma/client';

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title is too long'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    priority: z.nativeEnum(TicketPriority).optional(),
    source: z.nativeEnum(TicketSource).optional(),
    type: z.nativeEnum(TicketType).optional(),
    category: z.nativeEnum(TicketCategory).optional(),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID'),
  }),
  body: z.object({
    status: z.nativeEnum(TicketStatus),
    version: z.number().int().positive('Version is required for optimistic locking'),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty'),
    isInternal: z.boolean().default(false),
  }),
});