const express = require('express');
const path = require('path');
const userAuthRoute = require('./user.auth.route');
// const tenantRoute = require('./tenant.route');

const profileRoute = require('./user.profile.route');
const incidentRoute = require('./incident.route');
const documentRoute = require('./document.route');
const fileRoute = require('./file.route');
const mastersRoute = require('./masters.route');
const commonRoute = require('./common.route');
const filterRoute = require('./filter.route');
const searchRoute = require('./search.route');
const eTemplateRoute = require('./email.template.route');
const docsRoute = require('./docs.route');
const approvalRoute = require('./approval.route');

const workflowRoute = require('./workflow.route');
const settingsRoute = require('./settings.route');
const roleRoute = require('./roles.route');
const permissionRoute = require('./permissions.route');
const appNotificationRoute = require('./app-notifications.route');
const trashRoute = require('./trash.route');
const investigationRoute = require('./investigation.route');
const observationRoute = require('./observation.route');
const auditRoute = require('./audit.route');
const investigationFishboneRoute = require('./investigationFishbone.route');
const trainingRoute = require('./training.route');
const assistantRoute = require('./assistant2.route');
const router = express.Router();

// STATIC ROUTES
// Serve static files from the 'uploads' directory
// const uploadsDirectory = path.join(__dirname, '../../../uploads/');
// console.log('Uploads Directory:', uploadsDirectory);
// router.use('/uploads', express.static(uploadsDirectory));

// APPLICATION ROUTES
const defaultRoutes = [
  {
    path: '/auth',
    route: userAuthRoute,
  },
  {
    path: '/profile',
    route: profileRoute,
  },

  {
    path: '/incident',
    route: incidentRoute,
  },
  {
    path: '/documents',
    route: documentRoute,
  },
  {
    path: '/file-operations',
    route: fileRoute,
  },
  {
    path: '/common',
    route: commonRoute,
  },
  {
    path: '/filter',
    route: filterRoute,
  },
  {
    path: '/masters',
    route: mastersRoute,
  },
  {
    path: '/search',
    route: searchRoute,
  },
  {
    path: '/etemplate',
    route: eTemplateRoute,
  },
  {
    path: '/workflows',
    route: workflowRoute,
  },
  {
    path: '/settings',
    route: settingsRoute,
  },
  {
    path: '/docs',
    route: docsRoute,
  },
  {
    path: '/approval',
    route: approvalRoute,
  },
  {
    path: '/roles',
    route: roleRoute,
  },
  {
    path: '/permissions',
    route: permissionRoute,
  },
  {
    path: '/app-notification',
    route: appNotificationRoute,
  },
  {
    path: '/trash',
    route: trashRoute,
  },
  {
    path: '/investigation',
    route: investigationRoute,
  },
  {
    path: '/observation',
    route: observationRoute,
  },
  {
    path: '/audit',
    route: auditRoute,
  },
  {
    path: '/investigationFishbone',
    route: investigationFishboneRoute,
  },
  {
    path: '/inspection',
    route: require('./inspection.route')
  },
  {
    path: '/trainings',
    route: trainingRoute,
  },
  {
    path: '/meeting',
    route: require('./meetings.routes')
  },
  {
    path: '/dashboard',
    route: require('./dashboard.route')
  },
  {
    path: '/meeting',
    route: require('./meetings.routes')
  },
  {
    path: '/calendar',
    route: require('./calendar.routes')
  },
  {
    path: '/assistant',
    route: assistantRoute
  },
  {
    path: '/ra',
    route: require('./ra.route')
  },
  {
    path: '/jm',
    route: require('./journeyManagement.route')
  },
  {
    path: '/oe/moc',
    route: require("./moc.route")
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
