
import budgetRepository from '../repositories/budget.repository.js';
import transactionRepository from '../repositories/transaction.repository.js';
import categoryService from './category.service.js';
import userSettingsService from './userSettings.service.js';
import notificationService from './notification.service.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import {
  PERIODS,
  LIMITS,
  NOTIFICATION_TYPES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
} from '../config/constants.js';



// ─────────────────────────────────────────────────────────────
// computeEndDate — last moment of the period, in UTC
// ─────────────────────────────────────────────────────────────
const computeEndDate = (startDate, period) => {
  const start = new Date(startDate);

  // Extract UTC components from the start date
  const year = start.getUTCFullYear();
  const month = start.getUTCMonth();
  const day = start.getUTCDate();

  let end;

  switch (period) {
    case PERIODS.DAILY:
      // Same UTC day, 23:59:59.999
      end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      break;

    case PERIODS.WEEKLY:
      // Same UTC day + 6 days, 23:59:59.999
      end = new Date(Date.UTC(year, month, day + 6, 23, 59, 59, 999));
      break;

    case PERIODS.MONTHLY:
      // Last day of the same UTC month, 23:59:59.999
      // Date.UTC(year, month+1, 0, ...) = day 0 of next month = last day of current
      end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      break;

    case PERIODS.YEARLY:
      // Last day of the same UTC month next year, 23:59:59.999
      end = new Date(Date.UTC(year + 1, month + 1, 0, 23, 59, 59, 999));
      break;

    default:
      throw ApiError.badRequest(`Unknown period: ${period}`);
  }

  return end;
};

// ─────────────────────────────────────────────────────────────
// nextPeriodStart — first moment of the next period, in UTC
// ─────────────────────────────────────────────────────────────
const nextPeriodStart = (currentStart, period) => {
  const current = new Date(currentStart);

  const year = current.getUTCFullYear();
  const month = current.getUTCMonth();
  const day = current.getUTCDate();

  switch (period) {
    case PERIODS.DAILY:
      return new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0));

    case PERIODS.WEEKLY:
      return new Date(Date.UTC(year, month, day + 7, 0, 0, 0, 0));

    case PERIODS.MONTHLY:
      return new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));

    case PERIODS.YEARLY:
      return new Date(Date.UTC(year + 1, month, 1, 0, 0, 0, 0));

    default:
      throw ApiError.badRequest(`Unknown period: ${period}`);
  }
};


const create = async (userId, data) => {
  const count = await budgetRepository.countActiveByUser(userId);
  if (count >= LIMITS.MAX_BUDGETS_PER_USER) {
    throw ApiError.badRequest(
      `Maximum of ${LIMITS.MAX_BUDGETS_PER_USER} active budgets allowed`
    );
  }

  if (data.categoryId) {
    const category = await categoryService.checkOwnership(
      data.categoryId,
      userId
    );
    if (category.transactionType !== TRANSACTION_TYPES.EXPENSE) {
      throw ApiError.badRequest('Budgets can only be set for EXPENSE categories');
    }
  }

  const endDate = data.endDate ?? computeEndDate(data.startDate, data.period);

  if (new Date(endDate) < new Date(data.startDate)) {
    throw ApiError.badRequest('End date must be on or after start date');
  }

  const overlapping = await budgetRepository.findActiveByCategoryForDate(
    userId,
    data.categoryId ?? null,
    data.startDate
  );
  if (overlapping) {
    throw ApiError.conflict(
      'You already have an active budget for this category during this period. ' +
        'Deactivate the existing budget first, or wait for it to expire.'
    );
  }

  const userSettings = await userSettingsService.getByUser(userId);
  const alertPercentage =
    data.alertPercentage ?? userSettings.defaultBudgetAlertPercentage ?? 80;

  return await budgetRepository.create({
    user: userId,
    category: data.categoryId ?? null,
    name: data.name.trim(),
    amountCents: data.amountCents,
    period: data.period,
    startDate: data.startDate,
    endDate,
    alertPercentage,
    isActive: true,
  });
};



const getById = async (budgetId, userId) => {
  const budget = await budgetRepository.findByIdAndUser(budgetId, userId);
  if (!budget) throw ApiError.notFound('Budget not found');
  return budget;
};

const list = async (userId, options = {}) => {
  const { includeInactive = false } = options;
  return includeInactive
    ? await budgetRepository.findByUser(userId)
    : await budgetRepository.findActiveByUser(userId);
};

const getActive = async (userId) => {
  return await budgetRepository.findActiveForDate(userId, new Date());
};


const update = async (budgetId, userId, data) => {
  const existing = await budgetRepository.findByIdAndUser(budgetId, userId);
  if (!existing) throw ApiError.notFound('Budget not found');

  const allowedFields = [
    'name',
    'amountCents',
    'alertPercentage',
    'startDate',
    'endDate',
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = field === 'name' ? data[field].trim() : data[field];
    }
  }

  if (data.categoryId !== undefined && data.categoryId !== null) {
    const category = await categoryService.checkOwnership(
      data.categoryId,
      userId
    );
    if (category.transactionType !== TRANSACTION_TYPES.EXPENSE) {
      throw ApiError.badRequest('Budgets can only be set for EXPENSE categories');
    }
    updates.category = data.categoryId;
  } else if (data.categoryId === null) {
    updates.category = null;
  }

  const finalStart = updates.startDate ?? existing.startDate;
  const finalEnd = updates.endDate ?? existing.endDate;
  if (new Date(finalEnd) < new Date(finalStart)) {
    throw ApiError.badRequest('End date must be on or after start date');
  }

  const categoryChanged = data.categoryId !== undefined;
  const datesChanged =
    data.startDate !== undefined || data.endDate !== undefined;
  if (categoryChanged || datesChanged) {
    const overlapping = await budgetRepository.findActiveByCategoryForDate(
      userId,
      updates.category !== undefined ? updates.category : existing.category,
      finalStart
    );
    if (overlapping && !overlapping._id.equals(existing._id)) {
      throw ApiError.conflict('Another active budget already covers this period');
    }
  }

  return await budgetRepository.updateById(budgetId, updates);
};


