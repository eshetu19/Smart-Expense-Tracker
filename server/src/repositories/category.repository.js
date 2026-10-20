
import Category from '../models/Category.js';

const findById = (id) => Category.findById(id);

const findByIdAndUser = (id, userId) =>
  Category.findOne({
    _id: id,
    $or: [{ user: userId }, { isSystem: true }],
  });

const findByUser = (userId) =>
  Category.find({
    $or: [{ user: userId }, { isSystem: true }],
    isActive: true,
  }).sort({ isSystem: -1, name: 1 });

const findUserOnlyByUser = (userId) =>
  Category.find({ user: userId, isSystem: false, isActive: true }).sort({ name: 1 });

const findSystem = () =>
  Category.find({ isSystem: true, isActive: true }).sort({ name: 1 });

const findByUserAndType = (userId, transactionType) =>
  Category.find({
    $or: [{ user: userId }, { isSystem: true }],
    transactionType,
    isActive: true,
  }).sort({ isSystem: -1, name: 1 });

const findByNameTypeAndUser = (name, transactionType, userId) =>
  Category.findOne({
    name: name.trim(),
    transactionType,
    $or: [{ user: userId }, { isSystem: true }],
  });

const countUserOnly = async (userId) =>
  Category.countDocuments({ user: userId, isSystem: false });

const create = (data) => Category.create(data);

const save = (category) => category.save();

const updateById = (id, data) =>
  Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deactivate = (id) =>
  Category.findByIdAndUpdate(id, { isActive: false }, { new: true });

const activate = (id) =>
  Category.findByIdAndUpdate(id, { isActive: true }, { new: true });

const deleteById = (id) => Category.findByIdAndDelete(id);

const deleteAllByUser = (userId) =>
  Category.deleteMany({ user: userId, isSystem: false });

export default {
  findById,
  findByIdAndUser,
  findByUser,
  findUserOnlyByUser,
  findSystem,
  findByUserAndType,
  findByNameTypeAndUser,
  countUserOnly,
  create,
  save,
  updateById,
  deactivate,
  activate,
  deleteById,
  deleteAllByUser,
};