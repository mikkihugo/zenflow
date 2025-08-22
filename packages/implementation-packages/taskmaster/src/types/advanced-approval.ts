/**
 * @fileoverview Advanced Approval Gate Coordination
 *
 * Prepares TaskMaster for complex approval scenarios:
 * - Multi-gate coordination
 * - AI team consultations
 * - Teamwork package integration
 * - Role-based AI specialists
 */

export interface GateCoordinationConfig {
  enabled: boolean;
  coordinationType: 'sequential|parallel|conditional|consensus';
  gateIds: string[];
  coordinationRules: CoordinationRule[];
  timeoutStrategy: 'fail|escalate|partial_approval';
  requiredConsensus?: number; // For consensus type
}

export interface CoordinationRule {
  id: string;
  name: string;
  condition: string; // JavaScript expression
  action: 'block|proceed|escalate|consult_ai_team';
  priority: number;
  metadata: Record<string, unknown>;
}

/**
 * AI Team Consultation System
 * Integrates with claude-zen intelligence and teamwork packages
 */
export interface AITeamConsultation {
  id: string;
  requestId: string;
  gateId: string;
  taskId: string;

  // Team configuration
  team: {
    architect?: AISpecialist;
    security?: AISpecialist;
    compliance?: AISpecialist;
    reviewer?: AISpecialist;
    custom?: AISpecialist[];
  };

  // Consultation process
  consultationType: 'advisory|blocking|informational';
  consensus: {
    required: boolean;
    threshold: number; // 0.0 - 1.0
    strategy: 'majority|unanimous|weighted';
  };

  // Results
  recommendations: AIRecommendation[];
  finalDecision?: 'approve|reject|escalate|modify';
  confidence: number;

  // Audit
  createdAt: Date;
  completedAt?: Date;
  metadata: Record<string, unknown>;
}

export interface AISpecialist {
  role: 'architect|security|compliance|reviewer|custom';
  name: string;
  model: string;
  prompt: string;
  expertise: string[];
  weight: number; // For weighted consensus
  maxTokens: number;
  temperature: number;
}

export interface AIRecommendation {
  specialistRole: string;
  decision: 'approve|reject|needs_changes';
  confidence: number;
  reasoning: string;
  concerns: string[];
  suggestions: string[];
  riskAssessment: {
    level: 'low|medium|high|critical';
    factors: string[];
  };
  metadata: Record<string, unknown>;
}

/**
 * Cross-Gate Dependencies
 * For complex approval workflows
 */
export interface GateDependency {
  id: string;
  sourceGateId: string;
  targetGateId: string;
  dependencyType: 'blocks|triggers|informs|modifies';
  condition?: string; // When dependency applies
  weight: number; // Influence strength
  metadata: Record<string, unknown>;
}

/**
 * Dynamic Approval Rules
 * Rules that can evolve based on AI learning
 */
export interface DynamicApprovalRule {
  id: string;
  name: string;
  baseRule: string; // JavaScript expression
  aiEnhancements: {
    enabled: boolean;
    learningWeight: number;
    adaptationRate: number;
    confidenceThreshold: number;
  };
  performance: {
    successRate: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    adjustmentHistory: RuleAdjustment[];
  };
  lastUpdated: Date;
  version: number;
}

export interface RuleAdjustment {
  timestamp: Date;
  oldRule: string;
  newRule: string;
  reason: string;
  confidence: number;
  triggeredBy: 'ai_learning|human_override|performance_analysis';
}

/**
 * Enterprise Approval Patterns
 * Common patterns for complex organizations
 */
export interface ApprovalPattern {
  id: string;
  name: string;
  description: string;
  pattern:|'dual_control|segregation_of_duties|escalation_matrix|risk_based|consensus_building';

  configuration: {
    roles: string[];
    minimumLevels: number;
    maxParallelApprovals: number;
    timeoutEscalation: boolean;
    aiAssistance: boolean;
  };

  applicability: {
    taskTypes: string[];
    riskLevels: string[];
    complianceRequirements: string[];
  };
}

/**
 * Approval Gate Analytics
 * Advanced metrics for optimization
 */
