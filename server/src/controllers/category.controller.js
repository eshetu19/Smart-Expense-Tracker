
import { categoryService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.list(req.user.userId, req.query);
  res.status(200).json(new ApiResponse(200, { categories }, 'Categories retrieved'));
});

export const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, { category }, 'Category retrieved'));
});

export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.user.userId, req.body);
  res.status(201).json(new ApiResponse(201, { category }, 'Category created'));
});

export const update = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.user.userId, req.body);
  res.status(200).json(new ApiResponse(200, { category }, 'Category updated'));
});

export const deactivate = asyncHandler(async (req, res) => {
  const result = await categoryService.deactivate(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});

export const activate = asyncHandler(async (req, res) => {
  const result = await categoryService.activate(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await categoryService.remove(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});