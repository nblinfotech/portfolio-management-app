const { Sequelize, DataTypes } = require('sequelize');

// Determine environment (default to 'development')
const env = process.env.NODE_ENV === 'test' ? 'test' : 'development';

// Select the correct environment configuration
const dbEnvConfig = {
  test: {
    host: process.env.MYSQL_HOST_TEST,
    user: process.env.MYSQL_USER_TEST,
    password: process.env.MYSQL_PASSWORD_TEST,
    database: process.env.MYSQL_DATABASE_TEST,
    port: process.env.MYSQL_PORT_TEST,
  },
  development: {
    host: process.env.MYSQL_HOST_DEV,
    user: process.env.MYSQL_USER_DEV,
    password: process.env.MYSQL_PASSWORD_DEV,
    database: process.env.MYSQL_DATABASE_DEV,
    port: process.env.MYSQL_PORT_DEV,
  },
}[env];

console.log(`Using ${env} configuration for database.`);

// Initialize Sequelize with the selected environment's configuration
const sequelize = new Sequelize(
  dbEnvConfig.database,
  dbEnvConfig.user,
  dbEnvConfig.password,
  {
    host: dbEnvConfig.host,
    port: dbEnvConfig.port,
    dialect: 'mysql',
    operatorAliases: false,
  }
);


sequelize
  .authenticate()
  .then(() => {
    console.log('DB connected...');
  })
  .catch((err) => {
    console.log();
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.organizations = require('./organization.js')(sequelize, DataTypes);
db.organizationDocs = require('./organization_docs.js')(sequelize, DataTypes);
db.organizationApps = require('./organization_apps.js')(sequelize, DataTypes);

db.users = require('./user.js')(sequelize, DataTypes);

db.backendUsers = require('./backend_user.js')(sequelize, DataTypes);
db.backendUserToken = require('./backend_user_token.js')(sequelize, DataTypes);

db.apps = require('./app.js')(sequelize, DataTypes);

db.UserToken = require('./user_token.js')(sequelize, DataTypes);

db.subscriptionPlan = require('./subscription_plan.js')(sequelize, DataTypes);
db.subscription = require('./subscription.js')(sequelize, DataTypes);
// RELATIONS STARTS HERE
db.organizations.hasMany(db.organizationDocs, { as: 'documents', foreignKey: 'organization_id' });
db.organizationDocs.belongsTo(db.organizations, { as: 'organization', foreignKey: 'organization_id' });

db.organizations.hasMany(db.users, { as: 'users', foreignKey: 'organization_id' });
db.users.belongsTo(db.organizations, { as: 'organization', foreignKey: 'organization_id' });

db.organizations.hasMany(db.organizationApps, { as: 'connected_apps', foreignKey: 'organization_id' });
db.organizationApps.belongsTo(db.organizations, { as: 'organization', foreignKey: 'organization_id' });

db.apps.hasMany(db.organizationApps, { as: 'connected_organization', foreignKey: 'app_id' });
db.organizationApps.belongsTo(db.apps, { as: 'apps', foreignKey: 'app_id' });

// RELATIONS ENDS HERE
db.subscriptionPlan = require('./subscription_plan.js')(sequelize, DataTypes);
db.subscription = require('./subscription.js')(sequelize, DataTypes);

db.userAuthLog = require('./user_auth_log.js')(sequelize, DataTypes);

// db.sequelize.sync({ force: false })
//     .then(() => {
//         console.log('Yes re-sync done!');
//     })

// Ensure models are associated
// Object.keys(db).forEach(modelName => {
//     if (db[modelName].associate) {
//         db[modelName].associate(db);
//     }
// });

// Sync models
// sequelize.sync({ force: false })
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(err => {
//         console.error('Error creating database & tables:', err);
//     });

//APPLICATIONS STARTS
db.applicationIcons = require('./organization_docs.js')(sequelize, DataTypes);

db.role = require('./role.js')(sequelize, DataTypes);
db.permission = require('./permission.js')(sequelize, DataTypes);
db.rolePermission = require('./role_permission.js')(sequelize, DataTypes);
db.userRole = require('./user_role.js')(sequelize, DataTypes);
db.userPermissions = require('./user_permission.js')(sequelize, DataTypes);
db.emailTemplate = require('./emailTemplate.js')(sequelize, DataTypes);


// Module
db.modules = require('./modules.js')(sequelize, DataTypes);



// Roles and Permission Associations

db.users.hasMany(db.userPermissions, {
  as: 'user_permissions',
  foreignKey: 'user_id',
});
db.userPermissions.belongsTo(db.users, {
  as: 'user',
  foreignKey: 'user_id',
});

db.users.hasMany(db.UserToken, {
  as: 'user_tokens',
  foreignKey: 'user_id',
});
db.UserToken.belongsTo(db.users, {
  as: 'user',
  foreignKey: 'user_id',
});

db.userRole.belongsTo(db.role, {
  as: 'role',
  foreignKey: 'role_id',
});

db.role.hasMany(db.userRole, {
  as: 'user_role',
  foreignKey: 'role_id',
});

db.userPermissions.belongsTo(db.permission, {
  as: 'permission',
  foreignKey: 'permission_id',
});

db.permission.hasMany(db.userPermissions, {
  as: 'user_permission',
  foreignKey: 'permission_id',
});

// User has many UserRoles
db.users.hasMany(db.userRole, { as: 'user_roles', foreignKey: 'user_id' });
db.userRole.belongsTo(db.users, { as: 'user', foreignKey: 'user_id' });

// Role has many RolePermissions
db.role.hasMany(db.rolePermission, { as: 'role_permissions', foreignKey: 'role_id' });
db.rolePermission.belongsTo(db.role, { as: 'role', foreignKey: 'role_id' });

// Permission has many RolePermissions
db.permission.hasMany(db.rolePermission, { as: 'role_permissions', foreignKey: 'permission_id' });
db.rolePermission.belongsTo(db.permission, { as: 'permission', foreignKey: 'permission_id' });

// Role belongs to many Permissions through RolePermission
db.role.belongsToMany(db.permission, {
  through: db.rolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});

// Permission belongs to many Roles through RolePermission
db.permission.belongsToMany(db.role, {
  through: db.rolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

//APPLICATIONS ENDS
module.exports = db;
