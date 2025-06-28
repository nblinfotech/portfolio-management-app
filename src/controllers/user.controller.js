const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { userService, userTokenService } = require('../../services/core');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const data = await userService.getAllUsers();
  if (data) {
    res.status(httpStatus.OK).send({ status: httpStatus.OK, message: 'success', data });
  } else {
    res.status(httpStatus.NO_CONTENT).send({ status: httpStatus.NO_CONTENT, message: 'No data available' });
  }
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
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

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const listUserLoginData = catchAsync(async (req, res) => {
  res.send(await userTokenService.listLoginCount());
});

const toggleUserStatus = catchAsync(async (req, res) => {




  const {id,status} = req.body;
  const result = await userService.toggleUserStatus({id,status });
  if (!result) {
      return res.json({status: httpStatus.NO_CONTENT, message: 'No data found'});
  }
  res.json({
      status: httpStatus.OK,
      message: 'User status updated successfully!',
      data: result
  });
});

const getUserByOrganization = catchAsync(async (req, res) => {




  const {id,status} = req.body;
  const result = await userService.toggleUserStatus({id,status });
  if (!result) {
      return res.json({status: httpStatus.NO_CONTENT, message: 'No data found'});
  }
  res.json({
      status: httpStatus.OK,
      message: 'User status updated successfully!',
      data: result
  });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserById,
  listUserLoginData,
  toggleUserStatus,
  getUserByOrganization
};
