
import { recurringTransactionService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const items = await recurringTransactionService.list(req.user.userId, req.query);
  res.status(200).json(
    new ApiResponse(200, { items }, 'Recurring transactions retrieved')
  );
});

export const getById = asyncHandler(async (req, res) => {
  const recurring = await recurringTransactionService.getById(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(
    new ApiResponse(200, { recurring }, 'Recurring transaction retrieved')
  );
});

export const create = asyncHandler(async (req, res) => {
  const recurring = await recurringTransactionService.create(
    req.user.userId,
    req.body
  );
  res.status(201).json(
    new ApiResponse(201, { recurring }, 'Recurring transaction created')
  );
});

export const update = asyncHandler(async (req, res) => {
  const recurring = await recurringTransactionService.update(
    req.params.id,
    req.user.userId,
    req.body
  );
  res.status(200).json(
    new ApiResponse(200, { recurring }, 'Recurring transaction updated')
  );
});

export const pause = asyncHandler(async (req, res) => {
  const result = await recurringTransactionService.pause(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(new ApiResponse(200, null, result.message));
});

export const resume = asyncHandler(async (req, res) => {
  const result = await recurringTransactionService.resume(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(new ApiResponse(200, null, result.message));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await recurringTransactionService.remove(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(new ApiResponse(200, null, result.message));
});