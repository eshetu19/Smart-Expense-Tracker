
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  listNotificationsQuerySchema,
  listUnreadQuerySchema,
  notificationIdSchema,
  markAllReadSchema,
} from '../validations/notification.validation.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

router.use(authMiddleware);


router.get(
  '/',
  validate(listNotificationsQuerySchema, 'query'),
  notificationController.list
);

router.get(
  '/unread',
  validate(listUnreadQuerySchema, 'query'),
  notificationController.listUnread
);

router.get('/unread-count', notificationController.countUnread);

router.patch(
  '/read-all',
  validate(markAllReadSchema),
  notificationController.markAllRead
);

router.delete('/read', notificationController.removeRead);

router.delete('/', notificationController.removeAll);


router.get(
  '/:id',
  validate(notificationIdSchema, 'params'),
  notificationController.getById
);

router.patch(
  '/:id/read',
  validate(notificationIdSchema, 'params'),
  notificationController.markAsRead
);

router.delete(
  '/:id',
  validate(notificationIdSchema, 'params'),
  notificationController.remove
);

export default router;