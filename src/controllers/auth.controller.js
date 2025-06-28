const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, userTokenService } = require('../services/core/index');
const { HttpStatusCode } = require('axios');
const crypto = require('crypto');
const { Infobip, AuthType } = require("@infobip-api/sdk");
const models = require('../models/core');
const OrganizationApps = models.organizationApps;
const Apps = models.apps;
const Modules = models.modules;
// const SmsService = require('../../services/core/smsService');

const SmsService = require('../services/core/smsService');
const { emailService } = require('../services/core');
const smsService = new SmsService();

let infobip = new Infobip({
  baseUrl: process.env.INFOBIP_BASE_URL,
  apiKey: process.env.INFOBIP_API_Key,
  authType: AuthType.ApiKey,
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '6f02a1bcdb25e54f8c89c233d5faefc1d9b88d4db9a5e1a6c2f94742d5f0e3a5';
const IV_LENGTH = 16;
function encryptPermissions(permissions) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(JSON.stringify(permissions));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Registers a new user.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user details
 * @param {Object} res - Express response object
 *
 * @route POST /auth/register
 * @access Public
 * @returns {Object} user - Created user object
 * @returns {Object} tokens - Authentication tokens (access and refresh)
 */
const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await userTokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ status: httpStatus.CREATED, user, tokens, message: 'Registration successfully' });
});

/**
 * Logs in a user with a password.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing email and password
 * @param {Object} res - Express response object
 *
 * @route POST /auth/login/password
 * @access Public
 * @returns {Object} user - Authenticated user object
 * @returns {Object} tokens - Authentication tokens (access and refresh)
 *
 * @description If login is successful, a refresh token is stored in a secure HTTP-only cookie.
 */
const loginWithPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginWithPassword(email, password, req);
  const tokens = await userTokenService.generateAuthTokens(user);

  // TODO: Set to true in production
  res.cookie('jwt', tokens?.refresh.token, {
    httpOnly: false,
    sameSite: false,
    secure: false,
    maxAge: Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000,
  });
  res.status(httpStatus.OK).send({ status: httpStatus.OK, message: 'Logged in successfully!', user, tokens });
});



const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;



  const result = await authService.loginWithPassword(email, password, req);
  // res.status(200).send({ status: 200, message: 'Login successful! Redirecting to Otp validation.', result });

  // return result;
  if (!result.is2FA) {

    const tokens = await userTokenService.generateAuthTokens(result.user);
    const encryptedPermissions = encryptPermissions(result.permissions);

    // check for subscribed apps
    const apps = await Apps.findAll({
      include: {
        model: OrganizationApps,
        as: 'connected_organization',
        where: { organization_id: result.user.organization_id },
        attributes: []
      }
    });

    const modules = await Modules.findAll({});


    // TODO: Set to true in production
    res.cookie('jwt', tokens?.refresh.token, {
      httpOnly: false,
      sameSite: false,
      secure: false,
      maxAge: Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000,
    });

    res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: 'Logged in successfully!',
      user: result.user,
      tokens,
      is2FA: result.is2FA,
      timeZone: result.timeZone,
      profilePic: result.profilePic,
      permissions: encryptedPermissions,
      apps: apps,
      modules,
      dateTimeFormat: result.dateTimeFormat || 'hh:mm A Do MMM YYYY',
      businessUnitList: result.businessUnitList,
    });
  } else {
    res.status(200).send({ status: 200, message: 'Login successful! Redirecting to Otp validation.', is2FA: result.is2FA, user: result.user });
  }



});



/**
 * Logs out a user and clears the refresh token cookie.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing refresh token
 * @param {Object} res - Express response object
 *
 * @route POST /auth/logout
 * @access Private
 * @returns {null}
 *
 * @description Invalidates the refresh token and clears the JWT cookie.
 */
const logout = catchAsync(async (req, res) => {
  await authService.logout(req.cookies.jwt);
  res.clearCookie('jwt');
  res.status(httpStatus.NO_CONTENT).send({ status: httpStatus.NO_CONTENT, message: 'Logged out successfully!' });
  res.end();
});

/**
 * Refreshes authentication tokens.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.cookies - Request cookies containing refresh token
 * @param {Object} res - Express response object
 *
 * @route POST /auth/refresh-tokens
 * @access Public
 * @returns {Object} tokens - New authentication tokens (access and refresh)
 *
 * @description Refreshes the user's tokens using the refresh token stored in the cookies.
 */
const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshToken(req.cookies.jwt, req, res);

  // TODO: Set to true in production
  res.cookie('jwt', tokens.refresh.token, {
    httpOnly: false,
    sameSite: false,
    secure: false,
    sameSite: 'None',
  });
  res.status(httpStatus.OK).send({ status: httpStatus.OK, tokens });
});

