
import { budgetService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';


export const list = asyncHandler(async (req, res) => {
  const budgets = await budgetService.list(req.user.userId, req.query);
  res.status(200).json(
    new ApiResponse(200, { budgets }, 'Budgets retrieved')
  );
});


export const getActive = asyncHandler(async (req, res) => {
  const budgets = await budgetService.getActive(req.user.userId);
  res.status(200).json(
    new ApiResponse(200, { budgets }, 'Active budgets retrieved')
  );
});


export const getById = asyncHandler(async (req, res) => {
  const budget = await budgetService.getById(req.params.id, req.user.userId);
  res.status(200).json(
    new ApiResponse(200, { budget }, 'Budget retrieved')
  );
});


export const getProgress = asyncHandler(async (req, res) => {
  const budget = await budgetService.getById(req.params.id, req.user.userId);
  const progress = await budgetService.getProgress(budget, req.user.userId);
  res.status(200).json(
    new ApiResponse(200, { progress }, 'Budget progress retrieved')
  );
});


export const create = asyncHandler(async (req, res) => {
  const budget = await budgetService.create(req.user.userId, req.body);
  res.status(201).json(
    new ApiResponse(201, { budget }, 'Budget created')
  );
});


export const update = asyncHandler(async (req, res) => {
  const budget = await budgetService.update(
    req.params.id,
    req.user.userId,
    req.body
  );
  res.status(200).json(
    new ApiResponse(200, { budget }, 'Budget updated')
  );
});


export const deactivate = asyncHandler(async (req, res) => {
  const result = await budgetService.deactivate(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});


export const remove = asyncHandler(async (req, res) => {
  const result = await budgetService.remove(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});