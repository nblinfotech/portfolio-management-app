//CORE MODULES
module.exports.mailService = require('./mailSender');
// BACKEND MODULES
module.exports.backendAuthService = require('./backend.auth.service');
module.exports.backendTokenService = require('./backend.token.service');
module.exports.backendUserService = require('./backend.user.service');

module.exports.emailService = require('./email.service');
module.exports.userService = require('./user.service');
module.exports.authService = require('./user.auth.service');
module.exports.userTokenService = require('./user.token.service');
// Organization
module.exports.orgService = require('./organization.service');

//Apps
module.exports.appService = require('./app.service');

// subcscription plan
module.exports.subscriptionPlanService = require('./subscriptionPlan.service');

// subscripiton
module.exports.subscriptionService = require('./subscription.service');

// Role and permissions
module.exports.userRolePermissions = require('./user.role.permission.service');
module.exports.emailTemplateService = require('./email.template.service');

// Module
module.exports.moduleService = require('./module.service');


