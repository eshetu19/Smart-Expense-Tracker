import '../models/Account.js';
import '../models/Category.js';
import '../models/Tag.js';
import '../models/Transaction.js';
import '../models/TransactionAttachment.js';
import '../models/SavingsContribution.js';





import transactionRepository from '../repositories/transaction.repository.js';
import transactionTagRepository from '../repositories/transactionTag.repository.js';
import transactionAttachmentRepository from '../repositories/transactionAttachment.repository.js';
import accountService from './account.service.js';
import categoryService from './category.service.js';
import tagService from './tag.service.js';
import budgetService from './budget.service.js';
import savingsContributionService from './savingsContribution.service.js';
import fileService from './file.service.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
} from '../config/constants.js';

const balanceDelta = (transactionType, amountCents) => {
  return transactionType === TRANSACTION_TYPES.INCOME
    ? +amountCents
    : -amountCents;
};

const applyBalanceForTransaction = async (transaction, sign = 1) => {
  const delta =
    sign * balanceDelta(transaction.transactionType, transaction.amountCents);
  const accountId =
    transaction.transactionType === TRANSACTION_TYPES.INCOME
      ? transaction.toAccount
      : transaction.fromAccount;

  if (!accountId) return;

  await accountService.adjustBalance(accountId, delta);
};

const validateAccountsForType = (transactionType, fromAccount, toAccount) => {
  if (transactionType === TRANSACTION_TYPES.EXPENSE) {
    if (!fromAccount) throw ApiError.badRequest('Expense requires a fromAccount');
    if (toAccount) throw ApiError.badRequest('Expense must not have a toAccount');
  }
  if (transactionType === TRANSACTION_TYPES.INCOME) {
    if (!toAccount) throw ApiError.badRequest('Income requires a toAccount');
    if (fromAccount) throw ApiError.badRequest('Income must not have a fromAccount');
  }
};

const fireBudgetAlerts = (userId, transaction) => {
  budgetService
    .checkAlerts(userId, transaction)
    .catch((err) => {
      logger.error('Budget alert check failed', {
        transactionId: String(transaction._id),
        error: err.message,
      });
    });
};


const create = async (userId, data) => {
  
  validateAccountsForType(data.transactionType, data.fromAccount, data.toAccount);

  
  const sourceAccount = data.fromAccount
    ? await accountService.checkOwnership(data.fromAccount, userId)
    : null;
  const destAccount = data.toAccount
    ? await accountService.checkOwnership(data.toAccount, userId)
    : null;

  if (
    data.transactionType === TRANSACTION_TYPES.EXPENSE &&
    sourceAccount &&
    sourceAccount.currentBalanceCents < data.amountCents
  ) {
    throw ApiError.badRequest('Insufficient funds in source account');
  }

 
  const category = await categoryService.checkTypeCompatible(
    data.categoryId,
    data.transactionType,
    userId
  );

  
  const tagIds = await tagService.resolveOrCreate(userId, data.tags);

  
  const transaction = await transactionRepository.create({
    user: userId,
    category: data.categoryId ?? null,
    fromAccount: data.fromAccount ?? null,
    toAccount: data.toAccount ?? null,
    transactionType: data.transactionType,
    amountCents: data.amountCents,
    title: data.title.trim(),
    description: data.description ?? null,
    paymentMethod: data.paymentMethod ?? null,
    transactionDate: data.transactionDate,
    status: data.status ?? TRANSACTION_STATUSES.COMPLETED,
    referenceNumber: data.referenceNumber ?? null,
    location: data.location ?? null,
  });

 
  await applyBalanceForTransaction(transaction, 1);

 
  if (tagIds.length > 0) {
    await transactionTagRepository.createMany(
      tagIds.map((tagId) => ({ transaction: transaction._id, tag: tagId }))
    );
  }

  
  fireBudgetAlerts(userId, transaction);

  
  return await transactionRepository.findByIdWithDetails(
    transaction._id,
    userId
  );
};


const getById = async (transactionId, userId) => {
  const transaction = await transactionRepository.findByIdWithDetails(
    transactionId,
    userId
  );
  if (!transaction) throw ApiError.notFound('Transaction not found');
  return transaction;
};


