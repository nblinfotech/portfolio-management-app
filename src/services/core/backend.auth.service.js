const httpStatus = require('http-status');
const tokenService = require('./backend.token.service');
const userService = require('./backend.user.service');
// const Token = require('../../models/backend_user_token');

const models = require('../../models/core');
const Token = models.backendUserToken

const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize');

const { tokenTypes } = require('../../config/core/tokens');

const backendUserService = require('./backend.user.service');





/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);

  if (!user) {

    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  }
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    where: {
      token: refreshToken,
      type: tokenTypes.REFRESH,
    },
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }

  await Token.destroy({
    where: {
      id: refreshTokenDoc.id,
    },
  });
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await backendUserService.getUserById(refreshTokenDoc.backend_user_id);
    if (!user) {
      throw new Error();
    }
    // const userObj = {};
    // userObj.id = refreshTokenDoc.backend_user_id;
    await refreshTokenDoc.destroy();

    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {



    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);


    const userId = resetPasswordTokenDoc.backend_user_id;


    const user = await backendUserService.getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }


    await backendUserService.updateUserById(user.id, { password: newPassword });
    // await Token.destroy({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    const deleteResult = await Token.destroy({
      where: {
        backend_user_id: user.id,
        type: tokenTypes.RESET_PASSWORD,
      },
    });


  } catch (error) {

    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
