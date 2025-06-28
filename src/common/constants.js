const genericExcludes = {
  user: ['password', 'createdAt', 'updatedAt', 'is_primary', 'organization_id', 'status', 'role'],
  masters: ['createdAt', 'updatedAt', 'description'],
  hseIncidents: ['updatedAt', 'created_at', 'updated_at', 'incident_type_other'],
  employees: ['createdAt', 'date_of_birth', 'department', 'designation', 'gender', 'job_position', 'joining_date', 'last_name', 'location', 'middle_name', 'payroll_no', 'status', 'updatedAt',],
  hseInvestigations: ['updatedAt', 'created_at', 'updated_at'],
  inspections: ['updatedAt', 'created_at', 'updated_at','createdAt'],
  common:['createdAt','updatedAt','created_at','updated_at'],

};

//
const globalSearchGenericExclude = {
  hse_incidents: ['updatedAt', 'created_at', 'updated_at'],
  audit_templates: ['updatedAt', 'created_at', 'updated_at'],

};
const globalSearchGenericInclude = {

  hse_incidents: {
    fields: ['reference_no', 'summary', 'incident_type_other', 'incident_description'],
    associations: [
      {
        model: 'business_units',
        as: 'businessUnit',
        fields: ['training_compliance', 'name'],
      },

    ],
  },

  training: {
    fields: ['status', 'appeared', 'completed_on'],
    associations: [
      // {
      //   model: 'employees',
      //   as: 'trainingEmployee',
      //   fields: ['first_name'],
      // },
      {
        model: 'courses',
        as: 'trainingCourse',
        fields: [ 'title'],
      },
     

    ],
  },


  action_items: {
    fields: ['entity_id', 'type', 'action', 'action_party_id', 'approver_id', 'priority_id', 'raised_date', 'target_date'],
    associations: [
      {
        model: 'employees',
        as: 'Employee',
        fields: ['first_name'],
      },
      {
        model: 'action_item_types',
        as: 'ActionItemType',
        fields: ['name'],
      },
      {
        model: 'hse_incidents',
        as: 'Incident',
        fields: ['reference_no'],
      },
    ],
  },


  audit_templates: {
    fields: ['name', 'description'],
    associations: [],
  },

  audits: {
    fields: ['stage', 'action_item_status'],
    associations: [
      {
      model: 'assigned_audits',
      as: 'AssignedAudit',
      fields: ['business_unit_thirdparty_name'],
    },


  ],
  },


  assigned_audits: {
    fields: ['business_unit_thirdparty_name'],
    associations: [
      {
        model: 'audit_templates',
        as: 'AssignedAuditTemplate',
        fields: ['name', 'description'],
      },
      {
        model: 'business_units',
        as: 'assignedAuditBu',
        fields: ['name'],
      },
    ],
  },


};


module.exports = {
  genericExcludes,
  globalSearchGenericExclude,
  globalSearchGenericInclude,
};
