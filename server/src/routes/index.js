// routes/index.js
import { Router } from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import userSettingsRoutes from './userSettings.routes.js';
import accountRoutes from './account.routes.js';
import categoryRoutes from './category.routes.js';
import tagRoutes from './tag.routes.js';
import transactionRoutes from './transaction.routes.js';
import transactionAttachmentRoutes from './transactionAttachment.routes.js';
import budgetRoutes from './budget.routes.js';
import savingsGoalRoutes from './savingsGoal.routes.js';
import savingsContributionRoutes from './savingsContribution.routes.js';
import recurringTransactionRoutes from './recurringTransaction.routes.js';
import notificationRoutes from './notification.routes.js';
import reportRoutes from './report.routes.js';   
const router = Router();

router.use('/auth', authRoutes);
router.use('/users/settings', userSettingsRoutes);
router.use('/users', userRoutes);
router.use('/attachments', transactionAttachmentRoutes);
router.use('/accounts', accountRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/savings-goals', savingsGoalRoutes);
router.use('/contributions', savingsContributionRoutes);
router.use('/recurring-transactions', recurringTransactionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);   
export default router;