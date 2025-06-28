const httpStatus = require('http-status');
const models = require('../../models/core');
const ApiError = require('../../utils/ApiError');
const { where } = require('sequelize');



const createRole = async (title, permissionCodeList) => {
  // Check if a role with the same title already exists
  const existingRole = await models.role.findOne({ where: { title } });

  if (existingRole) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Role with the same title already exists');
  }
  // If no duplicate role found, proceed with creating a new role
  const createdRole = await models.role.create({ title });
  if (createdRole.id) {
    const foundPermissions = await models.permission.findAll({
      where: {
        code: permissionCodeList
      },
      attributes: ['id', 'code']
    });
    if (foundPermissions.length !== permissionCodeList.length) {
      throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'One or more permissions do not exist');
    }

    for (const foundPermission of foundPermissions) {
      await models.rolePermission.create({
        role_id: createdRole.id,
        permission_id: foundPermission.id,
      });
    }

    return getRoles(createdRole.id);


  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role Creation Faild !');
  }
}


const updateRole = async (id, permissionCodeList) => {
  // Check if the role exists
  const existingRole = await models.role.findOne({ where: { id } });

  if (!existingRole) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Role with the given id does not exist');
  }

  // Start a transaction to ensure data integrity
  const transaction = await models.sequelize.transaction();

  try {

    const oldPermissionIds = await models.rolePermission.findAll({
      where: { role_id: existingRole.id },
      attributes: ['permission_id'],
      raw: true,  // This flattens the result, returning only the data without metadata
    }).then(permissions => permissions.map(permission => permission.permission_id));

    console.log(oldPermissionIds);

    await models.rolePermission.destroy({ where: { role_id: existingRole.id }, transaction });

    // Find permissions based on the provided codes
    const foundPermissions = await models.permission.findAll({
      where: { code: permissionCodeList },
      transaction,
    });

    // Check if all permissions exist
    if (foundPermissions.length !== permissionCodeList.length) {
      throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'One or more permissions do not exist');
    }

    // Assign the new permissions to the role
    const rolePermissionsData = foundPermissions.map(foundPermission => ({
      role_id: existingRole.id,
      permission_id: foundPermission.id,
    }));
    await models.rolePermission.bulkCreate(rolePermissionsData, { transaction });

    // Find all users assigned to this role
    const usersWithRole = await models.userRole.findAll({
      where: { role_id: existingRole.id },
      attributes: ['user_id'],
      transaction,
    });

    // Update each user's permissions based on the new role permissions
    const userPermissionsToUpdate = [];
    const uniqueUserPermissions = new Set();

    for (const userWithRole of usersWithRole) {
      // Remove the user's current permissions associated with this role


      await models.userPermissions.destroy({
        where: { user_id: userWithRole.user_id, permission_id: oldPermissionIds },

      });


      // Collect new permissions to assign to the user
      for (const foundPermission of foundPermissions) {
        const permissionKey = `${userWithRole.user_id}-${foundPermission.id}`;
        if (!uniqueUserPermissions.has(permissionKey)) {
          uniqueUserPermissions.add(permissionKey);
          userPermissionsToUpdate.push({
            user_id: userWithRole.user_id,
            permission_id: foundPermission.id,
          });
        }
      }
    }

    // Bulk insert the updated permissions for all users
    if (userPermissionsToUpdate.length > 0) {
      await models.userPermissions.bulkCreate(userPermissionsToUpdate, { transaction });
    }

    // Commit the transaction
    await transaction.commit();
    return getRoles(existingRole.id);
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    throw error;
  }
};


const assignRole = async (userId, roles) => {
  // Find roles in the database
  const foundRoles = await models.role.findAll({
    where: {
      title: roles
    },
    attributes: ['id', 'title']
  });

  if (foundRoles.length !== roles.length) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'One or more roles do not exist');
  }

  // Remove existing roles and permissions for the user
  await models.userRole.destroy({ where: { user_id: userId } });
  await models.userPermissions.destroy({ where: { user_id: userId } });

  // Track unique permission IDs
  const uniquePermissions = new Set();

  // Assign new roles and collect permissions
  for (const foundRole of foundRoles) {
    const userRoleData = await models.userRole.create({
      role_id: foundRole.id,
      user_id: userId,
    });

    if (!userRoleData) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Role Assignment Failed!');
    }

    const foundPermissions = await models.rolePermission.findAll({
      where: { role_id: foundRole.id },
      attributes: ['permission_id']
    });

    for (const foundPermission of foundPermissions) {
      uniquePermissions.add(foundPermission.permission_id);
    }
  }

  // Insert unique permissions for the user
  const userPermissionsData = Array.from(uniquePermissions).map(permissionId => ({
    user_id: userId,
    permission_id: permissionId,
  }));

  await models.userPermissions.bulkCreate(userPermissionsData);
};

const deleteRole = async (roleId) => {
  try {
    // Check if the role exists
    const roleExists = await models.role.count({ where: { id: roleId } });

    if (roleExists === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }

    // Check if any users are associated with this role
    const userCount = await models.userRole.count({ where: { role_id: roleId } });

    if (userCount > 0) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Unable to delete role, users with this role are present in the system');
    }

    // Get the list of permission IDs associated with this role
    const permissionList = await models.rolePermission.findAll({
      where: { role_id: roleId },
      attributes: ['permission_id'],
      raw: true,
    });

    const permissionIds = permissionList.map(permission => permission.permission_id);

    // Delete the role
    const result = await models.role.destroy({ where: { id: roleId } });

    if (result > 0 && permissionIds.length > 0) {
      // Delete the permissions related to the deleted role from userPermissions
      await models.userPermissions.destroy({
        where: {
          permission_id: permissionIds
        }
      });
    }

    return { message: 'Role deleted successfully' };

  } catch (error) {
    // Handle errors with a meaningful message
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};


const getRoles = async (roleid) => {

  try {
    const roles = await models.role.findAll({
      where: roleid ? { id: roleid } : {},
      include: [
        {
          model: models.permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    return roleid ? roles[0] : roles;

  } catch (error) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Something went wrong');

  }

};

const permissionCheck = async (userId, permissionCode) => {
  try {

    const permission = await models.permission.findOne({
      where: { code: permissionCode },
      attributes: ['id'],
    });

    if (!permission) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Permission does not exist');
    }


    const userHasPermission = await models.userPermissions.findOne({
      where: {
        user_id: userId,
        permission_id: permission.id
      }
    });

    return !!userHasPermission;

  } catch (error) {

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getAllPermissions = async () => {
  return await models.permission.findAll();
};


module.exports = {
  createRole, updateRole, assignRole, deleteRole, getRoles, permissionCheck,getAllPermissions
};
