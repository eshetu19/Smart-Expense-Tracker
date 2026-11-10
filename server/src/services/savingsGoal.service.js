
import savingsGoalRepository from '../repositories/savingsGoal.repository.js';
import savingsContributionRepository from '../repositories/savingsContribution.repository.js';
import accountService from './account.service.js';
import notificationService from './notification.service.js';
import ApiError from '../utils/ApiError.js';
import {
  GOAL_STATUSES,
  PRIORITIES,
  LIMITS,
  NOTIFICATION_TYPES,
} from '../config/constants.js';


const buildProgress = (goal, contribution) => {
  const savedCents = contribution.totalCents || 0;
  const percent =
    goal.targetAmountCents > 0
      ? Math.min(100, Math.round((savedCents / goal.targetAmountCents) * 100))
      : 0;

  return {
    goal,
    savedCents,
    contributionCount: contribution.count || 0,
    remainingCents: Math.max(0, goal.targetAmountCents - savedCents),
    percent,
    isComplete: savedCents >= goal.targetAmountCents,
  };
};

const create = async (userId, data) => {

  const count = await savingsGoalRepository.countByUser(userId);
  if (count >= LIMITS.MAX_GOALS_PER_USER) {
    throw ApiError.badRequest(
      `Maximum of ${LIMITS.MAX_GOALS_PER_USER} savings goals allowed`
    );
  }

   await accountService.checkOwnership(data.accountId, userId);

  
  return await savingsGoalRepository.create({
    user: userId,
    account: data.accountId,
    name: data.name.trim(),
    description: data.description ?? null,
    targetAmountCents: data.targetAmountCents,
    targetDate: data.targetDate ?? null,
    status: GOAL_STATUSES.ACTIVE,
    priority: data.priority ?? PRIORITIES.MEDIUM,
    icon: data.icon ?? null,
    color: data.color ?? null,
  });
};


const getById = async (goalId, userId) => {
  const goal = await savingsGoalRepository.findByIdAndUserWithAccount(
    goalId,
    userId
  );
  if (!goal) throw ApiError.notFound('Savings goal not found');

  const contribution = await savingsContributionRepository.sumByGoal(goalId);

  return buildProgress(goal, contribution);
};


const list = async (userId, options = {}) => {
  const { includeInactive = false, status } = options;

  let goals;
  if (status) {
    goals = await savingsGoalRepository.findByUserAndStatus(userId, status);
  } else if (includeInactive) {
    goals = await savingsGoalRepository.findByUser(userId);
  } else {
    goals = await savingsGoalRepository.findActiveByUser(userId);
  }

  
  const withProgress = await Promise.all(
    goals.map(async (goal) => {
      const contribution = await savingsContributionRepository.sumByGoal(
        goal._id
      );
      return buildProgress(goal, contribution);
    })
  );

  return withProgress;
};

const update = async (goalId, userId, data) => {
  const goal = await savingsGoalRepository.findByIdAndUser(goalId, userId);
  if (!goal) throw ApiError.notFound('Savings goal not found');

  
  if (
    goal.status === GOAL_STATUSES.CANCELLED ||
    goal.status === GOAL_STATUSES.COMPLETED
  ) {
    throw ApiError.badRequest(
      `Cannot modify a ${goal.status.toLowerCase()} goal`
    );
  }

 
  const allowedFields = [
    'name',
    'description',
    'targetAmountCents',
    'targetDate',
    'priority',
    'icon',
    'color',
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = field === 'name' ? data[field].trim() : data[field];
    }
  }

   
  const newTarget = updates.targetAmountCents ?? goal.targetAmountCents;
  if (newTarget < goal.targetAmountCents) {
    
    const contribution = await savingsContributionRepository.sumByGoal(goalId);
    if (contribution.totalCents >= newTarget) {
      updates.status = GOAL_STATUSES.COMPLETED;
    }
  }

  return await savingsGoalRepository.updateById(goalId, updates);
};



const changeStatus = async (goalId, userId, newStatus) => {
  const goal = await savingsGoalRepository.findByIdAndUser(goalId, userId);
  if (!goal) throw ApiError.notFound('Savings goal not found');

 
  const allowedTransitions = {
    [GOAL_STATUSES.ACTIVE]: [GOAL_STATUSES.PAUSED, GOAL_STATUSES.CANCELLED],
    [GOAL_STATUSES.PAUSED]: [GOAL_STATUSES.ACTIVE, GOAL_STATUSES.CANCELLED],
    [GOAL_STATUSES.COMPLETED]: [],           
    [GOAL_STATUSES.CANCELLED]: [],           
  };

  const allowed = allowedTransitions[goal.status] || [];
  if (!allowed.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot change status from ${goal.status} to ${newStatus}`
    );
  }

  await savingsGoalRepository.updateStatus(goalId, newStatus);
  return { message: `Goal status changed to ${newStatus}` };
};


const remove = async (goalId, userId) => {
  const goal = await savingsGoalRepository.findByIdAndUser(goalId, userId);
  if (!goal) throw ApiError.notFound('Savings goal not found');

  await savingsContributionRepository.deleteAllByGoal(goalId);

   await savingsGoalRepository.deleteById(goalId);

  return { message: 'Savings goal deleted' };
};


const tryAutoComplete = async (goalId) => {
  const goal = await savingsGoalRepository.findById(goalId);
  if (!goal) return null;
  if (goal.status !== GOAL_STATUSES.ACTIVE) return null;

  const contribution = await savingsContributionRepository.sumByGoal(goalId);
  if (contribution.totalCents < goal.targetAmountCents) return null;

  const updated = await savingsGoalRepository.updateStatus(
    goalId,
    GOAL_STATUSES.COMPLETED
  );

  await notificationService.create({
    user: goal.user,
    title: `Goal reached: ${goal.name}`,
    message:
      `Congratulations! You've reached your savings goal ` +
      `"${goal.name}" of ${(goal.targetAmountCents / 100).toFixed(2)}.`,
    notificationType: NOTIFICATION_TYPES.GOAL_REACHED,
    relatedEntity: { entityType: 'SavingsGoal', entityId: goal._id },
  });

  return updated;
};

const getProgress = async (goalId, userId) => {
  return await getById(goalId, userId);   
};

export default {
  create,
  getById,
  list,
  update,
  changeStatus,
  remove,
  tryAutoComplete,
  getProgress,
};