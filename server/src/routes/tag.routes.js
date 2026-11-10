
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createTagSchema,
  updateTagSchema,
  listTagsQuerySchema,
  tagIdSchema,
} from '../validations/tag.validation.js';
import * as tagController from '../controllers/tag.controller.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  validate(listTagsQuerySchema, 'query'),
  tagController.list
);

router.post(
  '/',
  validate(createTagSchema),
  tagController.create
);

router.get(
  '/:id',
  validate(tagIdSchema, 'params'),
  tagController.getById
);

router.patch(
  '/:id',
  validate(tagIdSchema, 'params'),
  validate(updateTagSchema),
  tagController.update
);

router.delete(
  '/:id',
  validate(tagIdSchema, 'params'),
  tagController.remove
);

export default router;