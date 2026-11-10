
import tokenService from '../services/token.service.js';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const payload = tokenService.verifyAccessToken(token);

    if (!payload.userId) {
      return next(ApiError.unauthorized('Invalid token payload'));
    }

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      return next(ApiError.unauthorized('User no longer exists'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('Account is deactivated'));
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: null,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;