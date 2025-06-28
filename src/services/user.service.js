const httpStatus = require('http-status');
const models = require('../../models/core');
const User = models.users;
const ApiError = require('../../utils/ApiError');
const { generateSetPasswordToken } = require('./user.token.service');
const { sendSetPasswordEmail } = require('./email.service');
const { Op } = require('sequelize');

/**
 * Sends a set password token email to the user.
 *
 * @param {Object} userBody - Object containing user details like email and name
 */
const sendPasswordSetToken = async (userBody) => {
  const token = await generateSetPasswordToken(userBody.email);
  await sendSetPasswordEmail(userBody.email, token, userBody.name);
};

/**
 * Creates a new user and sends them a set password token.
 *
 * @param {Object} userBody - Object containing user details like email, name, etc.
 * @returns {Object} createdUser - The newly created user object
 * @throws {ApiError} If the email is already taken
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const createdUser = await User.create(userBody);
  await sendPasswordSetToken(userBody);
  return createdUser;
};

/**
 * Updates a user's details for a specific organization.
 *
 * @param {Number} organization_id - The ID of the organization
 * @param {Number} user_id - The ID of the user
 * @param {Object} reqBody - The object containing updated user details
 * @returns {Object} updatedUser - The updated user object
 * @throws {ApiError} If the user is not found or the update fails
 */
const patchUserDetails = async (organization_id, user_id, reqBody) => {
  try {
    const user = await getOneUserForOrganization(organization_id, user_id);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }
    await User.update(reqBody, {
      where: {
        id: user_id,
        organization_id: organization_id,
      },
    });
    const updatedUser = await getOneUserForOrganization(organization_id, user_id);
    return updatedUser;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed!');
  }
};

/**
 * Fetches a single user by their ID and organization ID.
 *
 * @param {Number} organization_id - The organization ID
 * @param {Number} id - The user ID
 * @returns {Object} user - The user object or null if not found
 */
const getOneUserForOrganization = async (organization_id, id) => {
  return User.findOne({
    where: {
      id,
      organization_id,
    },
  });
};

/**
 * Fetches all users for a specific organization, excluding the current user.
 *
 * @param {Number} organization_id - The organization ID
 * @param {Number} user_id - The current user's ID to be excluded
 * @returns {Array} users - Array of user objects
 */
const getAllUserForOrganization = async (organization_id, user_id) => {
  return User.findAll({
    where: {
      organization_id,
      
    },
  });
};

/**
 * Fetches all users for a specific organization, incuding the current user.
 *
 * @param {Number} organization_id - The organization ID
 * @param {Number} user_id - The current user's ID
 * @returns {Array} users - Array of user objects
 */
const getAllUserOrganization = async (organization_id) => {
  return User.findAll({
    where: {
      organization_id,
    },
  });
};

/**
 * Deletes a user from an organization.
 *
 * @param {Number} organization_id - The organization ID
 * @param {Number} user_id - The user ID
 * @returns {Boolean} success - True if the user was deleted, false otherwise
 * @throws {ApiError} If the user is not found or is the primary user
 */
const dropUser = async (organization_id, user_id) => {
  const existingUser = await getOneUserForOrganization(organization_id, user_id);
  if (!existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found!');
  }
  if (existingUser.is_primary) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Cannot delete primary user!');
  }
  const result = await User.destroy({
    where: {
      organization_id,
      id: user_id,
    },
  });

  return result > 0;
};

/**
 * Fetches all users in the system, excluding their passwords.
 *
 * @returns {Array} users - Array of user objects
 */
const getAllUsers = async (exclude = []) => {
  return User.findAll({ attributes: { exclude: ['password', ...exclude] } });
};

/**
 * Toggles a user's account active status.
 *
 * @param {Number} organization_id - The organization ID
 * @param {Number} user_id - The user ID
 * @returns {Boolean} success - True if the status was successfully changed, otherwise throws error
 * @throws {ApiError} If the user is not found
 */
const changeAccountStatus = async (organization_id, user_id) => {
  try {
    const user = await getOneUserForOrganization(organization_id, user_id);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }

    user.is_active = !user.is_active;
    await user.save();
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by ID.
 *
 * @param {Number} id - The user ID
 * @returns {Promise<User>} - The user object
 */
const getUserById = async (id, exclude = []) => {
  try {
    return User.findByPk(id, {
      attributes: { exclude },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by email.
 *
 * @param {String} email - The user's email
 * @returns {Promise<User>} - The user object
 */
const getUserByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const getUserByPhone = async (phone) => {
  return User.findOne({ where: { phone } })
};

const getUserByEmailLike = async (email) => {
  return User.findAll({
    where: {
      email: {
        [Op.like]: `%${email}%`, // using like for similar match not exact.
      },
    },
    attributes: ['id', 'email'],
  });
};

/**
 * Updates user details by ID.
 *
 * @param {Number} userId - The user ID
 * @param {Object} updateBody - Object containing the updated details
 * @returns {Promise<User>} - The updated user object
 * @throws {ApiError} If the user is not found or the email is already taken
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Deletes a user by ID.
 *
 * @param {Number} userId - The user ID
 * @returns {Promise<User>} - The deleted user object
 * @throws {ApiError} If the user is not found
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.destroy();
  return user;
};


const toggleUserStatus = async ({  id, status }) => {


  try {
                
      const existingUser = await User.findOne({
          where: { id: id }
      });
      

      if (existingUser) {
         
          const [updatedUserCount] = await User.update(
              { 
                  is_active: status,
                  status: status,
              },
              { where: { id: id } }
          );

          if (updatedUserCount === 0) {
              console.log('No user records updated.');
              return { success: false, message: 'No user records updated.' };
          }

        //   if (status && !existingUser.password) {
        //     await sendPasswordSetToken({
        //         email: existingUser.email,
        //         name: `${existingUser.first_name} ${existingUser.last_name}`
        //     });
        // }
      } else {
         
        //   const newUser = await User.create({
        //       is_active: status,
        //       status: status,
        //       is_primary: false,
             
        //       email: employee.email_id,
        //       organization_id: existingUser.organization_id,
        //   });

        //   if (!newUser) {
        //       console.log('Error creating new user.');
        //       return { success: false, message: 'Error creating new user.' };
        //   }

        //   if (status  && !newUser.password) {
        //     await sendPasswordSetToken({
        //         email: newUser.email,
        //         name: `${newUser.first_name} ${newUser.last_name}`
        //     });
        // }
      }

      console.log('Employee and user status updated (or created) successfully.');
      return { success: true, message: 'Employee and user status updated  successfully.' };

  } catch (error) {
      console.error('Error updating/creating employee and user status:', error);
      throw error;
  }
};


module.exports = {
  createUser,
  getOneUserForOrganization,
  getAllUserForOrganization,
  getAllUserOrganization,
  patchUserDetails,
  dropUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  changeAccountStatus,
  getUserByEmailLike,
  getUserByPhone,
  sendPasswordSetToken,
  toggleUserStatus
};
