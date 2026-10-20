
import Tag from '../models/Tag.js';

const findById = (id) => Tag.findById(id);

const findByIdAndUser = (id, userId) =>
  Tag.findOne({ _id: id, user: userId });

const findByUser = (userId) =>
  Tag.find({ user: userId }).sort({ name: 1 });

const findByNameAndUser = (name, userId) =>
  Tag.findOne({ name: name.trim(), user: userId });

const findByNamesAndUser = (names, userId) =>
  Tag.find({
    name: { $in: names.map((n) => n.trim()) },
    user: userId,
  });

const findByIdsAndUser = (ids, userId) =>
  Tag.find({ _id: { $in: ids }, user: userId });

const countByUser = async (userId) =>
  Tag.countDocuments({ user: userId });

const create = (data) => Tag.create(data);

const createMany = (dataArray) => Tag.insertMany(dataArray);

const save = (tag) => tag.save();

const updateById = (id, data) =>
  Tag.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deleteById = (id) => Tag.findByIdAndDelete(id);

const deleteAllByUser = (userId) => Tag.deleteMany({ user: userId });

export default {
  findById,
  findByIdAndUser,
  findByUser,
  findByNameAndUser,
  findByNamesAndUser,
  findByIdsAndUser,
  countByUser,
  create,
  createMany,
  save,
  updateById,
  deleteById,
  deleteAllByUser,
};