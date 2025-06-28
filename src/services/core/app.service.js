const httpStatus = require('http-status');
const models = require('../../models/core');
const ApplicationIcons = models.applicationIcons
const ApiError = require('../../utils/ApiError');
const { where } = require('sequelize');
const Apps = models.apps;
const config = require('../../config/core/config');
const fs = require('fs');

/**
 * list apps
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const list = async () => {
  const apps = await Apps.findAll({ order: [['createdAt', 'DESC']] });
  return apps;
};
/**
 * Update user by id
 * @param {ObjectId} appId
 * @param {Object} updateBody
 * @param {Object} application_icon
 * @returns {Promise<Application>}
 */
const updateAppById = async (appId, app_name, description, application_icon, disk_name, delete_image) => {
  const app = await Apps.findOne({ where: { id: appId } });
  if (!app) {
    throw new ApiError(httpStatus.NOT_FOUND, 'App not found');
  }
  application_icon = application_icon ? application_icon : app.application_icon;
  disk_name = disk_name ? disk_name : app.disk_name;
  if (delete_image == 'true') {
    filePath = disk_name + "\\" + application_icon;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file at ${filePath}:`, err);
      } else {
        console.log(`File deleted successfully at ${filePath}`);
      }
    });
    application_icon = null;
    disk_name = null;
  }


  const updateBody = { app_name, description, application_icon, disk_name };
  //console.log(updateBody);
  app.update(updateBody);
  return app;
};



const findById = async (id) => {
  return Apps.findOne({ id });
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getAppById = async (id) => {
  const application = await Apps.findOne
    ({ where: { id: id } })
  return application;
};





/**
 * Delete app by id
 * @param {ObjectId} appId
 * @returns {Promise<App>}
 */
const deleteAppById = async (appId) => {
  const app = await getAppById(appId);
  if (!app) {
    throw new ApiError(httpStatus.NOT_FOUND, 'App not found');
  }
  await app.destroy({ where: { id: appId } });
  return 'Application deleted successfully';
};

/**
 * Create a app
 * @param {Object} appBody
 * @returns {Promise<User>}
 */

const create = async (app_name, description, application_icon, disk_name) => {
  await checkUniqueApplication(app_name);
  const application = await Apps.create({ app_name, description, application_icon, disk_name });
  const appId = application.id;
  if (appId) {
    return application;
  }
};


const checkUniqueApplication = async (app_name) => {
  if (app_name) {
    const appExists = await Apps.findOne({ where: { app_name } });
    if (appExists) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Application already in use');
    }
  }
};

const showOne = async (appId) => {
  const app = await Apps.findOne({
    where: { id: appId },
  });
  return app;
};

module.exports = {
  list,
  create,
  updateAppById,
  deleteAppById,
  showOne,
};
