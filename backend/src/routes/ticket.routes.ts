import { Router } from 'express';
import ticketController from '../controllers/ticket.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import rateLimit from 'express-rate-limit';

import {
  createTicketSchema,
  updateStatusSchema,
  addCommentSchema,
  searchFilterSchema
} from '../validators/ticket.validator';

const router = Router();

// ==========================================
//             RATE LIMITERS
// ==========================================
// Protects ticket creation from spam/abuse
const createTicketLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 tickets per IP per window
  message: 'Too many tickets created from this IP, please try again later',
});

// Protects comment endpoints from rapid spam
const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // max 50 comments per IP per window
  message: 'You are commenting too fast, please slow down',
});

// ==========================================
//             GLOBAL MIDDLEWARE
// ==========================================
// All ticket endpoints strictly require a valid JWT
router.use(authenticate);

// ==========================================
//             RESTFUL ROUTES
// ==========================================

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  createTicketLimiter,
  validate(createTicketSchema),
  asyncHandler(ticketController.createTicket)
);


/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Fetch a list of tickets with pagination and filtering
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  validate(searchFilterSchema),
  asyncHandler(ticketController.getTickets)
);

/**
 * @swagger
 * /api/tickets/stats:
 *   get:
 *     summary: Fetch dashboard statistics for tickets
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/stats',
  asyncHandler(ticketController.getDashboardStats)
);

/**
 * @swagger
 * /api/tickets/{id}:

 *   get:
 *     summary: Fetch a ticket with its unified timeline
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  asyncHandler(ticketController.getTicket)
);

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status (State Machine)
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/status',
  validate(updateStatusSchema),
  asyncHandler(ticketController.updateStatus)
);

/**
 * @swagger
 * /api/tickets/{id}/comments:
 *   post:
 *     summary: Add a comment to a ticket thread
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/comments',
  commentLimiter,
  validate(addCommentSchema),
  asyncHandler(ticketController.addComment)
);

export default router;