
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { updateSettingsSchema } from '../validations/userSettings.validation.js';
import * as userSettingsController from '../controllers/userSettings.controller.js';

const router = Router();


router.use(authMiddleware);


router.get('/', userSettingsController.get);

router.patch(
  '/',
  validate(updateSettingsSchema),
  userSettingsController.update
);

router.post(
  '/reset',
  userSettingsController.reset
);

export default router;