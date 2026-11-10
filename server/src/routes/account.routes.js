
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createAccountSchema,
  updateAccountSchema,
  listAccountsQuerySchema,
  accountIdSchema,
} from '../validations/account.validation.js';
import * as accountController from '../controllers/account.controller.js';

const router = Router();


router.use(authMiddleware);


router.get(
  '/',
  validate(listAccountsQuerySchema, 'query'),
  accountController.list
);

router.post(
  '/',
  validate(createAccountSchema),
  accountController.create
);


router.get(
  '/:id',
  validate(accountIdSchema, 'params'),
  accountController.getById
);

router.patch(
  '/:id',
  validate(accountIdSchema, 'params'),
  validate(updateAccountSchema),
  accountController.update
);

router.delete(
  '/:id',
  validate(accountIdSchema, 'params'),
  accountController.remove
);


router.post(
  '/:id/deactivate',
  validate(accountIdSchema, 'params'),
  accountController.deactivate
);

router.post(
  '/:id/activate',
  validate(accountIdSchema, 'params'),
  accountController.activate
);

export default router;