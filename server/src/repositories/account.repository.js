
import Account from '../models/Account.js';

const findById = (id) => Account.findById(id);

const findByIdAndUser = (id, userId) =>
  Account.findOne({ _id: id, user: userId });

const findByUser = (userId) =>
  Account.find({ user: userId }).sort({ createdAt: -1 });

const findActiveByUser = (userId) =>
  Account.find({ user: userId, isActive: true }).sort({ createdAt: -1 });

const findByNameAndUser = (name, userId) =>
  Account.findOne({ name: name.trim(), user: userId });

const countByUser = async (userId) =>
  Account.countDocuments({ user: userId });

const countActiveByUser = async (userId) =>
  Account.countDocuments({ user: userId, isActive: true });

const create = (data) => Account.create(data);

const save = (account) => account.save();

const updateById = (id, data) =>
  Account.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const updateBalance = (id, newBalanceCents) =>
  Account.findByIdAndUpdate(
    id,
    { currentBalanceCents: newBalanceCents },
    { new: true, runValidators: true }
  );

const incrementBalance = (id, amountCents) =>
  Account.findByIdAndUpdate(
    id,
    { $inc: { currentBalanceCents: amountCents } },
    { new: true }
  );

const deactivate = (id) =>
  Account.findByIdAndUpdate(id, { isActive: false }, { new: true });

const activate = (id) =>
  Account.findByIdAndUpdate(id, { isActive: true }, { new: true });

const deleteById = (id) => Account.findByIdAndDelete(id);

const deleteAllByUser = (userId) => Account.deleteMany({ user: userId });

export default {
  findById,
  findByIdAndUser,
  findByUser,
  findActiveByUser,
  findByNameAndUser,
  countByUser,
  countActiveByUser,
  create,
  save,
  updateById,
  updateBalance,
  incrementBalance,
  deactivate,
  activate,
  deleteById,
  deleteAllByUser,
};