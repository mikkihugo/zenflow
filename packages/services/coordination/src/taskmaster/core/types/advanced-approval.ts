/**
 * @fileoverview Advanced Approval Gate Coordination
 *
 * Prepares TaskMaster for complex approval scenarios:  {
  SECURITY_REVIEW: 'claude-3-5-sonnet',)      prompt : 'Review for security vulnerabilities, secrets, and compliance')security',)        expertise:['vulnerability_detection,' compliance,'threat_modeling'],';
        weight: 'architect',)        expertise:['system_design,' security_architecture'],';
        weight: 'documentation_only',)        name,        conditions: [')task.type === "documentation",";
         'task.complexity === "trivial",";
],
        priority: 'Production Deployment Gate',)    coordinationType : 'sequential')security_review,' technical_review,'business_approval'],';
    aiTeam: 'reviewer',)        expertise:['deployment_safety,' rollback_planning,'monitoring'],';
        weight: 'Compliance Audit Gate,',
'    aiTeam: 'compliance',)        expertise:['regulatory_requirements,' audit_trails,'documentation'],';
        weight: 1.0,
},
},
    requiredDocumentation: [
     'impact_assessment,')rollback_plan,';
     'approval_justification,';
],
},')} as const;';