export interface AdvancedApprovalMetrics {
  coordinationEfficiency: {
    averageCoordinationTime: number;
    coordinationSuccessRate: number;
    bottleneckDetection: string[];
  };

  aiTeamPerformance: {
    consultationAccuracy: number;
    averageConsultationTime: number;
    humanOverrideRate: number;
    specialistAgreementRate: Record<string, number>;
  };

  patternEffectiveness: {
    patternUsage: Record<string, number>;
    patternSuccessRates: Record<string, number>;
    optimizationOpportunities: string[];
  };

  learningProgress: {
    ruleEvolution: number; // How many rules have been improved
    adaptationSpeed: number; // How quickly system learns
    stabilityIndex: number; // How stable the system is
  };
}

/**
 * Integration Points with claude-zen ecosystem
 */
export interface ClaudeZenIntegration {
  // Teamwork package integration
  teamwork: {
    enabled: boolean;
    coordinatorId?: string;
    teamTopology: 'hierarchical|flat|matrix';
    communicationChannels: string[];
  };

  // SAFE framework integration
  safe: {
    enabled: boolean;
    complianceLevel: 'basic|enhanced|strict';
    auditRequirements: string[];
  };

  // Intelligence facade integration
  intelligence: {
    brainSystemId?: string;
    neuralPatterns: string[];
    learningEnabled: boolean;
  };

  // Event system integration
  events: {
    publishDecisions: boolean;
    subscribeToExternalEvents: boolean;
    eventChannels: string[];
  };
}

/**
 * Future Extension Points
 */
export interface ExtensionHooks {
  // Custom approval logic
  customEvaluators: Array<{
    name: string;
    handler: string; // Function reference
    priority: number;
  }>;

  // External system integrations
  externalSystems: Array<{
    name: string;
    type: 'jira|github|slack|custom';
    webhookUrl?: string;
    apiConfig?: Record<string, unknown>;
  }>;

  // Workflow engine hooks
  workflowHooks: Array<{
    event:|'before_approval|after_approval|on_timeout|on_escalation';
    handler: string;
    async: boolean;
  }>;

  // ML model integration
  mlModels: Array<{
    name: string;
    type: 'classification|regression|reinforcement';
    endpoint?: string;
    config: Record<string, unknown>;
  }>;
}

/**
 * Configuration Templates
 * Pre-built configurations for common scenarios
 */
export const APPROVAL_TEMPLATES = {
  SECURITY_REVIEW: {
    name: 'Security Review Gate',
    llmConfig: {
      model: 'claude-3-5-sonnet',
      prompt: 'Review for security vulnerabilities, secrets, and compliance',
      criteria: ['no_secrets', 'secure_patterns', 'compliance_check'],
      confidenceThreshold: 0.9,
    },
    aiTeam: {
      security: {
        role: 'security',
        expertise: ['vulnerability_detection', 'compliance', 'threat_modeling'],
        weight: 0.8,
      },
      architect: {
        role: 'architect',
        expertise: ['system_design', 'security_architecture'],
        weight: 0.6,
      },
    },
    autoApprovalRules: [
      {
        id: 'documentation_only',
        name: 'Documentation Changes',
        conditions: [
          'task.type === "documentation"',
          'task.complexity === "trivial"',
        ],
        priority: 100,
      },
    ],
  },

  PRODUCTION_DEPLOYMENT: {
    name: 'Production Deployment Gate',
    coordinationType: 'sequential',
    requiredGates: ['security_review', 'technical_review', 'business_approval'],
    aiTeam: {
      reviewer: {
        role: 'reviewer',
        expertise: ['deployment_safety', 'rollback_planning', 'monitoring'],
        weight: 0.9,
      },
    },
  },

  COMPLIANCE_AUDIT: {
    name: 'Compliance Audit Gate',
    aiTeam: {
      compliance: {
        role: 'compliance',
        expertise: ['regulatory_requirements', 'audit_trails', 'documentation'],
        weight: 1.0,
      },
    },
    requiredDocumentation: [
      'impact_assessment',
      'rollback_plan',
      'approval_justification',
    ],
  },
} as const;
