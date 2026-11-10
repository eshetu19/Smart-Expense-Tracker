
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  listBudgetsQuerySchema,
  budgetIdSchema,
} from '../validations/budget.validation.js';
import * as budgetController from '../controllers/budget.controller.js';

const router = Router();

router.use(authMiddleware);


router.get(
  '/',
  validate(listBudgetsQuerySchema, 'query'),
  budgetController.list
);

router.post(
  '/',
  validate(createBudgetSchema),
  budgetController.create
);


router.get('/active', budgetController.getActive);


router.get(
  '/:id',
  validate(budgetIdSchema, 'params'),
  budgetController.getById
);

router.get(
  '/:id/progress',
  validate(budgetIdSchema, 'params'),
  budgetController.getProgress
);

router.patch(
  '/:id',
  validate(budgetIdSchema, 'params'),
  validate(updateBudgetSchema),
  budgetController.update
);

router.post(
  '/:id/deactivate',
  validate(budgetIdSchema, 'params'),
  budgetController.deactivate
);

router.delete(
  '/:id',
  validate(budgetIdSchema, 'params'),
  budgetController.remove
);

export default router;