/**
 * @fileoverview Advanced Approval Gate Coordination
 *
 * Prepares TaskMaster for complex approval scenarios with AI-enhanced decision making
 * and multi-stakeholder coordination patterns.
 */

export interface AIReviewerConfig {
  model: string;
  prompt: string;
  criteria: string[];
  expertise: string[];
  weight: number;
}

export interface ApprovalGateConfig {
  name: string;
  coordinationType: 'parallel' | 'sequential' | 'hybrid';
  requiredGates: string[];
  aiTeam: AIReviewerConfig[];
  humanReviewers: {
    role: string;
    expertise: string[];
    weight: number;
  }[];
  autoApprovalConditions?: {
    name: string;
    conditions: string[];
    priority: number;
  }[];
  requiredDocumentation: string[];
  escalationRules?: {
    condition: string;
    action: string;
    stakeholders: string[];
  }[];
}

/**
 * Advanced approval gate configurations for complex scenarios
 */
export const ADVANCED_APPROVAL_GATES: Record<string, ApprovalGateConfig> = {
  SECURITY_REVIEW: {
    name: 'Security Review Gate',
    coordinationType: 'parallel',
    requiredGates: ['security_scan', 'manual_review'],
    aiTeam: [
      {
        model: 'claude-3-5-sonnet',
        prompt: 'Review for security vulnerabilities, secrets, and compliance',
        criteria: ['security', 'compliance', 'threat_assessment'],
        expertise: ['vulnerability_detection', 'compliance', 'threat_modeling'],
        weight: 0.6,
      },
    ],
    humanReviewers: [
      {
        role: 'security_architect',
        expertise: ['system_design', 'security_architecture'],
        weight: 0.8,
      },
    ],
    autoApprovalConditions: [
      {
        name: 'documentation_only',
        conditions: [
          'task.type === "documentation"',
          'task.complexity === "trivial"',
        ],
        priority: 1,
      },
    ],
    requiredDocumentation: [
      'security_assessment',
      'threat_model',
      'compliance_checklist',
    ],
  },

  PRODUCTION_DEPLOYMENT: {
    name: 'Production Deployment Gate',
    coordinationType: 'sequential',
    requiredGates: ['security_review', 'technical_review', 'business_approval'],
    aiTeam: [
      {
        model: 'claude-3-5-sonnet',
        prompt: 'Assess deployment readiness and risk factors',
        criteria: ['deployment_safety', 'rollback_planning', 'monitoring'],
        expertise: ['deployment_safety', 'rollback_planning', 'monitoring'],
        weight: 0.5,
      },
    ],
    humanReviewers: [
      {
        role: 'tech_lead',
        expertise: ['technical_review', 'system_architecture'],
        weight: 0.7,
      },
      {
        role: 'product_owner',
        expertise: ['business_impact', 'user_experience'],
        weight: 0.6,
      },
    ],
    requiredDocumentation: [
      'deployment_plan',
      'rollback_strategy',
      'monitoring_setup',
      'business_justification',
    ],
    escalationRules: [
      {
        condition: 'high_risk_deployment',
        action: 'escalate_to_architecture_board',
        stakeholders: ['cto', 'principal_architect'],
      },
    ],
  },

  COMPLIANCE_AUDIT: {
    name: 'Compliance Audit Gate',
    coordinationType: 'hybrid',
    requiredGates: ['automated_compliance', 'manual_audit'],
    aiTeam: [
      {
        model: 'claude-3-5-sonnet',
        prompt: 'Review for regulatory compliance and audit trail completeness',
        criteria: ['compliance', 'documentation', 'audit_trail'],
        expertise: ['regulatory_requirements', 'audit_trails', 'documentation'],
        weight: 0.4,
      },
    ],
    humanReviewers: [
      {
        role: 'compliance_officer',
        expertise: ['regulatory_requirements', 'audit_procedures'],
        weight: 1.0,
      },
    ],
    requiredDocumentation: [
      'compliance_checklist',
      'audit_trail',
      'regulatory_mapping',
      'risk_assessment',
    ],
  },
} as const;

export type AdvancedApprovalGateType = keyof typeof ADVANCED_APPROVAL_GATES;

export interface ApprovalCoordinationContext {
  gateType: AdvancedApprovalGateType;
  taskId: string;
  requester: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  metadata: Record<string, any>;
}

export interface ApprovalDecision {
  gateName: string;
  reviewerType: 'ai' | 'human';
  reviewerId: string;
  decision: 'approved' | 'rejected' | 'needs_changes';
  reasoning: string;
  confidence: number;
  timestamp: Date;
  evidence?: string[];
}

export interface ApprovalCoordinationResult {
  taskId: string;
  overallDecision: 'approved' | 'rejected' | 'pending' | 'escalated';
  decisions: ApprovalDecision[];
  coordinationMetrics: {
    totalReviewTime: number;
    aiReviewTime: number;
    humanReviewTime: number;
    consensusLevel: number;
  };
  nextSteps?: string[];
  escalationReason?: string;
}
