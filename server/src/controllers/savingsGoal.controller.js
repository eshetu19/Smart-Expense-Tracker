
import { savingsGoalService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';


export const list = asyncHandler(async (req, res) => {
  const items = await savingsGoalService.list(req.user.userId, req.query);
  res.status(200).json(
    new ApiResponse(200, { items }, 'Savings goals retrieved')
  );
});


export const getById = asyncHandler(async (req, res) => {
  const progress = await savingsGoalService.getById(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(
    new ApiResponse(200, { progress }, 'Savings goal retrieved')
  );
});


export const create = asyncHandler(async (req, res) => {
  const goal = await savingsGoalService.create(req.user.userId, req.body);
  res.status(201).json(
    new ApiResponse(201, { goal }, 'Savings goal created')
  );
});


export const update = asyncHandler(async (req, res) => {
  const goal = await savingsGoalService.update(
    req.params.id,
    req.user.userId,
    req.body
  );
  res.status(200).json(
    new ApiResponse(200, { goal }, 'Savings goal updated')
  );
});


export const changeStatus = asyncHandler(async (req, res) => {
  const result = await savingsGoalService.changeStatus(
    req.params.id,
    req.user.userId,
    req.body.status
  );
  res.status(200).json(new ApiResponse(200, null, result.message));
});


export const remove = asyncHandler(async (req, res) => {
  const result = await savingsGoalService.remove(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});