/**
 * Resets the user's password using a token.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing reset token and new password
 * @param {Object} res - Express response object
 *
 * @route POST /auth/reset-password
 * @access Public
 * @returns {Object} message - Success message
 *
 * @description Resets the password after validating the reset token.
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword, req);
  res.status(httpStatus.OK).json({ status: httpStatus.OK, message: 'Password reset successfully! Redirecting....' });
});

/**
 * Sends a reset password email to the user.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing the user's email
 * @param {Object} res - Express response object
 *
 * @route POST /auth/forgot-password
 * @access Public
 * @returns {Object} message - Success message
 *
 * @description Generates a reset password token and sends an email to the user with instructions to reset their password.
 */
const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await userTokenService.generateResetPasswordToken(req.body.email, req);
  const user = await userService.getUserByEmail(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken, user.first_name, user.organization_id);
  res.status(httpStatus.OK).json({ status: httpStatus.OK, message: `Please check your inbox and follow the instructions to reset your password. If you don't see the email within a few minutes, please check your spam or junk folder` });
});

/**
 * Sets a new password for the user after login.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing token and new password
 * @param {Object} res - Express response object
 *
 * @route POST /auth/set-password
 * @access Private
 * @returns {Object} message - Success message
 *
 * @description Allows the user to set a new password after authentication.
 */
const setPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.setPassword(token, newPassword, req);
  res.status(httpStatus.CREATED).json({ status: httpStatus.CREATED, message: 'Password set successfully' });
});

/**
 * Logs in a user using OTP.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing email and OTP
 * @param {Object} res - Express response object
 *
 * @route POST /auth/login/otp
 * @access Public
 * @returns {Object} user - Authenticated user object
 * @returns {Object} tokens - Authentication tokens (access and refresh)
 *
 * @description Logs in the user by verifying the OTP, then generates and sends tokens in the response.
 */
const loginWithOtp = catchAsync(async (req, res) => {
  const { email, otp, phone } = req.body;

  const result = await authService.loginWithOtp(email, otp, phone, req);

  const encryptedPermissions = encryptPermissions(result.permissions);

  const tokens = await userTokenService.generateAuthTokens(result.user);

  // check for subscribed apps
  const apps = await Apps.findAll({
    include: {
      model: OrganizationApps,
      as: 'connected_organization',
      where: { organization_id: result.user.organization_id },
      attributes: []
    }
  });

  const modules = await Modules.findAll({});



  // TODO: Set to true in production
  res.cookie('jwt', tokens?.refresh.token, {
    httpOnly: false,
    sameSite: false,
    secure: false,
    maxAge: Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000,
  });
  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Authentication successful! Redirecting......',
    user: result.user,
    is2FA: result.is2FA,
    tokens,
    timeZone: result.timeZone,
    profilePic: result.profilePic,
    permissions: encryptedPermissions,
    apps: apps,
    modules,
    dateTimeFormat: result.dateTimeFormat || 'hh:mm A Do MMM YYYY',
    businessUnitList: result.businessUnitList,
  });
});


/**
 * Sends an OTP to the user's email.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing the user's email
 * @param {Object} res - Express response object
 *
 * @route POST /auth/send-otp
 * @access Public
 * @returns {Object} message - Success message
 *
 * @description Generates an OTP and sends it to the user's registered email address.
 */
// const sendOtp = catchAsync(async (req, res) => {

//   const user = await userService.getUserByEmail(req.body.email);
//   if (!user) {
//     res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message: 'User not found' });
//   } else {
//     const { name, organization_id, id } = user;
//     const { otp } = await userTokenService.generateVerifyOTP({ organization_id, id });
//     await emailService.sendOtp(req.body.email, otp, name);
//     res.status(httpStatus.OK).json({ status: httpStatus.OK, message: 'OTP sent successfully' });
//   }
// });

const sendOtp = catchAsync(async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    return res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message: 'Email or phone is required' });
  }

  let user;

  if (email) {
    user = await userService.getUserByEmail(email);
  } else if (phone) {
    user = await userService.getUserByPhone(phone);
  }

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message: 'User not found' });
  }

  const { name, organization_id, id } = user;

  const { otp } = await userTokenService.generateVerifyOTP({ organization_id, id });
  // console.log('OTP');
  // console.log(otp);
  if (email) {

    await emailService.sendOtp(email, otp, name, organization_id);
    return res.status(httpStatus.OK).json({ status: httpStatus.OK, message: 'OTP sent successfully via email' });
  } else if (phone) {

    try {

      const response = await smsService.sendOtp(phone, otp);
      console.log(response);
      return res.status(response.status).json({ message: response.message });
    } catch (error) {
      console.error('Error sending OTP via SMS:', error);
      return res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }

  }
});


module.exports = {
  register,
  loginWithPassword,
  loginWithOtp,
  resetPassword,
  logout,
  refreshTokens,
  forgotPassword,
  sendOtp,
  setPassword,
  login
};
