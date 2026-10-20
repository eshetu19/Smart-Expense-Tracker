
import Notification from '../models/Notification.js';

const findById = (id) => Notification.findById(id);

const findByIdAndUser = (id, userId) =>
  Notification.findOne({ _id: id, user: userId });

const findByUser = (userId, options = {}) => {
  const { page = 1, limit = 20, isRead, notificationType } = options;
  const query = { user: userId };

  if (typeof isRead === 'boolean') query.isRead = isRead;
  if (notificationType) query.notificationType = notificationType;

  return Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

const countByUser = async (userId, options = {}) => {
  const { isRead, notificationType } = options;
  const query = { user: userId };

  if (typeof isRead === 'boolean') query.isRead = isRead;
  if (notificationType) query.notificationType = notificationType;

  return Notification.countDocuments(query);
};

const findUnreadByUser = (userId, limit = 20) =>
  Notification.find({ user: userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(limit);

const countUnreadByUser = async (userId) =>
  Notification.countDocuments({ user: userId, isRead: false });

const create = (data) => Notification.create(data);

const createMany = (dataArray) => Notification.insertMany(dataArray);

const save = (notification) => notification.save();

const markAsRead = (id, userId) =>
  Notification.findOneAndUpdate(
    { _id: id, user: userId, isRead: false },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

const markAllAsRead = (userId) =>
  Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

const deleteById = (id, userId) =>
  Notification.findOneAndDelete({ _id: id, user: userId });

const deleteAllByUser = (userId) => Notification.deleteMany({ user: userId });

const deleteReadByUser = (userId) =>
  Notification.deleteMany({ user: userId, isRead: true });

export default {
  findById,
  findByIdAndUser,
  findByUser,
  countByUser,
  findUnreadByUser,
  countUnreadByUser,
  create,
  createMany,
  save,
  markAsRead,
  markAllAsRead,
  deleteById,
  deleteAllByUser,
  deleteReadByUser,
};