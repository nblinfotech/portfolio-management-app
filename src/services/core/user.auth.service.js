const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const models = require('../../models/core');
const User = models.users;
const Organization = models.organizations;
const Token = models.UserToken;
const Organizations = models.organizations;
const UserAuthLog = models.userAuthLog;
const Permission = models.permission;
const UserPermissions = models.userPermissions;
const Role = models.role;
const UserRole = models.userRole;
const ApiError = require('../../utils/ApiError');
const { tokenTypes } = require('../../config/core/tokens');
const { generateAuthTokens, verifyToken, nullifyToken } = require('./user.token.service.js');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const axios = require('axios');
const moment = require('moment');
const { userService } = require('./index.js');
const { emailService, employeeService } = require('../tenant/index.js');
const { getTenantDbInstance } = require('../../models/tenant/index.js');
const getUserPermissions = require('../../middlewares/core/getPermissions.js');

// const twilio = require('twilio');

// const asyncLocalStorage = require('node:async_hooks').AsyncLocalStorage;


// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);


const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15

/**
 * Logs user authentication actions into the database.
 *
 * @param {Object} req - The request object containing user details
 * @param {Number} userId - The ID of the authenticated user
 * @param {Number} status - Status of the authentication (1 for success, others for different actions)
 */


// if ip dont exist then normal, else if exists then get the value of the fields from those and in the current insert api put them.
const checkIpAndReturn = async (ip) =>{
 const userAuthLog = await UserAuthLog.findOne({where:
  {
    ip:ip,
    details: {
      [Op.ne]: null
    }
   }})

   if(userAuthLog){
    return userAuthLog
   }else{
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const data = {
      ip,
      timezone: response.data?.timezone || null,
      city: response.data?.city || null,
      region: response.data?.region || null,
      provider: response.data?.org || null,
      country: response.data?.country_name || null,
    };

    return data;
   }

}


const insertAuthLog = async (req, userId, status) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAuthLogData = await checkIpAndReturn(ip);
  return await UserAuthLog.create({ ip:ip, details: userAuthLogData, user_id: userId, status });
};

/**
 * Logs in a user with their email and password.
 *
 * @param {String} email - The user's email
 * @param {String} password - The user's password
 * @param {Object} req - The request object
 * @returns {Object} user - The authenticated user object (without password)
 * @throws {ApiError} If email or password is incorrect
 */
const loginWithPassword = async (email, password, req) => {


  const user = await User.findOne({
    where: { email },
    include: [
      { model: Organizations, as: 'organization' },
      {
        model: UserRole,
        attributes: [['id', 'role_id']],
        include: [{ model: Role, as: 'role' }],
        as: 'user_roles',
      },
      {
        model: UserPermissions,
        attributes: [['id', 'permission_id']],
        include: [{ model: Permission, as: 'permission' }],
        as: 'user_permissions',
      },
    ],
  });

  if (!user || !user?.status || !user?.password) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  // return user;
  // if (!user || !(await bcrypt.compare(password, user.password))) {
  //   throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  // }

  // req.session.org_id = user.organization_id;


  const now = new Date();


  if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
    const lockDuration = (now - new Date(user.last_failed_login)) / (1000 * 60);
    if (lockDuration < LOCK_TIME_MINUTES) {
      // throw new ApiError(httpStatus.UNAUTHORIZED, `Account locked. Try again in ${Math.round(LOCK_TIME_MINUTES - lockDuration)} minutes.`);
      const lockMessage = `Account locked. Try again in ${Math.round(LOCK_TIME_MINUTES - lockDuration)} minutes.`;

      const { name } = await userService.getUserByEmail(email);
      await emailService.sendLoginFailedEmail(email, name, user.organization_id);

      throw new ApiError(httpStatus.UNAUTHORIZED, lockMessage, {
        isLocked: true,
      });




    } else {

      user.failed_login_attempts = 0;
    }
  }


  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {

    user.failed_login_attempts += 1;
    user.last_failed_login = now;

    const remainingAttempts = MAX_FAILED_ATTEMPTS - parseInt(user.failed_login_attempts, 10);
    await user.save();


    throw new ApiError(httpStatus.UNAUTHORIZED, `Incorrect email or password. ${remainingAttempts} attempt(s) left.`);
  }


  const auth_log = insertAuthLog(req, user.id, 1);




  const tenantDb = await getTenantDbInstance(user.organization_id,);
  // return tenantDb;
  const user_preference = await tenantDb.db.user_preferences.findOne({ where: { user_id: user.id } });

  if (!user_preference) {
    await tenantDb.db.user_preferences.create({
      user_id: user.id,
      timezone: auth_log.timezone,
      two_factor_auth: 0
    })
  }




  user.failed_login_attempts = 0;

  await user.save();

  // get permissions for employee


  const employee = await tenantDb.db.employees.findOne({
    where: { user_id: user.id },
  });

  const { success, permission_names } = await getUserPermissions({ db: tenantDb.db, user_id: employee.id });


  const businessUnitList = await employeeService.getAllBusinessUnitNamesForEmployee(tenantDb.db, employee.id);


  user.password = null; // Remove password from the user object
  // insertAuthLog(req, user.id, 1); // Log successful login
  return {
    user, is2FA: user_preference ? user_preference.two_factor_auth : false,
    timeZone: user_preference ? user_preference.time_zone : null,
    dateTimeFormat: user_preference ? user_preference.date_time_format : null,
    profilePic: user_preference ? user_preference.profile_pic : null,
    permissions: permission_names ? permission_names : null,
    businessUnitList: businessUnitList ? businessUnitList : null,
  };
};

