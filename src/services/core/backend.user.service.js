const httpStatus = require('http-status');
const models = require('../../models/core');
const backendUser = models.backendUsers
const ApiError = require('../../utils/ApiError');


const createUser = async (userBody) => {
  if (await backendUser.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return backendUser.create(userBody);
};


const queryUsers = async () => {
  const users = await backendUser.findAll({
    order: [
      ['createdAt', 'DESC']
    ]
  });
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Users Not Found');
  }
  return users;
};



const getUserById = async (id) => {
  try {

    const user = await backendUser.findByPk(id);

    return user;
  } catch (error) {

    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    return await backendUser.findOne({ where: { email } });
  } catch (error) {
    throw error;
  }

};


const updateUserById = async (userId, newData) => {
  try {


    if (newData.email) {
      const existingUser = await backendUser.findOne({ where: { email: newData.email } });
      if (existingUser && existingUser.id != userId) {


        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');

      }
    }
    const user = await backendUser.findByPk(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }


    if (newData.name) user.name = newData.name;
    if (newData.role) user.role = newData.role;
    if (newData.email) user.email = newData.email;
    if (newData.password) user.password = newData.password;

    await user.save();

    return user;


  } catch (error) {

    throw error;
  }
}



const deleteUserById = async (userId) => {
  try {
    const user = await backendUser.findByPk(userId);

    if (!user) {

      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await backendUser.destroy({
      where: { id: userId }
    });


    return { message: 'User deleted successfully' };
  } catch (error) {

    throw error;
  }
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
