
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createReportRequestSchema,
  listReportsQuerySchema,
  reportIdSchema,
  reportRangeQuerySchema,
  categoryBreakdownQuerySchema,
  monthlySummaryQuerySchema,
  reportAccountIdParamSchema,
} from '../validations/report.validation.js';
import * as reportController from '../controllers/report.controller.js';

const router = Router();

router.use(authMiddleware);



router.get(
  '/',
  validate(listReportsQuerySchema, 'query'),
  reportController.list
);

router.post(
  '/',
  validate(createReportRequestSchema),
  reportController.createRequest
);


router.get('/dashboard', reportController.dashboard);

router.get(
  '/income-expense',
  validate(reportRangeQuerySchema, 'query'),
  reportController.incomeExpense
);

router.get(
  '/category-breakdown',
  validate(categoryBreakdownQuerySchema, 'query'),
  reportController.categoryBreakdown
);

router.get(
  '/account-summary/:accountId',
  validate(reportAccountIdParamSchema, 'params'),
  validate(reportRangeQuerySchema, 'query'),
  reportController.accountSummary
);

router.get(
  '/monthly-summary',
  validate(monthlySummaryQuerySchema, 'query'),
  reportController.monthlySummary
);

router.get(
  '/cash-flow',
  validate(reportRangeQuerySchema, 'query'),
  reportController.cashFlow
);

router.get('/budget-performance', reportController.budgetPerformance);

router.get('/savings-progress', reportController.savingsProgress);


router.get(
  '/:id',
  validate(reportIdSchema, 'params'),
  reportController.getById
);

router.delete(
  '/:id',
  validate(reportIdSchema, 'params'),
  reportController.remove
);

export default router;