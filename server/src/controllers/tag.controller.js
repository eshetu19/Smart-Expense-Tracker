
import { tagService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';


export const list = asyncHandler(async (req, res) => {
  const tags = await tagService.list(req.user.userId);

  res.status(200).json(
    new ApiResponse(200, { tags }, 'Tags retrieved')
  );
});


export const getById = asyncHandler(async (req, res) => {
  const tag = await tagService.getById(req.params.id, req.user.userId);

  res.status(200).json(
    new ApiResponse(200, { tag }, 'Tag retrieved')
  );
});


export const create = asyncHandler(async (req, res) => {
  const tag = await tagService.create(req.user.userId, req.body);

  res.status(201).json(
    new ApiResponse(201, { tag }, 'Tag created')
  );
});


export const update = asyncHandler(async (req, res) => {
  const tag = await tagService.update(req.params.id, req.user.userId, req.body);

  res.status(200).json(
    new ApiResponse(200, { tag }, 'Tag updated')
  );
});


export const remove = asyncHandler(async (req, res) => {
  const result = await tagService.remove(req.params.id, req.user.userId);

  res.status(200).json(
    new ApiResponse(200, null, result.message)
  );
});