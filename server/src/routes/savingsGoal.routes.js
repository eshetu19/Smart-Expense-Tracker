
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  changeGoalStatusSchema,
  listSavingsGoalsQuerySchema,
  savingsGoalIdSchema,
  savingsGoalIdParamSchema,
} from '../validations/savingsGoal.validation.js';
import * as savingsGoalController from '../controllers/savingsGoal.controller.js';
import * as savingsContributionController from '../controllers/savingsContribution.controller.js';

const router = Router();

router.use(authMiddleware);


router.get(
  '/',
  validate(listSavingsGoalsQuerySchema, 'query'),
  savingsGoalController.list
);

router.post(
  '/',
  validate(createSavingsGoalSchema),
  savingsGoalController.create
);


router.get(
  '/:goalId/contributions',
  validate(savingsGoalIdParamSchema, 'params'),
  savingsContributionController.listByGoal
);


router.get(
  '/:id',
  validate(savingsGoalIdSchema, 'params'),
  savingsGoalController.getById
);

router.patch(
  '/:id',
  validate(savingsGoalIdSchema, 'params'),
  validate(updateSavingsGoalSchema),
  savingsGoalController.update
);

router.patch(
  '/:id/status',
  validate(savingsGoalIdSchema, 'params'),
  validate(changeGoalStatusSchema),
  savingsGoalController.changeStatus
);

router.delete(
  '/:id',
  validate(savingsGoalIdSchema, 'params'),
  savingsGoalController.remove
);

export default router;