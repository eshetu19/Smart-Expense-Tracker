
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import tokenRepository from '../repositories/token.repository.js';
import ApiError from '../utils/ApiError.js';

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateRawToken = () => crypto.randomBytes(64).toString('hex');

const signAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }
};

const createRefreshToken = async (user, deviceInfo = {}) => {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

  await tokenRepository.createRefreshToken({
    user: user._id,
    tokenHash,
    expiresAt,
    deviceName: deviceInfo.deviceName || null,
    ipAddress: deviceInfo.ipAddress || null,
    userAgent: deviceInfo.userAgent || null,
  });

  return { rawToken, expiresAt };
};

const verifyRefreshToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const token = await tokenRepository.findRefreshTokenByHash(tokenHash);

  if (!token) throw ApiError.unauthorized('Invalid refresh token');
  if (token.revokedAt) throw ApiError.unauthorized('Refresh token revoked');
  if (token.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token expired');
  }

  return token;
};

const rotateRefreshToken = async (oldRawToken, user, deviceInfo = {}) => {
  const oldToken = await verifyRefreshToken(oldRawToken);

  await tokenRepository.revokeRefreshTokenById(oldToken._id);

  return await createRefreshToken(user, {
    deviceName: oldToken.deviceName || deviceInfo.deviceName,
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent,
  });
};

const createPasswordResetToken = async (userId) => {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await tokenRepository.deletePasswordResetTokensByUser(userId);

  await tokenRepository.createPasswordResetToken({
    user: userId,
    tokenHash,
    expiresAt,
  });

  return { rawToken, expiresAt };
};

const consumePasswordResetToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const token = await tokenRepository.findPasswordResetTokenByHash(tokenHash);

  if (!token) throw ApiError.badRequest('Invalid or expired reset token');
  if (token.usedAt) throw ApiError.badRequest('Reset token already used');
  if (token.expiresAt < new Date()) {
    throw ApiError.badRequest('Reset token expired');
  }

  await tokenRepository.markPasswordResetTokenUsed(token._id);

  return token;
};

const createEmailVerificationToken = async (userId) => {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await tokenRepository.deleteEmailVerificationTokensByUser(userId);

  await tokenRepository.createEmailVerificationToken({
    user: userId,
    tokenHash,
    expiresAt,
  });

  return { rawToken, expiresAt };
};

const consumeEmailVerificationToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const token = await tokenRepository.findEmailVerificationTokenByHash(tokenHash);

  if (!token) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }
  if (token.usedAt) {
    throw ApiError.badRequest('Verification token already used');
  }
  if (token.expiresAt < new Date()) {
    throw ApiError.badRequest('Verification token expired');
  }

  await tokenRepository.markEmailVerificationTokenUsed(token._id);

  return token;
};

export default {
  signAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  rotateRefreshToken,
  createPasswordResetToken,
  consumePasswordResetToken,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
};