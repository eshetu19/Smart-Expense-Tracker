
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createRecurringTransactionSchema,
  updateRecurringTransactionSchema,
  listRecurringTransactionsQuerySchema,
  recurringTransactionIdSchema,
} from '../validations/recurringTransaction.validation.js';
import * as recurringTransactionController from '../controllers/recurringTransaction.controller.js';

const router = Router();

router.use(authMiddleware);


router.get(
  '/',
  validate(listRecurringTransactionsQuerySchema, 'query'),
  recurringTransactionController.list
);

router.post(
  '/',
  validate(createRecurringTransactionSchema),
  recurringTransactionController.create
);


router.get(
  '/:id',
  validate(recurringTransactionIdSchema, 'params'),
  recurringTransactionController.getById
);

router.patch(
  '/:id',
  validate(recurringTransactionIdSchema, 'params'),
  validate(updateRecurringTransactionSchema),
  recurringTransactionController.update
);


router.post(
  '/:id/pause',
  validate(recurringTransactionIdSchema, 'params'),
  recurringTransactionController.pause
);

router.post(
  '/:id/resume',
  validate(recurringTransactionIdSchema, 'params'),
  recurringTransactionController.resume
);

router.delete(
  '/:id',
  validate(recurringTransactionIdSchema, 'params'),
  recurringTransactionController.remove
);

export default router;