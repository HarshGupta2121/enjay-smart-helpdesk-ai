import { Router } from 'express';
import userController from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  userSearchFilterSchema,
  updateUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema
} from '../validators/user.validator';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN', 'MANAGER']));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     security:
 *       - bearerAuth: []
 */
router.get('/', validate(userSearchFilterSchema), asyncHandler(userController.getUsers));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a specific user by ID
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', asyncHandler(userController.getUser));

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update basic user info (name, avatar)
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', validate(updateUserSchema), asyncHandler(userController.updateUser));

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/role', requireRole(['ADMIN']), validate(updateUserRoleSchema), asyncHandler(userController.updateUserRole));

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', validate(updateUserStatusSchema), asyncHandler(userController.updateUserStatus));

export default router;
