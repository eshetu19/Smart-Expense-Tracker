
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  LIMITS,
} from '../config/constants.js';

const buildFilterQuery = (userId, options = {}) => {
  const {
    transactionType,
    categoryId,
    accountId,
    status,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
  } = options;

  const query = { user: userId };
  const andConditions = [];

  if (transactionType) query.transactionType = transactionType;
  if (categoryId) query.category = categoryId;
  if (status) query.status = status;

  if (accountId) {
    andConditions.push({
      $or: [{ fromAccount: accountId }, { toAccount: accountId }],
    });
  }

  if (startDate || endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    query.transactionDate = dateFilter;
  }

  if (minAmount || maxAmount) {
    const amountFilter = {};
    if (minAmount) amountFilter.$gte = Math.round(minAmount * 100);
    if (maxAmount) amountFilter.$lte = Math.round(maxAmount * 100);
    query.amountCents = amountFilter;
  }

  if (search && search.trim()) {
    const term = search.trim();
    andConditions.push({
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { referenceNumber: { $regex: term, $options: 'i' } },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return query;
};

const findById = (id) => Transaction.findById(id);

const findByIdAndUser = (id, userId) =>
  Transaction.findOne({ _id: id, user: userId });

const findByIdWithDetails = (id, userId) =>
  Transaction.findOne({ _id: id, user: userId })
    .populate('category', 'name color icon transactionType')
    .populate('fromAccount', 'name accountType currency')
    .populate('toAccount', 'name accountType currency');

const findByUser = (userId, options = {}) => {
  const {
    page = 1,
    limit = LIMITS.DEFAULT_PAGE_SIZE,
    sortBy = 'transactionDate',
    sortOrder = 'desc',
  } = options;

  const query = buildFilterQuery(userId, options);
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const safeLimit = Math.min(limit, LIMITS.MAX_PAGE_SIZE);
  const skip = (page - 1) * safeLimit;

  return Transaction.find(query)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(safeLimit)
    .populate('category', 'name color icon')
    .populate('fromAccount', 'name')
    .populate('toAccount', 'name');
};

const countByUser = async (userId, options = {}) => {
  const query = buildFilterQuery(userId, options);
  return Transaction.countDocuments(query);
};

const findRecentByUser = (userId, limit = 10) =>
  Transaction.find({ user: userId })
    .sort({ transactionDate: -1 })
    .limit(limit)
    .populate('category', 'name color icon')
    .populate('fromAccount', 'name')
    .populate('toAccount', 'name');

const findByAccount = (accountId, userId) =>
  Transaction.find({
    user: userId,
    $or: [{ fromAccount: accountId }, { toAccount: accountId }],
  }).sort({ transactionDate: -1 });

const findByCategory = (categoryId, userId, options = {}) => {
  const { startDate, endDate, page = 1, limit = LIMITS.DEFAULT_PAGE_SIZE } = options;
  const query = { user: userId, category: categoryId };

  if (startDate || endDate) {
    query.transactionDate = {};
    if (startDate) query.transactionDate.$gte = new Date(startDate);
    if (endDate) query.transactionDate.$lte = new Date(endDate);
  }

  return Transaction.find(query)
    .sort({ transactionDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

const findByDateRange = (userId, startDate, endDate, filters = {}) => {
  const query = {
    user: userId,
    transactionDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    ...filters,
  };

  return Transaction.find(query).sort({ transactionDate: -1 });
};

const sumByTypeInRange = async (userId, startDate, endDate) => {
  const result = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        transactionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        status: TRANSACTION_STATUSES.COMPLETED,
      },
    },
    {
      $group: {
        _id: '$transactionType',
        total: { $sum: '$amountCents' },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = {
    [TRANSACTION_TYPES.INCOME]:  { total: 0, count: 0 },
    [TRANSACTION_TYPES.EXPENSE]: { total: 0, count: 0 },
  };

  for (const row of result) {
    summary[row._id] = { total: row.total, count: row.count };
  }

  return summary;
};

const sumByCategoryInRange = (userId, startDate, endDate, transactionType) => {
  const match = {
    user: new mongoose.Types.ObjectId(userId),
    transactionDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: TRANSACTION_STATUSES.COMPLETED,
  };

  if (transactionType) match.transactionType = transactionType;

  return Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amountCents' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        total: 1,
        count: 1,
        'category.name': 1,
        'category.color': 1,
        'category.icon': 1,
      },
    },
    { $sort: { total: -1 } },
  ]);
};

const sumByAccountInRange = (userId, accountId, startDate, endDate) => {
  return Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: TRANSACTION_STATUSES.COMPLETED,
        transactionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        $or: [
          { fromAccount: new mongoose.Types.ObjectId(accountId) },
          { toAccount:   new mongoose.Types.ObjectId(accountId) },
        ],
      },
    },
    {
      $group: {
        _id: '$transactionType',
        total: { $sum: '$amountCents' },
        count: { $sum: 1 },
      },
    },
  ]);
};

const monthlyTotals = (userId, months = 6) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  return Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: TRANSACTION_STATUSES.COMPLETED,
        transactionDate: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$transactionDate' },
          month: { $month: '$transactionDate' },
          type: '$transactionType',
        },
        total: { $sum: '$amountCents' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

const countByAccount = async (accountId) =>
  Transaction.countDocuments({
    $or: [{ fromAccount: accountId }, { toAccount: accountId }],
  });

const countByCategory = async (categoryId) =>
  Transaction.countDocuments({ category: categoryId });

const countByUserSince = async (userId, since) =>
  Transaction.countDocuments({
    user: userId,
    transactionDate: { $gte: new Date(since) },
  });

const create = (data) => Transaction.create(data);

const createMany = (dataArray) => Transaction.insertMany(dataArray);

const save = (transaction) => transaction.save();

const updateById = (id, data) =>
  Transaction.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deleteById = (id) => Transaction.findByIdAndDelete(id);

const deleteAllByUser = (userId) => Transaction.deleteMany({ user: userId });

const deleteByAccount = (accountId) =>
  Transaction.deleteMany({
    $or: [{ fromAccount: accountId }, { toAccount: accountId }],
  });

export default {
  findById,
  findByIdAndUser,
  findByIdWithDetails,
  findByUser,
  countByUser,
  findRecentByUser,
  findByAccount,
  findByCategory,
  findByDateRange,
  sumByTypeInRange,
  sumByCategoryInRange,
  sumByAccountInRange,
  monthlyTotals,
  countByAccount,
  countByCategory,
  countByUserSince,
  create,
  createMany,
  save,
  updateById,
  deleteById,
  deleteAllByUser,
  deleteByAccount,
};