
import userRepository from '../repositories/user.repository.js';
import tokenRepository from '../repositories/token.repository.js';
import userSettingsService from './userSettings.service.js';
import ApiError from '../utils/ApiError.js';

const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

const getProfileWithSettings = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const settings = await userSettingsService.getByUser(userId);

  return { user, settings };
};

const updateProfile = async (userId, data) => {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'profileImage'];
  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  if (updates.phoneNumber) {
    const exists = await userRepository.existsByPhoneNumber(updates.phoneNumber);
    if (exists && updates.phoneNumber !== user.phoneNumber) {
      throw ApiError.conflict('Phone number already in use');
    }
  }

  return await userRepository.updateById(userId, updates);
};

const updateProfileImage = async (userId, imagePath) => {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  return await userRepository.updateById(userId, { profileImage: imagePath });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const userWithPassword = await userRepository.findByIdWithPassword(userId);
  if (!userWithPassword) throw ApiError.notFound('User not found');

  const isMatch = await userWithPassword.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.unauthorized('Current password is incorrect');

  if (currentPassword === newPassword) {
    throw ApiError.badRequest(
      'New password must be different from current password'
    );
  }

  await userRepository.updatePassword(userId, newPassword);

  await tokenRepository.revokeAllRefreshTokensByUser(userId);

  return { message: 'Password changed. Please log in again.' };
};

const deactivateAccount = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (!user.isActive) throw ApiError.badRequest('Account is already deactivated');

  await userRepository.deactivate(userId);
  await tokenRepository.revokeAllRefreshTokensByUser(userId);

  return { message: 'Account deactivated' };
};

export default {
  getProfile,
  getProfileWithSettings,
  updateProfile,
  updateProfileImage,
  changePassword,
  deactivateAccount,
};