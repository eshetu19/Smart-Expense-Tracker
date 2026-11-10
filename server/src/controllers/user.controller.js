
import { userService } from '../services/index.js';
import { fileService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';


export const getMe = asyncHandler(async (req, res) => {
  const { user, settings } = await userService.getProfileWithSettings(
    req.user.userId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        settings,
      },
      'Profile retrieved'
    )
  );
});


export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.userId, req.body);

  res.status(200).json(
    new ApiResponse(200, { user }, 'Profile updated')
  );
});


export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await userService.changePassword(
    req.user.userId,
    currentPassword,
    newPassword
  );

  res.status(200).json(new ApiResponse(200, null, result.message));
});


export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  
  
  const fileMeta = await fileService.saveFile(req.file, {
    folder: 'profilePictures',
  });

  
  const user = await userService.updateProfileImage(
    req.user.userId,
    fileMeta.filePath
  );

  
  const avatarUrl = fileService.buildPublicUrl(fileMeta.filePath);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        avatarUrl,
      },
      'Avatar updated'
    )
  );
});


export const deactivate = asyncHandler(async (req, res) => {
  const result = await userService.deactivateAccount(req.user.userId);

  res.status(200).json(new ApiResponse(200, null, result.message));
});