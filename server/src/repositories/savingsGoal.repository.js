
import mongoose from 'mongoose';
import SavingsGoal from '../models/SavingsGoal.js';
import { GOAL_STATUSES } from '../config/constants.js';

const findById = (id) => SavingsGoal.findById(id);

const findByIdAndUser = (id, userId) =>
  SavingsGoal.findOne({ _id: id, user: userId });

const findByIdAndUserWithAccount = (id, userId) =>
  SavingsGoal.findOne({ _id: id, user: userId })
    .populate('account', 'name accountType currency currentBalanceCents');

const findByUser = (userId) =>
  SavingsGoal.find({ user: userId }).sort({ createdAt: -1 });

const findByUserAndStatus = (userId, status) =>
  SavingsGoal.find({ user: userId, status }).sort({ createdAt: -1 });

const findActiveByUser = (userId) =>
  SavingsGoal.find({
    user: userId,
    status: GOAL_STATUSES.ACTIVE,
  })
    .populate('account', 'name currency')
    .sort({ priority: -1, createdAt: -1 });//I have to revise this later i don't the priority thing I think

const findByAccount = (accountId, userId) =>
  SavingsGoal.find({ account: accountId, user: userId });

const countByUser = async (userId) =>
  SavingsGoal.countDocuments({ user: userId });

const countActiveByUser = async (userId) =>
  SavingsGoal.countDocuments({ user: userId, status: GOAL_STATUSES.ACTIVE });

const create = (data) => SavingsGoal.create(data);

const save = (goal) => goal.save();

const updateById = (id, data) =>
  SavingsGoal.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const updateStatus = (id, status) =>
  SavingsGoal.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

const markCompleted = (id) =>
  updateStatus(id, GOAL_STATUSES.COMPLETED);

const deleteById = (id) => SavingsGoal.findByIdAndDelete(id);

const deleteAllByUser = (userId) => SavingsGoal.deleteMany({ user: userId });

const deleteAllByAccount = (accountId) =>
  SavingsGoal.deleteMany({ account: accountId });
export default {
  findById,
  findByIdAndUser,
  findByIdAndUserWithAccount,
  findByUser,
  findByUserAndStatus,
  findActiveByUser,
  findByAccount,
  countByUser,
  countActiveByUser,
  create,
  save,
  updateById,
  updateStatus,
  markCompleted,
  deleteById,
  deleteAllByUser,
  deleteAllByAccount,
};