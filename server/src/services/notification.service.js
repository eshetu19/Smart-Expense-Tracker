
import notificationRepository from '../repositories/notification.repository.js';
import userSettingsService from './userSettings.service.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';


const isQuietHoursSensitive = (type) => {
  return type !== NOTIFICATION_TYPES.SYSTEM;
};


const create = async (data) => {
  if (!data.user) throw ApiError.badRequest('Notification requires a user');
  if (!data.notificationType) {
    throw ApiError.badRequest('Notification requires a type');
  }

  const notification = await notificationRepository.create({
    user: data.user,
    title: data.title,
    message: data.message,
    notificationType: data.notificationType,
    relatedEntity: data.relatedEntity ?? { entityType: null, entityId: null },
    isRead: false,
    readAt: null,
  });

  deliverAsync(data.user, notification, data).catch((err) => {
    logger.error('Notification delivery failed', {
      notificationId: String(notification._id),
      error: err.message,
    });
  });

  return notification;
};


const deliverAsync = async (userId, notification, originalData) => {
  if (!isQuietHoursSensitive(notification.notificationType)) {
    return;
  }

  const settings = await userSettingsService.getByUser(userId);

  if (!settings.notificationEnabled) return;
  if (settings.quietHoursEnabled) {
    const isQuiet = await userSettingsService.isQuietHoursNow(userId);
    if (isQuiet) return;
  }

  if (settings.emailNotifications) {
    logger.info('Email notification (stub)', {
      userId: String(userId),
      type: notification.notificationType,
    });
  }

  if (settings.pushNotifications) {
    logger.info('Push notification (stub)', {
      userId: String(userId),
      type: notification.notificationType,
    });
  }
};


const createMany = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const docs = items.map((item) => ({
    user: item.user,
    title: item.title,
    message: item.message,
    notificationType: item.notificationType,
    relatedEntity: item.relatedEntity ?? { entityType: null, entityId: null },
    isRead: false,
    readAt: null,
  }));
  return await notificationRepository.createMany(docs);
};


const list = async (userId, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(options.limit, 10) || 20), 100);

  const filters = {};
  if (typeof options.isRead === 'boolean') filters.isRead = options.isRead;
  if (options.notificationType) filters.notificationType = options.notificationType;

  const [items, total] = await Promise.all([
    notificationRepository.findByUser(userId, { ...filters, page, limit }),
    notificationRepository.countByUser(userId, filters),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};


const listUnread = async (userId, limit = 20) => {
  return await notificationRepository.findUnreadByUser(userId, limit);
};


const countUnread = async (userId) => {
  return await notificationRepository.countUnreadByUser(userId);
};


const getById = async (notificationId, userId) => {
  const notification = await notificationRepository.findByIdAndUser(
    notificationId,
    userId
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  return notification;
};


const markAsRead = async (notificationId, userId) => {
  const updated = await notificationRepository.markAsRead(
    notificationId,
    userId
  );
  if (updated) return updated;

  const existing = await notificationRepository.findByIdAndUser(
    notificationId,
    userId
  );
  if (!existing) throw ApiError.notFound('Notification not found');
  return existing;
};


const markAllRead = async (userId) => {
  const result = await notificationRepository.markAllAsRead(userId);
  const count = result?.modifiedCount ?? result?.nModified ?? 0;
  return { message: 'All notifications marked as read', count };
};


const remove = async (notificationId, userId) => {
  const deleted = await notificationRepository.deleteById(
    notificationId,
    userId
  );
  if (!deleted) throw ApiError.notFound('Notification not found');
  return { message: 'Notification deleted' };
};


const removeRead = async (userId) => {
  const result = await notificationRepository.deleteReadByUser(userId);
  const count = result?.deletedCount ?? 0;
  return { message: `Cleared ${count} read notifications`, count };
};


const removeAll = async (userId) => {
  const result = await notificationRepository.deleteAllByUser(userId);
  const count = result?.deletedCount ?? 0;
  return { message: `Deleted ${count} notifications`, count };
};


export default {
  create,
  createMany,
  list,
  listUnread,
  countUnread,
  getById,
  markAsRead,
  markAllRead,
  remove,
  removeRead,
  removeAll,
};