const deactivate = async (budgetId, userId) => {
  const budget = await budgetRepository.findByIdAndUser(budgetId, userId);
  if (!budget) throw ApiError.notFound('Budget not found');
  if (!budget.isActive) return { message: 'Budget already inactive' };

  await budgetRepository.deactivate(budgetId);
  return { message: 'Budget deactivated' };
};

const remove = async (budgetId, userId) => {
  const budget = await budgetRepository.findByIdAndUser(budgetId, userId);
  if (!budget) throw ApiError.notFound('Budget not found');

  await budgetRepository.deleteById(budgetId);
  return { message: 'Budget deleted' };
};


const getSpend = async (budget, userId) => {
  if (budget.category) {
    const byCat = await transactionRepository.sumByCategoryInRange(
      userId,
      budget.startDate,
      budget.endDate,
      TRANSACTION_TYPES.EXPENSE
    );
    const row = byCat.find((r) => String(r._id) === String(budget.category));
    return { totalCents: row?.total ?? 0, count: row?.count ?? 0 };
  }

  const summary = await transactionRepository.sumByTypeInRange(
    userId,
    budget.startDate,
    budget.endDate
  );
  return summary.EXPENSE;
};


const checkAlerts = async (userId, transaction) => {
  if (transaction.transactionType !== TRANSACTION_TYPES.EXPENSE) return;
  if (transaction.status !== TRANSACTION_STATUSES.COMPLETED) return;

  const activeBudgets = await budgetRepository.findActiveForDate(
    userId,
    transaction.transactionDate
  );

  for (const budget of activeBudgets) {
    if (
      budget.category &&
      String(budget.category._id ?? budget.category) !==
        String(transaction.category)
    ) {
      continue;
    }

    const spend = await getSpend(budget, userId);
    const percentUsed = (spend.totalCents / budget.amountCents) * 100;

    if (spend.totalCents >= budget.amountCents) {
      await notificationService.create({
        user: userId,
        title: `Budget exceeded: ${budget.name}`,
        message:
          `You've spent ${(spend.totalCents / 100).toFixed(2)} of your ` +
          `${(budget.amountCents / 100).toFixed(2)} budget for "${budget.name}".`,
        notificationType: NOTIFICATION_TYPES.BUDGET_EXCEEDED,
        relatedEntity: { entityType: 'Budget', entityId: budget._id },
      });
    } else if (percentUsed >= budget.alertPercentage) {
      await notificationService.create({
        user: userId,
        title: `Budget alert: ${budget.name}`,
        message:
          `You've used ${Math.round(percentUsed)}% of your ` +
          `"${budget.name}" budget ` +
          `(${(spend.totalCents / 100).toFixed(2)} of ` +
          `${(budget.amountCents / 100).toFixed(2)}).`,
        notificationType: NOTIFICATION_TYPES.BUDGET_ALERT,
        relatedEntity: { entityType: 'Budget', entityId: budget._id },
      });
    }
  }
};


const renewExpired = async () => {
  const expired = await budgetRepository.findExpiredActive(new Date());
  let renewed = 0;

  for (const budget of expired) {
    try {
      await budgetRepository.deactivate(budget._id);

      const newStart = nextPeriodStart(budget.startDate, budget.period);
      const newEnd = computeEndDate(newStart, budget.period);

      let candidateStart = newStart;
      let candidateEnd = newEnd;
      const now = new Date();
      while (candidateEnd < now) {
        candidateStart = nextPeriodStart(candidateStart, budget.period);
        candidateEnd = computeEndDate(candidateStart, budget.period);
      }

      await budgetRepository.create({
        user: budget.user,
        category: budget.category,
        name: budget.name,
        amountCents: budget.amountCents,
        period: budget.period,
        startDate: candidateStart,
        endDate: candidateEnd,
        alertPercentage: budget.alertPercentage,
        isActive: true,
      });

      renewed++;
    } catch (err) {
      logger.error('Budget renewal failed', {
        budgetId: String(budget._id),
        error: err.message,
      });
    }
  }

  return { processed: expired.length, renewed };
};

const getProgress = async (budget, userId) => {
  const spend = await getSpend(budget, userId);
  const percentUsed =
    budget.amountCents > 0
      ? Math.round((spend.totalCents / budget.amountCents) * 100)
      : 0;

  return {
    budget,
    spentCents: spend.totalCents,
    spentCount: spend.count,
    remainingCents: Math.max(0, budget.amountCents - spend.totalCents),
    percentUsed,
    isOverBudget: spend.totalCents > budget.amountCents,
    isAlert: percentUsed >= budget.alertPercentage,
  };
};

export default {
  create,
  getById,
  list,
  getActive,
  update,
  deactivate,
  remove,
  getSpend,
  checkAlerts,
  renewExpired,
  getProgress,
};