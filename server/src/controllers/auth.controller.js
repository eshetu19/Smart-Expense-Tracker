
import { authService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';


const extractDeviceInfo = (req) => {
  return {
    deviceName: req.body?.deviceInfo?.deviceName || null,
    ipAddress:
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.ip ||
      null,
    userAgent: req.headers['user-agent'] || null,
  };
};


const setRefreshCookie = (res, refreshToken, expiresAt) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
    expires: new Date(expiresAt),
    path: `${config.app.apiPrefix}/auth`,
  });
};


const clearRefreshCookie = (res) => {
   res.clearCookie('refreshToken', { path: `${config.app.apiPrefix}/auth` });
};


export const register = asyncHandler(async (req, res) => {
  const deviceInfo = extractDeviceInfo(req);

  const result = await authService.register(req.body, deviceInfo);

  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: result.user,
        accessToken: result.accessToken,
        expiresAt: result.refreshTokenExpiresAt,
      },
      'Account created successfully'
    )
  );
});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const deviceInfo = extractDeviceInfo(req);

  const result = await authService.login(email, password, deviceInfo);

  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: result.user,
        accessToken: result.accessToken,
        expiresAt: result.refreshTokenExpiresAt,
      },
      'Logged in successfully'
    )
  );
});


export const refresh = asyncHandler(async (req, res) => {
  
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
  throw ApiError.unauthorized('Refresh token required');
}

  const deviceInfo = extractDeviceInfo(req);
  const result = await authService.refresh(refreshToken, deviceInfo);

  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: result.accessToken,
        expiresAt: result.refreshTokenExpiresAt,
      },
      'Access token refreshed'
    )
  );
});


export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  clearRefreshCookie(res);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});


export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.userId);

  clearRefreshCookie(res);
  res.status(200).json(
    new ApiResponse(200, null, 'Logged out from all devices')
  );
});


export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  res.status(200).json(new ApiResponse(200, null, result.message));
});


export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword(token, newPassword);

  clearRefreshCookie(res);
  res.status(200).json(new ApiResponse(200, null, result.message));
});


export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body.token);

  res.status(200).json(new ApiResponse(200, null, result.message));
});


export const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.sendEmailVerification(req.user.userId);

  res.status(200).json(new ApiResponse(200, null, result.message));
});