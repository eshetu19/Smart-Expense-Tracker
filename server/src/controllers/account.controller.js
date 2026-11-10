
import { accountService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const accounts = await accountService.list(req.user.userId, req.query);
  res.status(200).json(new ApiResponse(200, { accounts }, 'Accounts retrieved'));
});

export const getById = asyncHandler(async (req, res) => {
  const account = await accountService.getById(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, { account }, 'Account retrieved'));
});

export const create = asyncHandler(async (req, res) => {
  const account = await accountService.create(req.user.userId, req.body);
  res.status(201).json(new ApiResponse(201, { account }, 'Account created'));
});

export const update = asyncHandler(async (req, res) => {
  const account = await accountService.update(req.params.id, req.user.userId, req.body);
  res.status(200).json(new ApiResponse(200, { account }, 'Account updated'));
});

export const deactivate = asyncHandler(async (req, res) => {
  const result = await accountService.deactivate(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});

export const activate = asyncHandler(async (req, res) => {
  const result = await accountService.activate(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await accountService.remove(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});