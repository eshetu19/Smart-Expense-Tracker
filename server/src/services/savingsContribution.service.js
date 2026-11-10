
import savingsContributionRepository from '../repositories/savingsContribution.repository.js';
import transactionRepository from '../repositories/transaction.repository.js';
import savingsGoalRepository from '../repositories/savingsGoal.repository.js';
import savingsGoalService from './savingsGoal.service.js';
import ApiError from '../utils/ApiError.js';
import {
  GOAL_STATUSES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
} from '../config/constants.js';

const create = async (userId, data) => {
 
  const goal = await savingsGoalRepository.findByIdAndUser(
    data.savingsGoalId,
    userId
  );
  if (!goal) throw ApiError.notFound('Savings goal not found');

  if (goal.status !== GOAL_STATUSES.ACTIVE) {
    throw ApiError.badRequest(
      `Cannot contribute to a ${goal.status.toLowerCase()} goal`
    );
  }

  
  const transaction = await transactionRepository.findByIdAndUser(
    data.transactionId,
    userId
  );
  if (!transaction) throw ApiError.notFound('Transaction not found');

  if (transaction.status !== TRANSACTION_STATUSES.COMPLETED) {
    throw ApiError.badRequest(
      'Only COMPLETED transactions can contribute to a savings goal'
    );
  }

   const existing =
    await savingsContributionRepository.findByTransaction(data.transactionId);
  if (existing) {
    throw ApiError.conflict('This transaction is already linked to a savings goal');
  }

  
  const contribution = await savingsContributionRepository.create({
    savingsGoal: data.savingsGoalId,
    transaction: data.transactionId,
    note: data.note ?? null,
  });

  
  savingsGoalService
    .tryAutoComplete(data.savingsGoalId)
    .catch(() => {
   });

  return contribution;
};


const getById = async (contributionId, userId) => {
  const contribution = await savingsContributionRepository.findById(contributionId);
  if (!contribution) throw ApiError.notFound('Contribution not found');

  
  const goal = await savingsGoalRepository.findByIdAndUser(
    contribution.savingsGoal,
    userId
  );
  if (!goal) throw ApiError.notFound('Contribution not found');

  return contribution;
};


const listByGoal = async (goalId, userId) => {
  
  const goal = await savingsGoalRepository.findByIdAndUser(goalId, userId);
  if (!goal) throw ApiError.notFound('Savings goal not found');

  return await savingsContributionRepository.findByGoal(goalId);
};

const getByTransaction = async (transactionId, userId) => {
   const transaction = await transactionRepository.findByIdAndUser(
    transactionId,
    userId
  );
  if (!transaction) throw ApiError.notFound('Transaction not found');

  return await savingsContributionRepository.findByTransaction(transactionId);
};

const getTotalForGoal = async (goalId) => {
  return await savingsContributionRepository.sumByGoal(goalId);
};


const remove = async (contributionId, userId) => {
  const contribution = await getById(contributionId, userId);
  await savingsContributionRepository.deleteById(contribution._id);
  return { message: 'Contribution removed' };
};

const deleteByTransaction = async (transactionId) => {
  return await savingsContributionRepository.deleteByTransaction(transactionId);
};

const deleteAllByGoal = async (goalId) => {
  return await savingsContributionRepository.deleteAllByGoal(goalId);
};

export default {
  create,
  getById,
  listByGoal,
  getByTransaction,
  getTotalForGoal,
  remove,
  deleteByTransaction,
  deleteAllByGoal,
};