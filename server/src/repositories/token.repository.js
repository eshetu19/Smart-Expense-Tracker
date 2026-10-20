
import RefreshToken from '../models/RefreshToken.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';

const createRefreshToken = (data) => RefreshToken.create(data);

const findRefreshTokenByHash = (tokenHash) =>
  RefreshToken.findOne({ tokenHash });

const findActiveRefreshTokensByUser = (userId) =>
  RefreshToken.find({ user: userId, revokedAt: null })
    .sort({ createdAt: -1 });

const revokeRefreshToken = (tokenHash) =>
  RefreshToken.findOneAndUpdate(
    { tokenHash },
    { revokedAt: new Date() },
    { new: true }
  );

const revokeRefreshTokenById = (id) =>
  RefreshToken.findByIdAndUpdate(
    id,
    { revokedAt: new Date() },
    { new: true }
  );

const revokeAllRefreshTokensByUser = (userId) =>
  RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { revokedAt: new Date() }
  );

const deleteAllRefreshTokensByUser = (userId) =>
  RefreshToken.deleteMany({ user: userId });

const createPasswordResetToken = (data) => PasswordResetToken.create(data);

const findPasswordResetTokenByHash = (tokenHash) =>
  PasswordResetToken.findOne({ tokenHash });

const markPasswordResetTokenUsed = (id) =>
  PasswordResetToken.findByIdAndUpdate(
    id,
    { usedAt: new Date() },
    { new: true }
  );

const deletePasswordResetTokensByUser = (userId) =>
  PasswordResetToken.deleteMany({ user: userId });

const createEmailVerificationToken = (data) =>
  EmailVerificationToken.create(data);

const findEmailVerificationTokenByHash = (tokenHash) =>
  EmailVerificationToken.findOne({ tokenHash });

const markEmailVerificationTokenUsed = (id) =>
  EmailVerificationToken.findByIdAndUpdate(
    id,
    { usedAt: new Date() },
    { new: true }
  );

const deleteEmailVerificationTokensByUser = (userId) =>
  EmailVerificationToken.deleteMany({ user: userId });

const deleteAllByUser = async (userId) => {
  await Promise.all([
    RefreshToken.deleteMany({ user: userId }),
    PasswordResetToken.deleteMany({ user: userId }),
    EmailVerificationToken.deleteMany({ user: userId }),
  ]);
};

export default {
  
  createRefreshToken,
  findRefreshTokenByHash,
  findActiveRefreshTokensByUser,
  revokeRefreshToken,
  revokeRefreshTokenById,
  revokeAllRefreshTokensByUser,
  deleteAllRefreshTokensByUser,
  
  createPasswordResetToken,
  findPasswordResetTokenByHash,
  markPasswordResetTokenUsed,
  deletePasswordResetTokensByUser,
 
  createEmailVerificationToken,
  findEmailVerificationTokenByHash,
  markEmailVerificationTokenUsed,
  deleteEmailVerificationTokensByUser,
  
  deleteAllByUser,
};