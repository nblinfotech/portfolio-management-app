const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    role: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean(),
  }),
};

const loginOTP = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    otp: Joi.string().required(),
    phone: Joi.string().required(),
  }),
};



const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    newPassword: Joi.string().required().custom(password),
    token: Joi.string().required(),
  }),
};

const setPassword = {
  body: Joi.object().keys({
    newPassword: Joi.string().required().custom(password),
    token: Joi.string().required(),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  loginOTP,
  setPassword,
};
