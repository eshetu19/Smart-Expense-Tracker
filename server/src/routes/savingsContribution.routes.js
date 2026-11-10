
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createSavingsContributionSchema,
  contributionIdSchema,
} from '../validations/savingsContribution.validation.js';
import * as savingsContributionController from '../controllers/savingsContribution.controller.js';

const router = Router();

router.use(authMiddleware);


router.post(
  '/',
  validate(createSavingsContributionSchema),
  savingsContributionController.create
);


router.get(
  '/by-transaction/:transactionId',
  savingsContributionController.getByTransaction
);


router.get(
  '/:id',
  validate(contributionIdSchema, 'params'),
  savingsContributionController.getById
);

router.delete(
  '/:id',
  validate(contributionIdSchema, 'params'),
  savingsContributionController.remove
);

export default router;