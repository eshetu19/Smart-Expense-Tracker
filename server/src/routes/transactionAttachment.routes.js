
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { attachmentIdSchema } from '../validations/transactionAttachment.validation.js';
import * as transactionAttachmentController from '../controllers/transactionAttachment.controller.js';

const router = Router();

router.use(authMiddleware);


router.delete(
  '/:id',
  validate(attachmentIdSchema, 'params'),
  transactionAttachmentController.remove
);

export default router;