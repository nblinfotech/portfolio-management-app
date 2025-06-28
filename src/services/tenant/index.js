// Role and permissions
module.exports.userProfileService = require('./user.profile.service');


module.exports.incidentService = require('./hse_incident.service');
module.exports.actionItemService = require('./action.item.service.js');
module.exports.incidentConsequenceService = require('./incident.consequences.service');
module.exports.documentService = require('./document.service');
module.exports.hseIncidentService = require('./hse_incident.service');
module.exports.riskService = require('./risk.service');
module.exports.masterService = require('./masters.service');
module.exports.masterDataService = require('./master_database.service');
module.exports.workflowService = require('./workflow.service');
module.exports.executeWorkflowService = require('./executeWorkflow.service');

module.exports.filterService = require('./filter.service');
module.exports.searchService = require('./search.service');
module.exports.emailTemplateService = require('./email.template.service.js');
module.exports.emailService = require('./email.service.js');
module.exports.settingService = require('./settings.service.js');
module.exports.approvalService = require('./approval.service.js');
module.exports.roleService = require('./role.service.js');
module.exports.permissionService = require('./permission.service.js');
module.exports.notificationService = require('./notification.service.js');
module.exports.employeeService = require('./employee.service.js');
module.exports.trashService = require('./trash.service.js');
module.exports.investigationService = require('./investigation.service.js');
module.exports.observationService = require('./observation.service.js');
module.exports.auditService = require('./audit.service.js');



module.exports.investigationPeoplePositionsService = require("./investigationPeoplePositions.service.js")
module.exports.investigationEquipmentPartsService = require("./investigationEquipmentParts.service.js")
module.exports.investigationProcessesProceduresService = require("./investigationProcessesProcedures.service.js")
module.exports.investigationSequenceEventsService = require("./investigationSequenceEvents.service.js")
module.exports.investigationLessonLearntService = require("./investigationLessonLearnt.service.js")
module.exports.investigationCausationService = require("./investigationCausation.service.js")
module.exports.investigationFishboneService  = require("./investigationFishbone.service.js");

module.exports.checklistService = require("./checklist.service.js");
module.exports.questionCategoryService = require("./questionCategory.service.js");
module.exports.auditService = require("./audit.service.js");
module.exports.checklistQuestionService = require("./checklistQuestion.service.js");
module.exports.checklistSectionService = require("./checklistSection.service.js");

// Inspection
module.exports.inspectionService = require("./inspection.service.js");

// Training
module.exports.trainingService = require("./training.service.js");
module.exports.meetingService = require("./meeting.service.js");

// Dashboard
module.exports.dashboardService = require("./dashboard.service.js");

// calendar
module.exports.calendarService = require("./calendar.service.js");

module.exports.raService = require("./ra.service.js");

module.exports.journeyManagementService = require("./journeyManagement.service.js");
module.exports.journeyPassengerService = require("./journeyPassenger.service.js");
module.exports.journeyRoutePlanService = require("./journeyRoutePlan.service.js");

module.exports.mocService = require("./moc.service.js")
