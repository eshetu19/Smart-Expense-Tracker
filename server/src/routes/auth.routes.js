
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import rateLimiter from '../middlewares/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '../validations/auth.validation.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();


router.post(
  '/register',
  rateLimiter.authLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  rateLimiter.authLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/refresh',
  validate(refreshSchema),
  authController.refresh
);

router.post(
  '/forgot-password',
  rateLimiter.passwordResetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail
);


router.post(
  '/logout',
  authMiddleware,
  validate(logoutSchema),
  authController.logout
);

router.post(
  '/logout-all',
  authMiddleware,
  authController.logoutAll
);

router.post(
  '/resend-verification-email',
  authMiddleware,
  validate(resendVerificationSchema),
  authController.resendVerification
);
router.post(
  '/resend-verification-email',
  authMiddleware,
  rateLimiter.authLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);
export default router;