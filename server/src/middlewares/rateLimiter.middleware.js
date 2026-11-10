
import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';



const limitReachedHandler = (message) => (req, res, next, options) => {
  next(ApiError.tooManyRequests(message));
};



const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitReachedHandler(
    'Too many requests. Please try again in a few minutes.'
  ),
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitReachedHandler(
    'Too many authentication attempts. Please try again later.'
  ),
  skipSuccessfulRequests: true,
});



const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitReachedHandler(
    'Too many uploads. Please try again later.'
  ),
});


const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitReachedHandler(
    'Too many password reset requests. Please try again in an hour.'
  ),
  skipSuccessfulRequests: true,
});


export default {
  globalLimiter,
  authLimiter,
  uploadLimiter,
  passwordResetLimiter,
};