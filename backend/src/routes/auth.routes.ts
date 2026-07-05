import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema, registerSchema, refreshTokenSchema, updateProfileSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

// Rate limiting for auth routes to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public Routes
router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh-token', validate(refreshTokenSchema), asyncHandler(authController.refreshToken));

// Protected Routes
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/profile', authenticate, asyncHandler(authController.getProfile));

// Example of a Role-Protected Route (For later use)
router.get(
  '/admin-only',
  authenticate,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    res.json({ message: 'Welcome Admin' });
  })
);


/**
 * @swagger
 * /api/auth/profile:
 *   patch:
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 */
router.patch('/profile', authenticate, validate(updateProfileSchema), asyncHandler(authController.updateProfile));

/**
 * @swagger
 * /api/auth/password:
 *   patch:
 *     summary: Change current user password
 *     security:
 *       - bearerAuth: []
 */
router.patch('/password', authenticate, validate(changePasswordSchema), asyncHandler(authController.changePassword));

export default router;