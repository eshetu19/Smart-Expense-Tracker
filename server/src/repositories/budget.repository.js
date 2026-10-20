
import Budget from '../models/Budget.js';

const findById = (id) => Budget.findById(id);

const findByIdAndUser = (id, userId) =>
  Budget.findOne({ _id: id, user: userId });

const findByUser = (userId) =>
  Budget.find({ user: userId }).sort({ createdAt: -1 });

const findActiveByUser = (userId) =>
  Budget.find({ user: userId, isActive: true }).sort({ createdAt: -1 });

const findActiveByUserAndCategory = (userId, categoryId) =>
  Budget.find({
    user: userId,
    category: categoryId,
    isActive: true,
  });

const findActiveForDate = (userId, date = new Date()) =>
  Budget.find({
    user: userId,
    isActive: true,
    startDate: { $lte: date },
    endDate: { $gte: date },
  }).populate('category', 'name color icon');

const findActiveByCategoryForDate = (userId, categoryId, date = new Date()) =>
  Budget.findOne({
    user: userId,
    category: categoryId,
    isActive: true,
    startDate: { $lte: date },
    endDate: { $gte: date },
  });

const findExpiredActive = (date = new Date()) =>
  Budget.find({ isActive: true, endDate: { $lt: date } });

const countActiveByUser = async (userId) =>
  Budget.countDocuments({ user: userId, isActive: true });

const findActiveByNameAndUser = (name, userId) =>
  Budget.findOne({
    user: userId,
    name: name.trim(),
    isActive: true,
  });



// const existsByNameAndUser = async (name, userId) => {
//   const count = await Budget.countDocuments({ user: userId, name: name.trim() });
//   return count > 0;
// };

const create = (data) => Budget.create(data);

const save = (budget) => budget.save();

const updateById = (id, data) =>
  Budget.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deactivate = (id) =>
  Budget.findByIdAndUpdate(id, { isActive: false }, { new: true });

const deactivateMany = (ids) =>
  Budget.updateMany({ _id: { $in: ids } }, { isActive: false });

const deleteById = (id) => Budget.findByIdAndDelete(id);

const deleteAllByUser = (userId) => Budget.deleteMany({ user: userId });

const deleteAllByCategory = (categoryId) =>
  Budget.deleteMany({ category: categoryId });

export default {
  findById,
  findByIdAndUser,
  findByUser,
  findActiveByUser,
  findActiveByUserAndCategory,
  findActiveForDate,
  findActiveByCategoryForDate,
  findExpiredActive,
  countActiveByUser,
  //existsByNameAndUser,
  findActiveByNameAndUser,
  create,
  save,
  updateById,
  deactivate,
  deactivateMany,
  deleteById,
  deleteAllByUser,
  deleteAllByCategory,
};