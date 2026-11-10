
import recurringTransactionRepository from '../repositories/recurringTransaction.repository.js';
import accountService from './account.service.js';
import categoryService from './category.service.js';
import transactionService from './transaction.service.js';
import notificationService from './notification.service.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import {
  PERIODS,
  TRANSACTION_TYPES,
  NOTIFICATION_TYPES,
  LIMITS,
} from '../config/constants.js';


const computeNextDate = (baseDate, frequency) => {
  const next = new Date(baseDate);
  switch (frequency) {
    case PERIODS.DAILY:
      next.setDate(next.getDate() + 1);
      break;
    case PERIODS.WEEKLY:
      next.setDate(next.getDate() + 7);
      break;
    case PERIODS.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    case PERIODS.YEARLY:
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      throw ApiError.badRequest(`Unknown frequency: ${frequency}`);
  }
  return next;
};

const advanceToFuture = (baseDate, frequency, now = new Date()) => {
  let next = new Date(baseDate);
  let safety = 0;
  while (next <= now) {
    next = computeNextDate(next, frequency);
    safety++;
    if (safety > 10000) {
       throw ApiError.internal('Recurring schedule advanced too far');
    }
  }
  return next;
};


const create = async (userId, data) => {
  
  const count = await recurringTransactionRepository.countActiveByUser(userId);
  if (count >= LIMITS.MAX_RECURRING_PER_USER) {
    throw ApiError.badRequest(
      `Maximum of ${LIMITS.MAX_RECURRING_PER_USER} recurring transactions allowed`
    );
  }

  
  await accountService.checkOwnership(data.accountId, userId);

  
  if (data.categoryId) {
    await categoryService.checkTypeCompatible(
      data.categoryId,
      data.transactionType,
      userId
    );
  }

  
  const startDate = new Date(data.startDate);
  const endDate = data.endDate ? new Date(data.endDate) : null;
  if (endDate && endDate < startDate) {
    throw ApiError.badRequest('End date must be on or after start date');
  }

  
  const now = new Date();
  const firstExecution =
    startDate > now ? startDate : advanceToFuture(startDate, data.frequency, now);

  
  if (endDate && firstExecution > endDate) {
    throw ApiError.badRequest(
      'The recurring period has already ended; no future execution is possible'
    );
  }

  return await recurringTransactionRepository.create({
    user: userId,
    category: data.categoryId ?? null,
    account: data.accountId,
    title: data.title.trim(),
    description: data.description ?? null,
    transactionType: data.transactionType,
    amountCents: data.amountCents,
    frequency: data.frequency,
    startDate,
    endDate,
    nextExecutionDate: firstExecution,
    lastExecutionDate: null,
    isActive: true,
  });
};


const getById = async (recurringId, userId) => {
  const template = await recurringTransactionRepository.findByIdAndUserWithDetails(
    recurringId,
    userId
  );
  if (!template) throw ApiError.notFound('Recurring transaction not found');
  return template;
};


const list = async (userId, options = {}) => {
  const { includeInactive = false } = options;
  return includeInactive
    ? await recurringTransactionRepository.findByUser(userId)
    : await recurringTransactionRepository.findActiveByUser(userId);
};


const update = async (recurringId, userId, data) => {
  const existing = await recurringTransactionRepository.findByIdAndUser(
    recurringId,
    userId
  );
  if (!existing) throw ApiError.notFound('Recurring transaction not found');

  
  const allowedFields = [
    'title',
    'description',
    'amountCents',
    'endDate',
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = field === 'title' ? data[field].trim() : data[field];
    }
  }

  
  if (data.categoryId !== undefined) {
    if (data.categoryId !== null) {
      await categoryService.checkTypeCompatible(
        data.categoryId,
        existing.transactionType,
        userId
      );
    }
    updates.category = data.categoryId ?? null;
  }

  
  if (data.accountId !== undefined) {
    await accountService.checkOwnership(data.accountId, userId);
    updates.account = data.accountId;
  }

  
  if (data.frequency !== undefined && data.frequency !== existing.frequency) {
    updates.frequency = data.frequency;
    updates.nextExecutionDate = advanceToFuture(
      new Date(),
      data.frequency,
      new Date()
    );
  }

  
  const finalStart = updates.startDate ?? existing.startDate;
  const finalEnd = updates.endDate ?? existing.endDate;
  if (finalEnd && finalEnd < finalStart) {
    throw ApiError.badRequest('End date must be on or after start date');
  }

  return await recurringTransactionRepository.updateById(recurringId, updates);
};


const pause = async (recurringId, userId) => {
  const template = await recurringTransactionRepository.findByIdAndUser(
    recurringId,
    userId
  );
  if (!template) throw ApiError.notFound('Recurring transaction not found');
  if (!template.isActive) return { message: 'Already paused' };

  await recurringTransactionRepository.deactivate(recurringId);
  return { message: 'Recurring transaction paused' };
};

