
import { notificationService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';


export const list = asyncHandler(async (req, res) => {
  const result = await notificationService.list(req.user.userId, req.query);
  res.status(200).json(
    new ApiResponse(200, result, 'Notifications retrieved')
  );
});


export const listUnread = asyncHandler(async (req, res) => {
  const items = await notificationService.listUnread(
    req.user.userId,
    req.query.limit
  );
  res.status(200).json(
    new ApiResponse(200, { items }, 'Unread notifications retrieved')
  );
});


export const countUnread = asyncHandler(async (req, res) => {
  const count = await notificationService.countUnread(req.user.userId);
  res.status(200).json(
    new ApiResponse(200, { count }, 'Unread count retrieved')
  );
});


export const getById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getById(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(
    new ApiResponse(200, { notification }, 'Notification retrieved')
  );
});


export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(
    new ApiResponse(200, { notification }, 'Notification marked as read')
  );
});


export const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.user.userId);
  res.status(200).json(
    new ApiResponse(200, { count: result.count }, result.message)
  );
});


export const remove = asyncHandler(async (req, res) => {
  const result = await notificationService.remove(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(new ApiResponse(200, null, result.message));
});


export const removeRead = asyncHandler(async (req, res) => {
  const result = await notificationService.removeRead(req.user.userId);
  res.status(200).json(
    new ApiResponse(200, { count: result.count }, result.message)
  );
});


export const removeAll = asyncHandler(async (req, res) => {
  const result = await notificationService.removeAll(req.user.userId);
  res.status(200).json(
    new ApiResponse(200, { count: result.count }, result.message)
  );
});