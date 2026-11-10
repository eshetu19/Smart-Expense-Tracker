
import { transactionAttachmentService } from '../services/index.js';
import fileService from '../services/file.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';


export const create = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No files uploaded');
  }

  const attachments = await transactionAttachmentService.saveMany(
    req.params.transactionId,
    req.user.userId,
    req.files
  );

  const withUrls = attachments.map((a) => ({
    ...a.toObject(),
    url: fileService.buildPublicUrl(a.filePath),
  }));

  res.status(201).json(
    new ApiResponse(201, { attachments: withUrls }, 'Attachments added')
  );
});


export const list = asyncHandler(async (req, res) => {
  const attachments = await transactionAttachmentService.listByTransaction(
    req.params.transactionId,
    req.user.userId
  );

  const withUrls = attachments.map((a) => ({
    ...a.toObject(),
    url: fileService.buildPublicUrl(a.filePath),
  }));

  res.status(200).json(
    new ApiResponse(200, { attachments: withUrls }, 'Attachments retrieved')
  );
});


export const remove = asyncHandler(async (req, res) => {
  const result = await transactionAttachmentService.remove(
    req.params.id,
    req.user.userId
  );

  res.status(200).json(new ApiResponse(200, null, result.message));
});