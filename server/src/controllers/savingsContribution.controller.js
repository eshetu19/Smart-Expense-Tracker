
import { savingsContributionService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const contribution = await savingsContributionService.create(
    req.user.userId,
    req.body
  );
  res.status(201).json(
    new ApiResponse(201, { contribution }, 'Contribution created')
  );
});

export const getById = asyncHandler(async (req, res) => {
  const contribution = await savingsContributionService.getById(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(
    new ApiResponse(200, { contribution }, 'Contribution retrieved')
  );
});

export const listByGoal = asyncHandler(async (req, res) => {
  const contributions = await savingsContributionService.listByGoal(
    req.params.goalId,
    req.user.userId
  );
  res.status(200).json(
    new ApiResponse(200, { contributions }, 'Contributions retrieved')
  );
});

export const getByTransaction = asyncHandler(async (req, res) => {
  const contribution = await savingsContributionService.getByTransaction(
    req.params.transactionId,
    req.user.userId
  );
  res.status(200).json(
    new ApiResponse(200, { contribution }, 'Contribution retrieved')
  );
});

export const remove = asyncHandler(async (req, res) => {
  const result = await savingsContributionService.remove(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(new ApiResponse(200, null, result.message));
});