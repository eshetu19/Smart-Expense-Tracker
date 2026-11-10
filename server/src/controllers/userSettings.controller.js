
import { userSettingsService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';


export const get = asyncHandler(async (req, res) => {
  const settings = await userSettingsService.getByUser(req.user.userId);

  res.status(200).json(
    new ApiResponse(200, { settings }, 'Settings retrieved')
  );
});


export const update = asyncHandler(async (req, res) => {
  const settings = await userSettingsService.update(
    req.user.userId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, { settings }, 'Settings updated')
  );
});


export const reset = asyncHandler(async (req, res) => {
  const settings = await userSettingsService.resetToDefaults(req.user.userId);

  res.status(200).json(
    new ApiResponse(200, { settings }, 'Settings reset to defaults')
  );
});