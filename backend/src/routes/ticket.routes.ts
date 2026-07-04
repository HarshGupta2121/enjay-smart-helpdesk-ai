import { Router } from 'express';
import ticketController from '../controllers/ticket.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { createTicketSchema, updateStatusSchema, addCommentSchema } from '../validators/ticket.validator';

const router = Router();

// Secure all ticket endpoints
router.use(authenticate);

// Listing & Creation
router.get('/', asyncHandler(ticketController.getTickets));
router.post('/', validate(createTicketSchema), asyncHandler(ticketController.createTicket));

// Single Ticket Operations
router.get('/:id', asyncHandler(ticketController.getTicket));
router.patch('/:id/status', validate(updateStatusSchema), asyncHandler(ticketController.updateStatus));
router.post('/:id/comments', validate(addCommentSchema), asyncHandler(ticketController.addComment));

export default router;