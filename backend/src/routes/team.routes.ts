import { Router } from 'express';
import teamController from '../controllers/team.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { createTeamSchema, addTeamMemberSchema, createQueueSchema } from '../validators/team.validator';

const router = Router();

// All team management routes require strictly authenticated Admins or Managers
router.use(authenticate);
router.use(requireRole(['ADMIN', 'MANAGER']));

router.post('/', validate(createTeamSchema), asyncHandler(teamController.createTeam));

router.post('/:id/members', validate(addTeamMemberSchema), asyncHandler(teamController.addMember));
router.get('/:id/members', asyncHandler(teamController.getTeamMembers));

router.post('/:id/queues', validate(createQueueSchema), asyncHandler(teamController.createQueue));

export default router;