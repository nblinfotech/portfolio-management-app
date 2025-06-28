const httpStatus = require('http-status');
const models = require('../../models/core');
const EmailTemplate = models.emailTemplate
const ApiError = require('../../utils/ApiError');



// Create a new email template
const createEmailTemplate = async (req) => {
  try {
    const { name, subject, content, type } = req;
    // const stringifiedContent = new DOMParser().parseFromString(content, "text/html").documentElement.textContent;
    const newTemplate = await EmailTemplate.create({ name, subject, content, type });
    return newTemplate;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// Update an existing email template
const updateEmailTemplate = async (id, req) => {
  try {
    const { name, subject, content, type, isActive } = req;

    const [numberOfAffectedRows] = await EmailTemplate.update(
      { name, subject, content, type, isActive },
      { where: { id } }
    );
    if (numberOfAffectedRows > 0) {
      return await EmailTemplate.findOne({ where: { id } });
    } else {
      return [];
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};



// List all email templates
const listEmailTemplates = async () => {
  try {
    const templates = await EmailTemplate.findAll();
    return templates;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// List one email templates
const showOneEmailTemplate = async (id) => {
  try {
    const templates = await EmailTemplate.findOne({ where: { id } });
    return templates;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const showOneEmailTemplateByType = async (type) => {
  try {
    const templates = await EmailTemplate.findOne({ where: { type } });
    console.log('..........',templates);
    return templates;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createEmailTemplate,
  updateEmailTemplate,
  listEmailTemplates,
  showOneEmailTemplate,
  showOneEmailTemplateByType
};