const resume = async (recurringId, userId) => {
  const template = await recurringTransactionRepository.findByIdAndUser(
    recurringId,
    userId
  );
  if (!template) throw ApiError.notFound('Recurring transaction not found');
  if (template.isActive) return { message: 'Already active' };

  
  const nextExecutionDate = advanceToFuture(
    new Date(template.nextExecutionDate),
    template.frequency,
    new Date()
  );

  await recurringTransactionRepository.updateById(recurringId, {
    isActive: true,
    nextExecutionDate,
  });
  return { message: 'Recurring transaction resumed' };
};

const remove = async (recurringId, userId) => {
  const template = await recurringTransactionRepository.findByIdAndUser(
    recurringId,
    userId
  );
  if (!template) throw ApiError.notFound('Recurring transaction not found');

  await recurringTransactionRepository.deleteById(recurringId);
  return { message: 'Recurring transaction deleted' };
};




const executeOne = async (template) => {
  
  const transactionInput = {
    transactionType: template.transactionType,
    amountCents: template.amountCents,
    title: template.title,
    description: template.description ?? null,
    transactionDate: template.nextExecutionDate,
    categoryId: template.category ? (template.category._id ?? template.category) : null,
    fromAccount:
      template.transactionType === TRANSACTION_TYPES.EXPENSE
        ? template.account
        : null,
    toAccount:
      template.transactionType === TRANSACTION_TYPES.INCOME
        ? template.account
        : null,
    referenceNumber: `recurring:${template._id}:${new Date(template.nextExecutionDate).toISOString()}`,
  };

  
  const transaction = await transactionService.create(
    template.user,
    transactionInput
  );

  
  const nextExecutionDate = computeNextDate(
    template.nextExecutionDate,
    template.frequency
  );

 
  const endDate = template.endDate ? new Date(template.endDate) : null;
  const stillActive = !endDate || nextExecutionDate <= endDate;

  await recurringTransactionRepository.updateExecutionDates(
    template._id,
    template.nextExecutionDate,
    nextExecutionDate
  );

  
  if (!stillActive) {
    await recurringTransactionRepository.deactivate(template._id);
  }

  return { transaction, nextExecutionDate, stillActive };
};


const executeDue = async (asOf = new Date()) => {
  const due = await recurringTransactionRepository.findDueForExecution(asOf);
  let executed = 0;
  let failed = 0;

  for (const template of due) {
    try {
      
      if (template.lastExecutionDate) {
        const alreadyRan =
          new Date(template.lastExecutionDate).getTime() ===
          new Date(template.nextExecutionDate).getTime();
        if (alreadyRan) {
          
          logger.warn('Recurring template has already executed its current occurrence', {
            recurringId: String(template._id),
          });
          continue;
        }
      }

       const account = await accountService.checkOwnership(
        template.account._id ?? template.account,
        template.user._id ?? template.user
      );
      if (!account.isActive) {
        logger.warn('Recurring template skipped — account inactive', {
          recurringId: String(template._id),
        });
        await recurringTransactionRepository.deactivate(template._id);
        continue;
      }

     
      const result = await executeOne(template);
      executed++;

      notificationService
        .create({
          user: template.user,
          title: `Recurring transaction executed: ${template.title}`,
          message:
            `${template.title} ran on ${new Date(template.nextExecutionDate).toISOString().split('T')[0]}. ` +
            `Amount: ${(template.amountCents / 100).toFixed(2)}.`,
          notificationType: NOTIFICATION_TYPES.RECURRING_DUE,
          relatedEntity: { entityType: 'RecurringTransaction', entityId: template._id },
        })
        .catch((err) => {
          logger.error('Failed to create recurring execution notification', {
            recurringId: String(template._id),
            error: err.message,
          });
        });

      
    } catch (err) {
      failed++;
      logger.error('Recurring execution failed', {
        recurringId: String(template._id),
        error: err.message,
      });

      
      notificationService
        .create({
          user: template.user,
          title: `Recurring transaction failed: ${template.title}`,
          message:
            `We couldn't run "${template.title}" on ` +
            `${new Date(template.nextExecutionDate).toISOString().split('T')[0]}. ` +
            `Reason: ${err.message}.`,
          notificationType: NOTIFICATION_TYPES.RECURRING_FAILED,
          relatedEntity: { entityType: 'RecurringTransaction', entityId: template._id },
        })
        .catch((notifyErr) => {
          logger.error('Failed to create failure notification', {
            recurringId: String(template._id),
            error: notifyErr.message,
          });
        });
    }
  }

  return { processed: due.length, executed, failed };
};


const upcoming = async (userId, days = 7) => {
  return await recurringTransactionRepository.findUpcomingInDays(userId, days);
};


export default {
  create,
  getById,
  list,
  update,
  pause,
  resume,
  remove,
  executeOne,
  executeDue,
  upcoming,
};