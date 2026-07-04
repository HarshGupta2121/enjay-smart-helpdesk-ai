import { z } from 'zod';
import { AssignmentStrategy, TeamRole } from '@prisma/client';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Team name must be at least 2 characters').max(100),
    description: z.string().trim().max(500).optional(),
    assignmentStrategy: z.nativeEnum(AssignmentStrategy).optional().default('MANUAL'),
    firstResponseSlaHrs: z.number().positive().max(720).optional().default(4),
    resolutionSlaHrs: z.number().positive().max(720).optional().default(24),
  }),
});

export const addTeamMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid team ID format'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID format'),
    role: z.nativeEnum(TeamRole).optional().default('AGENT'),
  }),
});

export const createQueueSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid team ID format'),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Queue name must be at least 2 characters').max(100),
  }),
});