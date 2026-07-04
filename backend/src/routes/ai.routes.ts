import { Router } from 'express';
import aiController from '../controllers/ai.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Ensure all AI actions are strictly authenticated
router.use(authenticate);

// Only Agents/Engineers/Admins should be able to generate AI drafts, not customers
router.post(
  '/:id/ai/reply',
  requireRole(['ADMIN', 'MANAGER', 'ENGINEER']),
  asyncHandler(aiController.generateReply)
);

export default router;