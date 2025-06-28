'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert roles
    const roles = await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'Admin', organization_id: null, created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'Manager', organization_id: null, created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'Employee', organization_id: null, created_at: new Date(), updated_at: new Date() },
    ], { returning: true });


    // const user_role = await queryInterface.bulkInsert('user_roles', [
    //   { user_id: 1, role_id: 1, created_at: new Date(), updated_at: new Date() },

    // ], { returning: true });

    // Insert permissions
    const permissions = await queryInterface.bulkInsert('permissions', [
      { id: 1, name: 'add_incident', module_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'view_incident', module_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'edit_incident', module_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 4, name: 'delete_incident', module_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 5, name: 'view_incidents', module_id: 1, created_at: new Date(), updated_at: new Date() },

      { id: 6, name: 'add_investigation', module_id: 2, created_at: new Date(), updated_at: new Date() },
      { id: 7, name: 'view_investigation', module_id: 2, created_at: new Date(), updated_at: new Date() },
      { id: 8, name: 'edit_investigation', module_id: 2, created_at: new Date(), updated_at: new Date() },
      { id: 9, name: 'delete_investigation', module_id: 2, created_at: new Date(), updated_at: new Date() },
      { id: 10, name: 'view_investigations', module_id: 2, created_at: new Date(), updated_at: new Date() },

      { id: 11, name: 'add_incident_action_item', module_id: 3, created_at: new Date(), updated_at: new Date() },
      { id: 12, name: 'view_incident_action_item', module_id: 3, created_at: new Date(), updated_at: new Date() },
      { id: 13, name: 'edit_incident_action_item', module_id: 3, created_at: new Date(), updated_at: new Date() },
      { id: 14, name: 'delete_incident_action_item', module_id: 3, created_at: new Date(), updated_at: new Date() },
      { id: 15, name: 'view_incident_action_items', module_id: 3, created_at: new Date(), updated_at: new Date() },

      { id: 16, name: 'add_investigation_action_item', module_id: 4, created_at: new Date(), updated_at: new Date() },
      { id: 17, name: 'view_investigation_action_item', module_id: 4, created_at: new Date(), updated_at: new Date() },
      { id: 18, name: 'edit_investigation_action_item', module_id: 4, created_at: new Date(), updated_at: new Date() },
      { id: 19, name: 'delete_investigation_action_item', module_id: 4, created_at: new Date(), updated_at: new Date() },
      { id: 20, name: 'view_investigation_action_items', module_id: 4, created_at: new Date(), updated_at: new Date() },

      { id: 21, name: 'add_hse_report', module_id: 5, created_at: new Date(), updated_at: new Date() },
      { id: 22, name: 'view_hse_report', module_id: 5, created_at: new Date(), updated_at: new Date() },
      { id: 23, name: 'edit_hse_report', module_id: 5, created_at: new Date(), updated_at: new Date() },
      { id: 24, name: 'delete_hse_report', module_id: 5, created_at: new Date(), updated_at: new Date() },
      { id: 25, name: 'view_hse_reports', module_id: 5, created_at: new Date(), updated_at: new Date() },

      { id: 26, name: 'add_hse_workflow', module_id: 6, created_at: new Date(), updated_at: new Date() },
      { id: 27, name: 'view_hse_workflow', module_id: 6, created_at: new Date(), updated_at: new Date() },
      { id: 28, name: 'edit_hse_workflow', module_id: 6, created_at: new Date(), updated_at: new Date() },
      { id: 29, name: 'delete_hse_workflow', module_id: 6, created_at: new Date(), updated_at: new Date() },
      { id: 30, name: 'view_hse_workflows', module_id: 6, created_at: new Date(), updated_at: new Date() },

      { id: 31, name: 'add_hse_approval', module_id: 7, created_at: new Date(), updated_at: new Date() },
      { id: 32, name: 'view_hse_approval', module_id: 7, created_at: new Date(), updated_at: new Date() },
      { id: 33, name: 'edit_hse_approval', module_id: 7, created_at: new Date(), updated_at: new Date() },
      { id: 34, name: 'delete_hse_approval', module_id: 7, created_at: new Date(), updated_at: new Date() },
      { id: 35, name: 'view_hse_approvals', module_id: 7, created_at: new Date(), updated_at: new Date() },

      { id: 36, name: 'view_hse_dashboard', module_id: 10, created_at: new Date(), updated_at: new Date() },
      { id: 37, name: 'view_observations_dashboard', module_id: 11, created_at: new Date(), updated_at: new Date() },

      { id: 38, name: 'view_settings', module_id: 12, created_at: new Date(), updated_at: new Date() },
      { id: 39, name: 'view_trashed_items', module_id: 13, created_at: new Date(), updated_at: new Date() },

      { id: 40, name: 'add_observations_action_item', module_id: 9, created_at: new Date(), updated_at: new Date() },
      { id: 41, name: 'view_observations_action_item', module_id: 9, created_at: new Date(), updated_at: new Date() },
      { id: 42, name: 'edit_observations_action_item', module_id: 9, created_at: new Date(), updated_at: new Date() },
      { id: 43, name: 'delete_observations_action_item', module_id: 9, created_at: new Date(), updated_at: new Date() },
      { id: 44, name: 'view_observations_action_items', module_id: 9, created_at: new Date(), updated_at: new Date() },

      { id: 45, name: 'add_observations_workflow', module_id: 14, created_at: new Date(), updated_at: new Date() },
      { id: 46, name: 'view_observations_workflow', module_id: 14, created_at: new Date(), updated_at: new Date() },
      { id: 47, name: 'edit_observations_workflow', module_id: 14, created_at: new Date(), updated_at: new Date() },
      { id: 48, name: 'delete_observations_workflow', module_id: 14, created_at: new Date(), updated_at: new Date() },
      { id: 49, name: 'view_observations_workflows', module_id: 14, created_at: new Date(), updated_at: new Date() },

      { id: 50, name: 'add_observation', module_id: 8, created_at: new Date(), updated_at: new Date() },
      { id: 51, name: 'view_observation', module_id: 8, created_at: new Date(), updated_at: new Date() },
      { id: 52, name: 'edit_observation', module_id: 8, created_at: new Date(), updated_at: new Date() },
      { id: 53, name: 'delete_observation', module_id: 8, created_at: new Date(), updated_at: new Date() },
      { id: 54, name: 'view_observations', module_id: 8, created_at: new Date(), updated_at: new Date() },

      { id: 55, name: 'add_safety_alert', module_id: 15, created_at: new Date(), updated_at: new Date() },
      { id: 56, name: 'view_safety_alert', module_id: 15, created_at: new Date(), updated_at: new Date() },
      { id: 57, name: 'edit_safety_alert', module_id: 15, created_at: new Date(), updated_at: new Date() },
      { id: 58, name: 'delete_safety_alert', module_id: 15, created_at: new Date(), updated_at: new Date() },
      { id: 59, name: 'view_safety_alerts', module_id: 15, created_at: new Date(), updated_at: new Date() },


      // Audits starts here
      { id: 60, name: 'view_audits_dashboard', module_id: 17, created_at: new Date(), updated_at: new Date() },

      { id: 61, name: 'view_audit_templates', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 62, name: 'view_audit_template', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 63, name: 'edit_audit_template', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 64, name: 'delete_audit_template', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 65, name: 'add_audit_template', module_id: 17, created_at: new Date(), updated_at: new Date() },

      { id: 66, name: 'view_assigned_audits', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 67, name: 'view_assigned_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 68, name: 'edit_assigned_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 69, name: 'delete_assigned_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 70, name: 'add_assigned_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },

      { id: 71, name: 'view_audits', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 72, name: 'view_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 73, name: 'edit_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 74, name: 'delete_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 75, name: 'add_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },

      { id: 76, name: 'view_action_item_audits', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 77, name: 'view_action_item_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 78, name: 'edit_action_item_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 79, name: 'delete_action_item_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 80, name: 'add_action_item_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },

      { id: 81, name: 'view_approval_audits', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 82, name: 'view_approval_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 83, name: 'edit_approval_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 84, name: 'delete_approval_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },
      { id: 85, name: 'add_approval_audit', module_id: 17, created_at: new Date(), updated_at: new Date() },

      { id: 86, name: 'add_observations_approval', module_id: 8, created_at: new Date(), updated_at: new Date() },
      { id: 87, name: 'view_observations_approval', module_id: 8, created_at: new Date(), updated_at: new Date() },
      { id: 88, name: 'edit_observations_approval', module_id: 8, created_at: new Date(), updated_at: new Date() },
      { id: 89, name: 'delete_observations_approval', module_id: 8, created_at: new Date(), updated_at: new Date() },
      { id: 90, name: 'view_observations_approvals', module_id: 8, created_at: new Date(), updated_at: new Date() },


      // Inspections start here
      { id: 91, name: 'view_inspections_dashboard', module_id: 16, created_at: new Date(), updated_at: new Date() },

      { id: 92, name: 'view_inspection_templates', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 93, name: 'view_inspection_template', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 94, name: 'edit_inspection_template', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 95, name: 'delete_inspection_template', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 96, name: 'add_inspection_template', module_id: 16, created_at: new Date(), updated_at: new Date() },

      { id: 97, name: 'view_assigned_inspections', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 98, name: 'view_assigned_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 99, name: 'edit_assigned_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 100, name: 'delete_assigned_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 101, name: 'add_assigned_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },

      { id: 102, name: 'view_perform_inspections', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 103, name: 'view_perform_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 104, name: 'edit_perform_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 105, name: 'delete_perform_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 106, name: 'add_perform_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },

      { id: 107, name: 'view_action_item_inspections', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 108, name: 'view_action_item_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 109, name: 'edit_action_item_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 110, name: 'delete_action_item_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 111, name: 'add_action_item_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },

      { id: 112, name: 'view_approval_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 113, name: 'view_approval_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 114, name: 'edit_approval_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 115, name: 'delete_approval_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      { id: 116, name: 'add_approval_inspection', module_id: 16, created_at: new Date(), updated_at: new Date() },
      // audit action iteams

      { id: 117, name: 'add_audits_action_item', module_id: 19, created_at: new Date(), updated_at: new Date() },
      { id: 118, name: 'view_audits_action_item', module_id: 19, created_at: new Date(), updated_at: new Date() },
      { id: 119, name: 'edit_audits_action_item', module_id: 19, created_at: new Date(), updated_at: new Date() },
      { id: 120, name: 'delete_audits_action_item', module_id: 19, created_at: new Date(), updated_at: new Date() },
      { id: 121, name: 'view_audits_action_items', module_id: 19, created_at: new Date(), updated_at: new Date() },

      // audit approval
      { id: 122, name: 'view_approval_audits', module_id: 19, created_at: new Date(), updated_at: new Date() },
      { id: 123, name: 'view_approval_audit', module_id: 19, created_at: new Date(), updated_at: new Date() },
      { id: 124, name: 'edit_approval_audit', module_id: 19, created_at: new Date(), updated_at: new Date() },
      { id: 125, name: 'delete_approval_audit', module_id: 19, created_at: new Date(), updated_at: new Date() },
      { id: 126, name: 'add_approval_audit', module_id: 19, created_at: new Date(), updated_at: new Date() },



      { id: 127, name: 'add_meetings', module_id: 23, created_at: new Date(), updated_at: new Date() },
      { id: 128, name: 'edit_meetings', module_id: 23, created_at: new Date(), updated_at: new Date() },
      { id: 129, name: 'delete_meetings', module_id: 23, created_at: new Date(), updated_at: new Date() },
      { id: 130, name: 'view_meetingss', module_id: 23, created_at: new Date(), updated_at: new Date() },
      { id: 131, name: 'view_meetings', module_id: 23, created_at: new Date(), updated_at: new Date() },


      { id: 132, name: 'add_meetings_action_item', module_id: 23, created_at: new Date(), updated_at: new Date() },
      { id: 133, name: 'view_meetings_action_item', module_id: 23, created_at: new Date(), updated_at: new Date() },
      { id: 134, name: 'edit_meetings_action_item', module_id: 23, created_at: new Date(), updated_at: new Date() },
      { id: 135, name: 'delete_meetings_action_item', module_id: 23, created_at: new Date(), updated_at: new Date() },
      { id: 136, name: 'view_action_item_meetings', module_id: 23, created_at: new Date(), updated_at: new Date() },

      { id: 137, name: 'view_meetings_dashboard', module_id: 23, created_at: new Date(), updated_at: new Date() },

      
      { id: 138, name: 'add_trainings', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 139, name: 'edit_trainings', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 140, name: 'delete_trainings', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 141, name: 'view_training', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 142, name: 'view_trainings', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 143, name: 'view_compliances', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 144, name: 'view_compliance', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 145, name: 'add_compliance', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 146, name: 'edit_compliance', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 147, name: 'delete_compliance', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 148, name: 'add_course_to_compliances', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 149, name: 'view_trainings_dashboard', module_id: 24, created_at: new Date(), updated_at: new Date() },
      { id: 150, name: 'view_trainings_matrix', module_id: 24, created_at: new Date(), updated_at: new Date() },
    ], { returning: true });
    





    await queryInterface.bulkInsert('role_permissions', [
      // Admin role permissions
      { role_id: 1, permission_id: 1, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 2, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 3, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 4, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 5, created_at: new Date(), updated_at: new Date() },


      { role_id: 1, permission_id: 6, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 7, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 8, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 9, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 10, created_at: new Date(), updated_at: new Date() },

      { role_id: 1, permission_id: 11, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 12, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 13, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 14, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 15, created_at: new Date(), updated_at: new Date() },

      { role_id: 1, permission_id: 16, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 17, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 18, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 19, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 20, created_at: new Date(), updated_at: new Date() },

      { role_id: 1, permission_id: 21, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 22, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 23, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 24, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 25, created_at: new Date(), updated_at: new Date() },

      { role_id: 1, permission_id: 26, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 27, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 28, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 29, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 30, created_at: new Date(), updated_at: new Date() },

      { role_id: 1, permission_id: 31, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 32, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 33, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 34, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 35, created_at: new Date(), updated_at: new Date() },

      { role_id: 1, permission_id: 36, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 37, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 38, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 39, created_at: new Date(), updated_at: new Date() },

      { role_id: 1, permission_id: 40, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 41, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 42, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 43, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 44, created_at: new Date(), updated_at: new Date() },

      { role_id: 1, permission_id: 45, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 46, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 47, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 48, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 49, created_at: new Date(), updated_at: new Date() },


      { role_id: 1, permission_id: 50, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 51, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 52, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 53, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 54, created_at: new Date(), updated_at: new Date() },

      { role_id: 1, permission_id: 55, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 56, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 57, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 58, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 59, created_at: new Date(), updated_at: new Date() },

      // audit permission for admin
      { role_id: 1, permission_id: 60, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 61, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 62, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 63, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 64, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 65, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 66, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 67, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 68, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 69, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 70, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 71, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 72, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 73, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 74, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 75, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 76, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 77, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 78, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 79, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 80, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 81, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 82, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 83, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 84, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 85, created_at: new Date(), updated_at: new Date() },
      // obsertvation
      { role_id: 1, permission_id: 86, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 87, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 88, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 89, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 90, created_at: new Date(), updated_at: new Date() },


      // Inspection for admin
      { role_id: 1, permission_id: 91, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 92, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 93, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 94, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 95, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 96, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 97, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 98, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 99, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 100, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 101, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 102, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 103, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 104, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 105, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 106, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 107, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 108, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 109, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 110, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 111, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 112, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 113, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 114, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 115, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 116, created_at: new Date(), updated_at: new Date() },

      // audit action iteam
      { role_id: 1, permission_id: 117, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 118, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 119, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 120, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 121, created_at: new Date(), updated_at: new Date() },

      //audit approval
      { role_id: 1, permission_id: 122, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 123, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 124, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 125, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 126, created_at: new Date(), updated_at: new Date() },

      // meetings
      { role_id: 1, permission_id: 127, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 128, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 129, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 130, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 131, created_at: new Date(), updated_at: new Date() },

      // meeting action iteam
      { role_id: 1, permission_id: 132, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 133, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 134, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 135, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 136, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 137, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 138, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 139, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 140, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 141, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 142, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 143, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 144, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 145, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 146, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 147, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 148, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 149, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 150, created_at: new Date(), updated_at: new Date() },


      // manager role permissions
      { role_id: 2, permission_id: 5, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 2, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 7, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 10, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 12, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 15, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 17, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 20, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 22, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 25, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 27, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 30, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 32, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 35, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 36, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 37, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 41, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 44, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 46, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 49, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 51, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 54, created_at: new Date(), updated_at: new Date() },

      { role_id: 2, permission_id: 56, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 59, created_at: new Date(), updated_at: new Date() },


      // employee role permissions

      { role_id: 3, permission_id: 5, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 2, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 7, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 10, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 12, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 15, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 17, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 20, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 22, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 25, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 27, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 30, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 32, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 35, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 36, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 37, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 41, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 44, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 46, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 49, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 51, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 54, created_at: new Date(), updated_at: new Date() },

      { role_id: 3, permission_id: 56, created_at: new Date(), updated_at: new Date() },
      { role_id: 3, permission_id: 59, created_at: new Date(), updated_at: new Date() },


    ]);
  },

  async down(queryInterface, Sequelize) {
    // Delete all seeded role_permissions, permissions, and roles
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
