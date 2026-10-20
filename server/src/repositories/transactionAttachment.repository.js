
import TransactionAttachment from '../models/TransactionAttachment.js';

const findById = (id) => TransactionAttachment.findById(id);

const findByTransaction = (transactionId) =>
  TransactionAttachment.find({ transaction: transactionId })
    .sort({ createdAt: -1 });

const countByTransaction = async (transactionId) =>
  TransactionAttachment.countDocuments({ transaction: transactionId });

const create = (data) => TransactionAttachment.create(data);

const createMany = (dataArray) =>
  TransactionAttachment.insertMany(dataArray);

const deleteById = (id) => TransactionAttachment.findByIdAndDelete(id);

const deleteAllByTransaction = (transactionId) =>
  TransactionAttachment.deleteMany({ transaction: transactionId });

export default {
  findById,
  findByTransaction,
  countByTransaction,
  create,
  createMany,
  deleteById,
  deleteAllByTransaction,
};