/**
 * Logs out a user by invalidating their refresh token.
 *
 * @param {String} refreshToken - The refresh token to invalidate
 * @throws {ApiError} If the refresh token is not found
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
  // req.session.destroy();
  await Token.destroy({ where: { id: refreshTokenDoc.id } });
};

/**
 * Refreshes the user's authentication tokens using the refresh token.
 *
 * @param {String} refreshToken - The refresh token
 * @returns {Object} tokens - New access and refresh tokens
 * @throws {ApiError} If token verification fails
 */
const refreshToken = async (refreshToken, req, res) => {
  try {
    const refreshTokenDoc = await verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await User.findByPk(refreshTokenDoc.user_id);
    if (!user) throw new Error();

    await refreshTokenDoc.destroy();
    return generateAuthTokens(user);
  } catch (error) {
    // clear all cookies in frontend:
    res.clearCookie('jwt');
    res.end();
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Resets a user's password using a token.
 *
 * @param {String} token - JWT reset token
 * @param {String} newPassword - New password to be set
 * @param {Object} req - The request object
 * @throws {ApiError} If token is invalid or user is not found
 */
const resetPassword = async (token, newPassword, req) => {
  const isVerified = jwt.verify(token, process.env.JWT_SECRET);

  if (isVerified.sub) {
    const user = await User.findOne({ where: { id: isVerified.sub } });
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
    }
    user.password = newPassword;
    user.is_active = 0;
    user.status = 1;
    insertAuthLog(req, user.id, 2);
    await user.save();
    const { name } = await userService.getUserByEmail(user.email);
    await emailService.sendResetPasswordSuccessEmail(user.email, name, user.organization_id);
  } else {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Allows the user to set a password if not previously set.
 *
 * @param {String} token - JWT set password token
 * @param {String} newPassword - The new password to set
 * @param {Object} req - The request object
 * @throws {ApiError} If token is invalid or password is already set
 */
const setPassword = async (token, newPassword, req) => {
  const isVerified = jwt.verify(token, process.env.JWT_SECRET);

  if (isVerified.sub) {
    const user = await User.findOne({ where: { id: isVerified.sub } });
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Link is invalid');
    }
    user.password = newPassword;
    user.status = 1;
    insertAuthLog(req, user.id, 4);
    await nullifyToken(user.id, user.organization_id, tokenTypes.SET_PASSWORD);
    await user.save();
  } else {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Logs in a user using OTP.
 *
 * @param {String} email - The user's email
 * @param {String} otp - The OTP provided by the user
 * @param {Object} req - The request object
 * @returns {Object|Boolean} user - The authenticated user object if OTP is valid, or false if invalid
 * @throws {ApiError} If the user or OTP is invalid
 */

// const loginWithOtp = async (email, otp, phone, req) => {
//   let user;

//   if (email) {
//     user = await User.findOne({
//       where: { email },
//       attributes: { exclude: ['password'] },
//       include: [
//         { model: Organizations, as: 'organization' },
//         {
//           model: UserRole,
//           attributes: [['id', 'role_id']],
//           include: [{ model: Role, as: 'role' }],
//           as: 'user_roles',
//         },
//         {
//           model: UserPermissions,
//           attributes: [['id', 'permission_id']],
//           include: [{ model: Permission, as: 'permission' }],
//           as: 'user_permissions',
//         },
//       ],
//     });
//   }

//   if (!user && phone) {
//     user = await User.findOne({
//       where: { phone },
//       attributes: { exclude: ['password'] },
//       include: [
//         { model: Organizations, as: 'organization' },
//         {
//           model: UserRole,
//           attributes: [['id', 'role_id']],
//           include: [{ model: Role, as: 'role' }],
//           as: 'user_roles',
//         },
//         {
//           model: UserPermissions,
//           attributes: [['id', 'permission_id']],
//           include: [{ model: Permission, as: 'permission' }],
//           as: 'user_permissions',
//         },
//       ],
//     });
//   }
//   if (!user) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or phone number');
//   }
//   const tokenData = await Token.findOne({
//     where: {
//       user_id: user.id,
//       token: { [Op.ne]: null },
//       type: tokenTypes.VERIFY_OTP,
//     },
//   });

//   if (!tokenData) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Token not found');
//   }

//   const { token, createdAt } = tokenData;
//   const currentTime = moment();
//   const tokenCreationTime = moment(createdAt);
//   const duration = moment.duration(currentTime.diff(tokenCreationTime));
//   const minutes = duration.asMinutes();

//   if (minutes > 10) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP token has expired');
//   }


//   const isVerified = bcrypt.compareSync(otp, token);

//   if(!isVerified) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP. Please enter valid OTP');
//   }
//   insertAuthLog(req, user.id, 1);

//   return isVerified ? user : false;
// };

const loginWithOtp = async (email, otp, phone, req) => {
  let user;

  if (email) {
    user = await findUser(email, 'email');
  }

  if (!user && phone) {
    user = await findUser(phone, 'phone');
  }

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or phone number');
  }

  const tokenData = await Token.findOne({
    where: {
      user_id: user.id,
      token: { [Op.ne]: null },
      type: tokenTypes.VERIFY_OTP,
    },
  });

  if (!tokenData) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token not found');
  }

  const { token, createdAt } = tokenData;
  const currentTime = moment();
  const tokenCreationTime = moment(createdAt);
  const duration = moment.duration(currentTime.diff(tokenCreationTime));
  const minutes = duration.asMinutes();

  if (minutes > 10) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP token has expired');
  }

  const isVerified = bcrypt.compareSync(otp, token);

  if (!isVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP. Please enter valid OTP');
  }

  const auth_log = insertAuthLog(req, user.id, 1);
  dbName = `org_${user.organization_id}_tenant`;
  const tenantDb = await getTenantDbInstance(user.organization_id, dbName);

  const user_preference = await tenantDb.db.user_preferences.findOne({ where: { user_id: user.id } });

  if (!user_preference) {
    await tenantDb.db.user_preferences.create({
      user_id: user.id,
      timezone: auth_log.timezone,
      two_factor_auth: 0
    })
  }

  const employee = await tenantDb.db.employees.findOne({
    where: { user_id: user.id },
  });

  const { success, permission_names } = await getUserPermissions({ db: tenantDb.db, user_id: employee.id });

  const businessUnitList = await employeeService.getAllBusinessUnitNamesForEmployee(tenantDb.db, employee.id);



  return isVerified ? {
    user: user, is2FA: user_preference ? user_preference.two_factor_auth : false,
    timeZone: user_preference ? user_preference.time_zone : null,
    dateTimeFormat: user_preference ? user_preference.date_time_format : null,
    profilePic: user_preference ? user_preference.profile_pic : null,
    permissions: permission_names ? permission_names : null,
    businessUnitList: businessUnitList ? businessUnitList : null,
  } : false;
};

const generateAndSendOtp = async (user) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = bcrypt.hashSync(otp, 10);


  await Token.create({
    user_id: user.id,
    token: hashedOtp,
    type: tokenTypes.VERIFY_OTP,
  });


  await sendOtpViaSms(user.phone_number, otp);
};

// helper function

const findUser = async (identifier, type) => {
  const whereClause = type === 'email' ? { email: identifier } : { phone: identifier };

  const user = await User.findOne({
    where: whereClause,
    attributes: { exclude: ['password'] },
    include: [
      { model: Organizations, as: 'organization' },
      {
        model: UserRole,
        attributes: [['id', 'role_id']],
        include: [{ model: Role, as: 'role' }],
        as: 'user_roles',
      },
      {
        model: UserPermissions,
        attributes: [['id', 'permission_id']],
        include: [{ model: Permission, as: 'permission' }],
        as: 'user_permissions',
      },
    ],
  });

  return user;
};




module.exports = {
  loginWithPassword,
  loginWithOtp,
  resetPassword,
  setPassword,
  logout,
  refreshToken,
  generateAndSendOtp,
  insertAuthLog
};
