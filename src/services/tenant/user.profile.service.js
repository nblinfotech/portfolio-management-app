const httpStatus = require('http-status');
const models = require('../../models/core');
const User = models.users
const ApiError = require('../../utils/ApiError');


const getProfile = async (userId) => {

  const user = await User.findOne({
    where: {
      id: userId
    },
  });
  return user;
};

const changePassword = async (userId, body) => {

  // await new Promise((resolve) => setTimeout(resolve, 6000));

  const { oldPassword, newPassword } = body;

  const user = await User.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isOldPasswordValid = await user.isPasswordMatch(oldPassword);

  if (!isOldPasswordValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Old password is incorrect');
  }

  if (newPassword.length < 8) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New password must be at least 8 characters long');
  }

  user.password = newPassword;
  await user.save();

  return user;
};





module.exports = {
  getProfile, changePassword
};
