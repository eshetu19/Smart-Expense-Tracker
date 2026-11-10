
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
  categoryIdSchema,
} from '../validations/category.validation.js';
import * as categoryController from '../controllers/category.controller.js';

const router = Router();

router.use(authMiddleware);


router.get(
  '/',
  validate(listCategoriesQuerySchema, 'query'),
  categoryController.list
);

router.post(
  '/',
  validate(createCategorySchema),
  categoryController.create
);


router.get(
  '/:id',
  validate(categoryIdSchema, 'params'),
  categoryController.getById
);

router.patch(
  '/:id',
  validate(categoryIdSchema, 'params'),
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  '/:id',
  validate(categoryIdSchema, 'params'),
  categoryController.remove
);


router.post(
  '/:id/deactivate',
  validate(categoryIdSchema, 'params'),
  categoryController.deactivate
);

router.post(
  '/:id/activate',
  validate(categoryIdSchema, 'params'),
  categoryController.activate
);

export default router;