const list = async (userId, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(options.limit, 10) || 20), 100);

  const [items, total] = await Promise.all([
    transactionRepository.findByUser(userId, { ...options, page, limit }),
    transactionRepository.countByUser(userId, options),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};


const update = async (transactionId, userId, data) => {
  const existing = await transactionRepository.findByIdAndUser(
    transactionId,
    userId
  );
  if (!existing) throw ApiError.notFound('Transaction not found');


  const finalType = data.transactionType ?? existing.transactionType;
  const finalAmount = data.amountCents ?? existing.amountCents;
  const finalFrom =
    data.fromAccount !== undefined ? data.fromAccount : existing.fromAccount;
  const finalTo =
    data.toAccount !== undefined ? data.toAccount : existing.toAccount;
  const finalCategory =
    data.categoryId !== undefined ? data.categoryId : existing.category;

  validateAccountsForType(finalType, finalFrom, finalTo);

  
  
  if (finalFrom) await accountService.checkOwnership(finalFrom, userId);
  if (finalTo) await accountService.checkOwnership(finalTo, userId);

  
  await categoryService.checkTypeCompatible(finalCategory, finalType, userId);

  
  const balanceChanged =
    finalType !== existing.transactionType ||
    finalAmount !== existing.amountCents ||
    String(finalFrom) !== String(existing.fromAccount) ||
    String(finalTo) !== String(existing.toAccount);

  if (balanceChanged) {
    await applyBalanceForTransaction(existing, -1);

    const newDelta = balanceDelta(finalType, finalAmount);
    const newAccountId =
      finalType === TRANSACTION_TYPES.INCOME ? finalTo : finalFrom;
    if (newAccountId) {
      await accountService.adjustBalance(newAccountId, newDelta);
    }
  }

  
  const allowedFields = [
    'transactionType',
    'amountCents',
    'title',
    'description',
    'paymentMethod',
    'transactionDate',
    'status',
    'referenceNumber',
    'location',
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field];
  }
  if (data.categoryId !== undefined) updates.category = data.categoryId ?? null;
  if (data.fromAccount !== undefined) updates.fromAccount = data.fromAccount ?? null;
  if (data.toAccount !== undefined) updates.toAccount = data.toAccount ?? null;

  const updated = await transactionRepository.updateById(
    transactionId,
    updates
  );

  
  if (data.tags !== undefined) {
    const newTagIds = await tagService.resolveOrCreate(userId, data.tags);
    await transactionTagRepository.deleteAllByTransaction(transactionId);
    if (newTagIds.length > 0) {
      await transactionTagRepository.createMany(
        newTagIds.map((tagId) => ({ transaction: transactionId, tag: tagId }))
      );
    }
  }

  
  fireBudgetAlerts(userId, updated);

  
  return await transactionRepository.findByIdWithDetails(
    transactionId,
    userId
  );
};


const remove = async (transactionId, userId) => {
  const transaction = await transactionRepository.findByIdAndUser(
    transactionId,
    userId
  );
  if (!transaction) throw ApiError.notFound('Transaction not found');

  
  await applyBalanceForTransaction(transaction, -1);

  
  await transactionTagRepository.deleteAllByTransaction(transactionId);

  
  const attachments =
    await transactionAttachmentRepository.findByTransaction(transactionId);
  for (const attachment of attachments) {
    try {
      await fileService.deleteFile(attachment.filePath);
    } catch (err) {
      logger.warn('Failed to delete attachment file on disk', {
        attachmentId: String(attachment._id),
        filePath: attachment.filePath,
        error: err.message,
      });
    }
  }
  await transactionAttachmentRepository.deleteAllByTransaction(transactionId);

    await savingsContributionService.deleteByTransaction(transactionId);

  
  await transactionRepository.deleteById(transactionId);

  return { message: 'Transaction deleted' };
};


const recent = async (userId, limit = 10) => {
  return await transactionRepository.findRecentByUser(userId, limit);
};

const byAccount = async (accountId, userId) => {
  await accountService.checkOwnership(accountId, userId);
  return await transactionRepository.findByAccount(accountId, userId);
};

const byCategory = async (categoryId, userId, options = {}) => {
  await categoryService.checkOwnership(categoryId, userId);
  return await transactionRepository.findByCategory(
    categoryId,
    userId,
    options
  );
};

const byDateRange = async (userId, startDate, endDate, filters = {}) => {
  return await transactionRepository.findByDateRange(
    userId,
    startDate,
    endDate,
    filters
  );
};


const summaryByType = async (userId, startDate, endDate) => {
  return await transactionRepository.sumByTypeInRange(
    userId,
    startDate,
    endDate
  );
};

const summaryByCategory = async (
  userId,
  startDate,
  endDate,
  transactionType = null
) => {
  return await transactionRepository.sumByCategoryInRange(
    userId,
    startDate,
    endDate,
    transactionType
  );
};

const summaryByAccount = async (userId, accountId, startDate, endDate) => {
  await accountService.checkOwnership(accountId, userId);
  return await transactionRepository.sumByAccountInRange(
    userId,
    accountId,
    startDate,
    endDate
  );
};

const monthlyTotals = async (userId, months = 6) => {
  return await transactionRepository.monthlyTotals(userId, months);
};


export default {
  create,
  getById,
  list,
  update,
  remove,
  recent,
  byAccount,
  byCategory,
  byDateRange,
  summaryByType,
  summaryByCategory,
  summaryByAccount,
  monthlyTotals,
};