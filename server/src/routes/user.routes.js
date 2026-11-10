
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../validations/user.validation.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.use(authMiddleware);


router.get('/profile', userController.getMe);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.patch('/password', validate(changePasswordSchema), userController.changePassword);
router.put('/profile-picture', upload.profilePicture, userController.updateAvatar);


router.delete('/account', userController.deactivate);

export default router;