const express = require('express');
const authController = require('../../controllers/core/auth.controller');
const validate = require('../../middlewares/core/validate');
const authValidation = require('../../validations/core/auth.validation');
const { authLimiter } = require('../../middlewares/core/rateLimiter');


const router = express.Router();



/**
 * Routes for user registration and authentication.
 */

/**
 * Route for incident operations:
 * - [POST] /register (Route to register a new user)
 * - [POST] /login/password (Route to log in with a password)
 * - [POST] /login/otp (Route to log in using OTP)
 */
router
  .post('/register', validate(authValidation.register), authController.register)
  .post('/login/password', authLimiter, validate(authValidation.login), authController.login)
  .post('/login/otp', authLimiter, authController.loginWithOtp);

/**
 * Routes for user session management.
 */

/**
 * Route for incident operations:
 * - [POST] /logout (Route to log out the user)
 * - [POST] /refresh-tokens (Route to refresh authentication tokens)
 * - [POST] /send-otp (Route to send OTP for login)
 */
router
  .post('/logout', authController.logout)
  .post('/refresh-tokens', authController.refreshTokens)
  .post('/send-otp', authLimiter, authController.sendOtp);

/**
 * Routes for password management.
 */

/**
 * Route for incident operations:
 * - [POST] /forgot-password (Route to request a password reset link (Forgot Password))
 * - [POST] /reset-password (Route to reset the password using a reset token)
 * - [POST] /set-password (Route to set a new password after login)
 */
router
  .post('/forgot-password', authLimiter, validate(authValidation.forgotPassword), authController.forgotPassword)
  .post('/reset-password', authLimiter, validate(authValidation.resetPassword), authController.resetPassword)
  .post('/set-password', authLimiter, validate(authValidation.setPassword), authController.setPassword);

module.exports = router;
