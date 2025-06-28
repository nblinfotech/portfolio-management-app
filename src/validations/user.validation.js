const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    first_name: Joi.string().required().messages({
      'string.empty': 'User first name cannot be an empty field',
      'any.required': 'User first name is a required field',
    }),
    last_name: Joi.string().required().messages({
      'string.empty': 'User last name cannot be an empty field',
      'any.required': 'User last name is a required field',
    }),
    email: Joi.string().required().email().messages({
      'string.empty': 'User email cannot be an empty field',
      'string.email': 'User email must be a valid email',
      'any.required': 'User email is a required field',
    }),
    role: Joi.string().required().valid('OrgAdmin', 'User').messages({
      'string.empty': 'Role cannot be an empty field',
      'any.required': 'Role is a required field',
      'any.only': 'Role must be one of [OrgAdmin, User]',
    }),
    organization_id: Joi.number().required(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    user_id: Joi.required(),
    organization_id: Joi.optional(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email().messages({
        'string.empty': 'User email cannot be an empty field',
        'string.email': 'User email must be a valid email',
      }),
      password: Joi.string().allow(''),
      first_name: Joi.string().messages({
        'string.empty': 'User first name cannot be an empty field',
      }),
      last_name: Joi.string().messages({
        'string.empty': 'User second name cannot be an empty field',
      }),
      role: Joi.string().valid('OrgAdmin', 'User', 'Manager', 'Admin').messages({
        'string.empty': 'Role cannot be an empty field',
        'any.only': 'Role must be one of [OrgAdmin, User]',
      }),
      organization_id: Joi.number().optional(),
      is_active: Joi.boolean().optional(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const createRole = {
  body: Joi.object().keys({
    title: Joi.string().required().messages({
      'string.empty': 'title cannot be an empty field',
      'any.required': 'title is a required field',
    }),
    permissions: Joi.array()
      .items(
        Joi.string().required().messages({
          'string.base': 'Each permission must be a string',
          'any.required': 'Permission is required',
        })
      )
      .required()
      .messages({
        'array.base': 'Permissions must be an array',
        'array.includes': 'Each permission must be a number',
        'any.required': 'Permissions is a required field',
      }),
  }),
};

const updateRole = {
  body: Joi.object().keys({
    roleId: Joi.number().required().messages({
      'number.empty': 'roleId cannot be an empty field',
      'any.required': 'roleId is a required field',
    }),
    permissions: Joi.array()
      .items(
        Joi.string().required().messages({
          'string.base': 'Each permission must be a string',
          'any.required': 'Permission is required',
        })
      )
      .required()
      .messages({
        'array.base': 'Permissions must be an array',
        'array.includes': 'Each permission must be a number',
        'any.required': 'Permissions is a required field',
      }),
  }),
};

const assignRole = {
  body: Joi.object().keys({
    userId: Joi.number().required().messages({
      'number.empty': 'userId cannot be an empty field',
      'any.required': 'userId is a required field',
    }),
    roles: Joi.array()
      .items(
        Joi.string().required().messages({
          'string.base': 'Each role must be a string',
          'any.required': 'role is required',
        })
      )
      .required()
      .messages({
        'array.base': 'roles must be an array',
        'array.includes': 'Each roles must be a number',
        'any.required': 'roles is a required field',
      }),
  }),
};

const roleParam = {
  params: Joi.object().keys({
    roleId: Joi.number().integer(),
  }),
};

const roleAndUserParams = {
  params: Joi.object().keys({
    roleCode: Joi.string(),
    userId: Joi.number().integer(),
  }),
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,

  createRole,
  updateRole,
  assignRole,
  roleParam,
  roleAndUserParams,
};
