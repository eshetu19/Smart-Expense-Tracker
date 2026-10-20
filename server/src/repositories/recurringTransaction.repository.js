
import RecurringTransaction from '../models/RecurringTransaction.js';

const findById = (id) => RecurringTransaction.findById(id);

const findByIdAndUser = (id, userId) =>
  RecurringTransaction.findOne({ _id: id, user: userId });

const findByIdAndUserWithDetails = (id, userId) =>
  RecurringTransaction.findOne({ _id: id, user: userId })
    .populate('category', 'name color icon transactionType')
    .populate('account', 'name accountType currency');

const findByUser = (userId) =>
  RecurringTransaction.find({ user: userId }).sort({ createdAt: -1 });

const findActiveByUser = (userId) =>
  RecurringTransaction.find({ user: userId, isActive: true })
    .populate('category', 'name color icon')
    .populate('account', 'name')
    .sort({ nextExecutionDate: 1 });

const findDueForExecution = (asOf = new Date()) =>
  RecurringTransaction.find({
    isActive: true,
    nextExecutionDate: { $lte: asOf },
  })
    .populate('category', 'name transactionType')
    .populate('account', 'name')
    .sort({ nextExecutionDate: 1 });

const findUpcomingInDays = (userId, days = 7) => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return RecurringTransaction.find({
    user: userId,
    isActive: true,
    nextExecutionDate: { $gte: now, $lte: future },
  }).sort({ nextExecutionDate: 1 });
};

const countActiveByUser = async (userId) =>
  RecurringTransaction.countDocuments({ user: userId, isActive: true });

const create = (data) => RecurringTransaction.create(data);

const save = (recurring) => recurring.save();

const updateById = (id, data) =>
  RecurringTransaction.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

const updateExecutionDates = (id, lastExecutionDate, nextExecutionDate) =>
  RecurringTransaction.findByIdAndUpdate(
    id,
    { lastExecutionDate, nextExecutionDate },
    { new: true }
  );

const deactivate = (id) =>
  RecurringTransaction.findByIdAndUpdate(id, { isActive: false }, { new: true });

const activate = (id) =>
  RecurringTransaction.findByIdAndUpdate(id, { isActive: true }, { new: true });

const deleteById = (id) => RecurringTransaction.findByIdAndDelete(id);

const deleteAllByUser = (userId) =>
  RecurringTransaction.deleteMany({ user: userId });

const deleteAllByAccount = (accountId) =>
  RecurringTransaction.deleteMany({ account: accountId });

const deleteAllByCategory = (categoryId) =>
  RecurringTransaction.deleteMany({ category: categoryId });

export default {
  findById,
  findByIdAndUser,
  findByIdAndUserWithDetails,
  findByUser,
  findActiveByUser,
  findDueForExecution,
  findUpcomingInDays,
  countActiveByUser,
  create,
  save,
  updateById,
  updateExecutionDates,
  deactivate,
  activate,
  deleteById,
  deleteAllByUser,
  deleteAllByAccount,
  deleteAllByCategory,
};