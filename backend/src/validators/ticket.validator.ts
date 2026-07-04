import { z } from 'zod';
import { TicketPriority, TicketSource, TicketType, TicketCategory, TicketStatus } from '@prisma/client';
const emptyAsUndefined = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((val) => (val === '' ? undefined : val), schema);


// ==========================================
//              SHARED SCHEMAS
// ==========================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const attachmentSchema = z.object({
  fileName: z.string().trim().min(1, 'File name cannot be empty').max(255),
  fileSize: z.number().int().max(MAX_FILE_SIZE, 'File size must be under 10MB'),
  mimeType: z.string().refine((mime) => ALLOWED_MIME_TYPES.includes(mime), {
    message: 'Invalid file type. Allowed: JPG, PNG, PDF, CSV, DOC, DOCX',
  }),
  url: z.string().url('Invalid attachment URL'),
  checksum: z.string().optional(), // For virus/tamper verification
});

// ==========================================
//             TICKET CREATION
// ==========================================

export const createTicketSchema = z.object({
  body: z.object({
    // Prevent empty strings and excessive lengths
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000, 'Description cannot exceed 5000 characters'),

    // Strict Enum constraints
    priority: emptyAsUndefined(z.nativeEnum(TicketPriority).optional()),
    source: z.nativeEnum(TicketSource).optional(),
    type: z.nativeEnum(TicketType).optional(),
    category: emptyAsUndefined(z.nativeEnum(TicketCategory).optional()),

    // Optional file upload constraints
    attachments: z.array(attachmentSchema).max(5, 'Maximum of 5 attachments allowed per ticket').optional(),
  }),
});

// ==========================================
//             TICKET MUTATIONS
// ==========================================

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(TicketStatus),
    // Mandatory for optimistic locking to prevent lost updates
    version: z.number().int().positive('Version is required for optimistic locking'),
  }),
});

export const assignTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    assigneeId: z.string().uuid('Invalid assignee ID format').nullable(), // Null to unassign
    version: z.number().int().positive('Version is required for optimistic locking'),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    content: z.string().trim().min(1, 'Comment cannot be empty').max(3000, 'Comment cannot exceed 3000 characters'),
    isInternal: z.boolean().default(false),
    attachments: z.array(attachmentSchema).max(5, 'Maximum of 5 attachments allowed per comment').optional(),
  }),
});

// ==========================================
//          PAGINATION & SEARCHING
// ==========================================

export const paginationSchema = z.object({
  query: z.object({
    // Express query params are strings; Zod will transform them to numbers
    page: z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).default(20),
  }),
});

export const searchFilterSchema = z.object({
  query: z.object({
    // Pagination included
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(20),

    // Strict filters
    status: emptyAsUndefined(z.nativeEnum(TicketStatus).optional()),
    priority: emptyAsUndefined(z.nativeEnum(TicketPriority).optional()),
    category: emptyAsUndefined(z.nativeEnum(TicketCategory).optional()),

    // Relation filters
    assigneeId: emptyAsUndefined(z.string().uuid('Invalid assignee ID format').optional()),
    requesterId: emptyAsUndefined(z.string().uuid('Invalid requester ID format').optional()),

    // Safe text search (trimmed, min length prevents wildcard performance issues)
    search: emptyAsUndefined(z.string().trim().min(2, 'Search term too short').max(100, 'Search term too long').optional()),

    // Sorting controls
    sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});