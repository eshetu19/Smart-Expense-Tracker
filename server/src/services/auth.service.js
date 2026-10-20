import userRepository from '../repositories/user.repository.js';
import userSettingsRepository from '../repositories/userSettings.repository.js';
import tokenRepository from '../repositories/token.repository.js';
import tokenService from './token.service.js';
import userSettingsService from './userSettings.service.js';
//import emailService from './email.service.js';   
import ApiError from '../utils/ApiError.js';
import config from '../config/index.js';
import { sanitizeFilter } from 'mongoose';

const register = async (data , deviceInfo) =>{
    if(await userRepository.existsByEmail(data.email)){
        throw ApiError.conflict('Email Already registered')
    }
    if(await userRepository.existsByUsername(data.username)){
        throw ApiError.conflict('Username already taken')
    }

    const user = await userRepository.create({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || null

    });
    await userSettingsService.getByUser(user._id);

    const {rawToken:verificationToken} = await 
    tokenService.createEmailVerificationToken(user._id)

    const verificationUrl=`${config.app.clientUrl}/verify-email?token=${verificationToken}`
    // await emailService.sendVerificationEmail(user, verificationUrl);

    const accessToken = tokenService.signAccessToken(user)
    const { rawToken: refreshToken, expiresAt: refreshTokenExpiresAt } =
    await tokenService.createRefreshToken(user, deviceInfo);

    return {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
        verificationUrl
    };
};

//Login

const login = async (email , password , deviceInfo={}) =>{
    const user = await userRepository.findByEmailWithPassword(email)
    if(!user){
        throw ApiError.unauthorized('Invalid credentials')
    } 

    if(!user.isActive){
        throw ApiError.forbidden('Account is Deactivated')
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  try {
    await userRepository.updateLastLogin(user._id);
  } catch (err) {
    
  }
   const accessToken = tokenService.signAccessToken(user)
   const { rawToken: refreshToken, expiresAt: refreshTokenExpiresAt } =
    await tokenService.createRefreshToken(user, deviceInfo);
    return {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,

    };
};

const refresh = async (rawRefreshToken , deviceInfo = {}) =>{
    const tokenDoc = await tokenService.verifyRefreshToken(rawRefreshToken)
    
    
    const user = await userRepository.findById(tokenDoc.user)
    if (!user) {
    await tokenRepository.revokeRefreshTokenById(tokenDoc._id);
    throw ApiError.unauthorized('User no longer exists');
    }

    if (!user.isActive) {
    await tokenRepository.revokeRefreshTokenById(tokenDoc._id);
    throw ApiError.forbidden('Account is deactivated');
  }


  const {rawToken:newRefreshToken,expiresAt: refreshTokenExpiresAt} =
  await tokenService.rotateRefreshToken(rawRefreshToken,user,deviceInfo)
  
  const accessToken = tokenService.signAccessToken(user);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    refreshTokenExpiresAt,
  };
};

const logout = async (rawRefreshToken) =>{
    try {
        const tokenDoc = await tokenService.verifyRefreshToken(rawRefreshToken)
        await tokenRepository.revokeRefreshTokenById(tokenDoc._id);
    } catch (err) {
        
    }
    return {message : 'Logged out'}
};

const logoutAll = async (userId) =>{
    await tokenRepository.revokeAllRefreshTokensByUser(userId)
    return {message:'Logged out from all device'}
};

const forgotPassword = async (email) =>{
    const user = await userRepository.findByEmail(email)

    const genericResponse = {
    message:
      'If an account with that email exists, a password reset link has been sent.',
  };

  if (!user) return genericResponse;


  const { rawToken } = await tokenService.createPasswordResetToken(user._id);
  const resetUrl = `${config.app.clientUrl}/reset-password?token=${rawToken}`;
   
   // await emailService.sendPasswordResetEmail(user, resetUrl);
   return {
    ...genericResponse,
    resetUrl, 
   };
};


const resetPassword = async (rawResetToken, newPassword) => {
    const tokenDoc = 
    await tokenService.consumePasswordResetToken(rawResetToken)

    const user = await userRepository.findById(tokenDoc.user);
  if (!user) throw ApiError.badRequest('Invalid reset token');
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

   await userRepository.updatePassword(user._id, newPassword);
   
    await tokenRepository.revokeAllRefreshTokensByUser(user._id);

  return { message: 'Password reset. Please log in with your new password.' };

};

const sendEmailVerification = async (userId) => {

    const user = await userRepository.findById(userId)
    if(!user) throw ApiError.notFound('User not found')
    
    if(user.isEmailVerified) throw ApiError.badRequest('Email Already verified')
}