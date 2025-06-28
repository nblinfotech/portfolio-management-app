const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const { tokenTypes } = require('../../config/core/tokens');

const models = require('../../models/core');
const User = models.users;
const Token = models.UserToken;
const ApiError = require('../../utils/ApiError');
const { Sequelize } = require('sequelize');

/**
 * Lists the count of login attempts for each user.
 *
 * @returns {Array} userLoggedInCount - Array of user login counts
 */
const listLoginCount = async () => {
  return Token.findAll({
    group: ['user_id'],
    where: { type: tokenTypes.ACCESS },
    attributes: ['user_id', [Sequelize.fn('COUNT', 'user_id'), 'attempt_count']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: {
          exclude: ['password'],
        },
      },
    ],
  });
};

/**
 * Generates a JWT token for a user.
 *
 * @param {Number} userId - The user's ID
 * @param {Object} expires - Expiration moment object
 * @param {String} type - Type of the token
 * @param {String} secret - Secret key for signing the token
 * @param {String} otp - One-time password (optional)
 * @returns {String} token - The generated JWT token
 */
const generateToken = (userId, expires, type, secret = process.env.JWT_SECRET, otp) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };

  if (otp) {
    payload.otp = otp;
  }
  return jwt.sign(payload, secret);
};

/**
 * Nullifies a user's token.
 *
 * @param {Number} userId - The user's ID
 * @param {Number} organizationId - The organization ID
 * @param {String} type - The type of the token
 */
const nullifyToken = async (userId, organizationId, type) => {
  await Token.update(
    { token: null },
    {
      where: {
        user_id: userId,
        type: type,
        organization_id: organizationId,
      },
    }
  );
};

/**
 * Saves a token for a user, nullifying any existing tokens of the same type.
 *
 * @param {String} token - The JWT token to save
 * @param {Number} userId - The user's ID
 * @param {Number} organizationId - The organization ID
 * @param {String} type - The type of the token
 * @returns {Object} tokenDoc - The saved token document
 */
const saveToken = async (token, userId, organizationId, type) => {
  await nullifyToken(userId, organizationId, type);

  return await Token.create({
    token,
    user_id: userId,
    type,
    organization_id: organizationId,
  });
};

/**
 * Generates access and refresh tokens for a user.
 *
 * @param {Object} user - The user object
 * @returns {Object} tokens - Object containing access and refresh tokens
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);
  await saveToken(accessToken, user.id, user.organization_id, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_DAYS, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, user.organization_id, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generates a random 6-digit OTP.
 *
 * @returns {String} otp - The generated OTP
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generates a reset password token for a user.
 *
 * @param {String} email - The user's email
 * @returns {String} resetPasswordToken - The generated reset password token
 * @throws {ApiError} If the user is not found
 */
const generateResetPasswordToken = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, user.organization_id, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generates a token for setting a password.
 *
 * @param {String} email - The user's email
 * @returns {String} setPasswordToken - The generated set password token
 * @throws {ApiError} If the user is not found
 */
const generateSetPasswordToken = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(process.env.JWT_SET_PASSWORD_EXPIRATION_MINUTES, 'minutes');
  const setPasswordToken = generateToken(user.id, expires, tokenTypes.SET_PASSWORD);
  await saveToken(setPasswordToken, user.id, user.organization_id, tokenTypes.SET_PASSWORD);
  return setPasswordToken;
};

/**
 * Generates an OTP for email verification.
 *
 * @param {Object} user - The user object
 * @returns {Object} verifyEmailData - Object containing hashed OTP and the OTP itself
 */
const generateVerifyOTP = async (user) => {
  const expires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
  const otp = generateOtp();
  const verifyEmailToken = bcrypt.hashSync(otp);
  await saveToken(verifyEmailToken, user.id, user.organization_id, tokenTypes.VERIFY_OTP);
  return { verifyEmailToken, otp };
};

/**
 * Verifies a token for a user.
 *
 * @param {String} token - The token to verify
 * @param {String} type - The type of the token
 * @returns {Object} tokenDoc - The token document from the database
 * @throws {Error} If the token is not found or verification fails
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  const tokenDoc = await Token.findOne({
    where: {
      token: token,
      type: type,
      user_id: payload.sub,
    },
  });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }

  return tokenDoc;
};

module.exports = {
  generateAuthTokens,
  generateResetPasswordToken,
  saveToken,
  verifyToken,
  generateVerifyOTP,
  generateSetPasswordToken,
  nullifyToken,
  listLoginCount,
};
