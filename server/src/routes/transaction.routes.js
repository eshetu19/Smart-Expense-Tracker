
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuerySchema,
  transactionIdSchema,
  recentTransactionsQuerySchema,
  dateRangeQuerySchema,
  accountIdParamSchema,
  categoryIdParamSchema,
} from '../validations/transaction.validation.js';
import { transactionIdParamSchema } from '../validations/transactionAttachment.validation.js';
import * as transactionController from '../controllers/transaction.controller.js';
import * as transactionAttachmentController from '../controllers/transactionAttachment.controller.js';

const router = Router();

router.use(authMiddleware);


router.get(
  '/',
  validate(listTransactionsQuerySchema, 'query'),
  transactionController.list
);

router.post(
  '/',
  validate(createTransactionSchema),
  transactionController.create
);


router.get(
  '/recent',
  validate(recentTransactionsQuerySchema, 'query'),
  transactionController.recent
);


router.get(
  '/by-date-range',
  validate(dateRangeQuerySchema, 'query'),
  transactionController.byDateRange
);


router.get(
  '/by-account/:accountId',
  validate(accountIdParamSchema, 'params'),
  transactionController.byAccount
);


router.get(
  '/by-category/:categoryId',
  validate(categoryIdParamSchema, 'params'),
  transactionController.byCategory
);


router.post(
  '/:transactionId/attachments',
  validate(transactionIdParamSchema, 'params'),
  upload.transactionAttachments,
  transactionAttachmentController.create
);

router.get(
  '/:transactionId/attachments',
  validate(transactionIdParamSchema, 'params'),
  transactionAttachmentController.list
);


router.get(
  '/:id',
  validate(transactionIdSchema, 'params'),
  transactionController.getById
);

router.patch(
  '/:id',
  validate(transactionIdSchema, 'params'),
  validate(updateTransactionSchema),
  transactionController.update
);

router.delete(
  '/:id',
  validate(transactionIdSchema, 'params'),
  transactionController.remove
);

export default router;