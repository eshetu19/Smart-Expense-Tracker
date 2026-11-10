
import transactionAttachmentRepository from '../repositories/transactionAttachment.repository.js';
import transactionRepository from '../repositories/transaction.repository.js';
import fileService from './file.service.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import { LIMITS } from '../config/constants.js';


const saveMany = async (transactionId, userId, files) => {
  const transaction = await transactionRepository.findByIdAndUser(
    transactionId,
    userId
  );
  if (!transaction) throw ApiError.notFound('Transaction not found');

  if (!Array.isArray(files) || files.length === 0) {
    throw ApiError.badRequest('No files provided');
  }

  const existingCount =
    await transactionAttachmentRepository.countByTransaction(transactionId);

  if (existingCount + files.length > LIMITS.MAX_ATTACHMENTS_PER_TRANSACTION) {
    throw ApiError.badRequest(
      `Attachment limit exceeded. Max: ${LIMITS.MAX_ATTACHMENTS_PER_TRANSACTION} per transaction`
    );
  }

  const saved = [];

  try {
    for (const file of files) {
      const meta = await fileService.saveFile(file, {
        folder: 'transactionAttachments',
      });
      const attachment = await transactionAttachmentRepository.create({
        transaction: transactionId,
        originalFileName: meta.originalFileName,
        storedFileName: meta.storedFileName,
        filePath: meta.filePath,
        mimeType: meta.mimeType,
        fileSize: meta.fileSize,
      });
      saved.push(attachment);
    }
  } catch (err) {
    
    for (const attachment of saved) {
      try {
        await fileService.deleteFile(attachment.filePath);
      } catch (cleanupErr) {
        logger.warn('Failed to clean up attachment file after partial failure', {
          attachmentId: String(attachment._id),
          error: cleanupErr.message,
        });
      }
      try {
        await transactionAttachmentRepository.deleteById(attachment._id);
      } catch (cleanupErr) {
        logger.warn('Failed to clean up attachment record after partial failure', {
          attachmentId: String(attachment._id),
          error: cleanupErr.message,
        });
      }
    }
    throw err;
  }

  return saved;
};



const listByTransaction = async (transactionId, userId) => {
  const transaction = await transactionRepository.findByIdAndUser(
    transactionId,
    userId
  );
  if (!transaction) throw ApiError.notFound('Transaction not found');

  return await transactionAttachmentRepository.findByTransaction(transactionId);
};



const remove = async (attachmentId, userId) => {
  const attachment = await transactionAttachmentRepository.findById(attachmentId);
  if (!attachment) throw ApiError.notFound('Attachment not found');


  const transaction = await transactionRepository.findByIdAndUser(
    attachment.transaction,
    userId
  );
  if (!transaction) throw ApiError.notFound('Attachment not found');

  
  try {
    await fileService.deleteFile(attachment.filePath);
  } catch (err) {
    logger.warn('Failed to delete attachment file on disk', {
      attachmentId: String(attachment._id),
      error: err.message,
    });
  }

  
  await transactionAttachmentRepository.deleteById(attachmentId);

  return { message: 'Attachment deleted' };
};


export default {
  saveMany,
  listByTransaction,
  remove,
};