
import ReportExport from '../models/ReportExport.js';

const findById = (id) => ReportExport.findById(id);

const findByIdAndUser = (id, userId) =>
  ReportExport.findOne({ _id: id, user: userId });

const findByUser = (userId, options = {}) => {
  const { page = 1, limit = 20, reportType, status } = options;
  const query = { user: userId };

  if (reportType) query.reportType = reportType;
  if (status) query.status = status;

  return ReportExport.find(query)
    .sort({ exportedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

const countByUser = async (userId, options = {}) => {
  const { reportType, status } = options;
  const query = { user: userId };

  if (reportType) query.reportType = reportType;
  if (status) query.status = status;

  return ReportExport.countDocuments(query);
};

const findPending = () =>
  ReportExport.find({ status: { $in: ['PENDING', 'PROCESSING'] } })
    .sort({ exportedAt: 1 });

const findExpired = (asOf = new Date()) =>
  ReportExport.find({
    expiresAt: { $ne: null, $lt: asOf },
  });

const create = (data) => ReportExport.create(data);

const save = (report) => report.save();

const updateStatus = (id, status) =>
  ReportExport.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

const updateById = (id, data) =>
  ReportExport.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const deleteById = (id) => ReportExport.findByIdAndDelete(id);

const deleteByIdAndUser = (id, userId) =>
  ReportExport.findOneAndDelete({ _id: id, user: userId });

const deleteAllByUser = (userId) =>
  ReportExport.deleteMany({ user: userId });

const deleteManyByIds = (ids) =>
  ReportExport.deleteMany({ _id: { $in: ids } });

export default {
  findById,
  findByIdAndUser,
  findByUser,
  countByUser,
  findPending,
  findExpired,
  create,
  save,
  updateStatus,
  updateById,
  deleteById,
  deleteByIdAndUser,
  deleteAllByUser,
  deleteManyByIds,
};