
import mongoose from 'mongoose';
import SavingsContribution from '../models/SavingsContribution.js';

const findById = (id) => SavingsContribution.findById(id);

const findByGoal = (savingsGoalId) =>
  SavingsContribution.find({ savingsGoal: savingsGoalId })
    .populate('transaction', 'title amountCents transactionDate status')
    .sort({ createdAt: -1 });

const findByTransaction = (transactionId) =>
  SavingsContribution.findOne({ transaction: transactionId })
    .populate('savingsGoal', 'name targetAmountCents status');

const existsByTransaction = async (transactionId) => {
  const count = await SavingsContribution.countDocuments({
    transaction: transactionId,
  });
  return count > 0;
};

const countByGoal = async (savingsGoalId) =>
  SavingsContribution.countDocuments({ savingsGoal: savingsGoalId });

const sumByGoal = async (savingsGoalId) => {
  const result = await SavingsContribution.aggregate([
    {
      $match: {
        savingsGoal: new mongoose.Types.ObjectId(savingsGoalId),
      },
    },
    {
      $lookup: {
        from: 'transactions',
        localField: 'transaction',
        foreignField: '_id',
        as: 'transaction',
      },
    },
    { $unwind: '$transaction' },
    {
      $match: {
        'transaction.status': 'COMPLETED',
      },
    },
    {
      $group: {
        _id: null,
        totalCents: { $sum: '$transaction.amountCents' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return { totalCents: 0, count: 0 };
  }

  return result[0];
};

const create = (data) => SavingsContribution.create(data);

const save = (contribution) => contribution.save();

const deleteById = (id) => SavingsContribution.findByIdAndDelete(id);

const deleteByTransaction = (transactionId) =>
  SavingsContribution.findOneAndDelete({ transaction: transactionId });

const deleteAllByGoal = (savingsGoalId) =>
  SavingsContribution.deleteMany({ savingsGoal: savingsGoalId });

const deleteAllByGoals = (goalIds) =>
  SavingsContribution.deleteMany({ savingsGoal: { $in: goalIds } });

const deleteByTransactions=(transactionIds)=>
  SavingsContribution.deleteMany({transaction:{$in:{transactionIds}}})


export default {
  findById,
  findByGoal,
  findByTransaction,
  existsByTransaction,
  countByGoal,
  sumByGoal,
  create,
  save,
  deleteById,
  deleteByTransaction,
  deleteAllByGoal,
  deleteByTransactions,
  deleteAllByGoals,
};