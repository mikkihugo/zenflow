/**
 * EU AI Act and Regulatory Compliance Framework
 * 
 * This package provides comprehensive compliance capabilities for Claude Zen,
 * focusing on EU AI Act requirements but extensible to other regulations.
 * 
 * Key Features:
 * - EU AI Act risk assessment and classification
 * - Human oversight management
 * - Comprehensive audit trails
 * - Bias detection and monitoring
 * - Compliance reporting and export
 * 
 * @example
 * ```typescript
 * import { ComplianceFramework } from '@claude-zen/compliance';
 * 
 * // Initialize compliance framework
 * const compliance = new ComplianceFramework({
 *   euAiActEnabled: true,
 *   gdprEnabled: true,
 *   auditRetentionDays: 2555, // 7 years
 *   humanOversightConfig: {
 *     enabled: true,
 *     requiredForHighRisk: true,
 *     maxReviewTimeHours: 24
 *   },
 *   biasMonitoringConfig: {
 *     enabled: true,
 *     monitoringFrequency: 'continuous',
 *     biasThreshold: 0.1
 *   },
 *   reportingConfig: {
 *     enabled: true,
 *     scheduledReports: true,
 *     reportFrequency: 'monthly'
 *   }
 * });
 * 
 * // Register an AI system
 * const result = await compliance.registerSystem('multi-agent-coordinator', {
 *   primary: 'Multi-agent task coordination and resource allocation',
 *   secondary: ['Automated workflow management', 'Load balancing'],
 *   useCases: [
 *     'Enterprise task automation',
 *     'Resource optimization',
 *     'Agent orchestration'
 *   ],
 *   targetUsers: ['Enterprise users', 'System administrators'],
 *   context: 'Enterprise AI coordination platform'
 * });
 * 
 * // Monitor AI decisions
 * const monitorResult = await compliance.monitorDecision('multi-agent-coordinator', {
 *   id: 'decision-123',
 *   type: 'task_allocation',
 *   details: { assignedAgent: 'worker-001', priority: 'high' },
 *   confidence: 0.85,
 *   reasoning: 'Agent has best capability match and availability',
 *   inputData: { taskRequirements: ['nlp', 'data_analysis'] }
 * });
 * ```
 */

import type { ComplianceConfig } from './compliance-framework.js';

// Core compliance framework
export { ComplianceFramework } from './compliance-framework.js';
export type { ComplianceConfig, ComplianceStatus } from './compliance-framework.js';

// EU AI Act specific exports
export { EUAIActComplianceEngine } from './eu-ai-act/compliance-engine.js';
export {
  AIRiskCategory,
  HighRiskCategory,
  type AISystemPurpose,
  type RiskAssessment,
  type HumanOversight,
  type DataGovernance,
  type QualityManagementSystem,
  type RiskFactor,
  type MitigationMeasure,
  type BiasMonitoring,
  type BiasDetectionMethod
} from './eu-ai-act/types.js';

// Audit trail exports
export { AuditTrailManager, AuditEventType } from './audit/audit-trail-manager.js';
export type { AuditEvent, AuditQuery } from './audit/audit-trail-manager.js';

// Human oversight exports
export { 
  HumanOversightManager,
  OversightDecisionType,
  OversightTrigger
} from './oversight/human-oversight-manager.js';
export type {
  AIDecision,
  OversightRequest,
  HumanOversightDecision,
  OversightMetrics
} from './oversight/human-oversight-manager.js';

/**
 * Quick compliance setup helper
 */
export function createProductionComplianceConfig(): ComplianceConfig {
  return {
    euAiActEnabled: true,
    gdprEnabled: true,
    auditRetentionDays: 2555, // 7 years retention
    humanOversightConfig: {
      enabled: true,
      requiredForHighRisk: true,
      maxReviewTimeHours: 24
    },
    biasMonitoringConfig: {
      enabled: true,
      monitoringFrequency: 'continuous',
      biasThreshold: 0.1
    },
    reportingConfig: {
      enabled: true,
      scheduledReports: true,
      reportFrequency: 'monthly'
    }
  };
}

/**
 * Development/testing compliance configuration
 */
export function createDevelopmentComplianceConfig(): ComplianceConfig {
  return {
    euAiActEnabled: true,
    gdprEnabled: false,
    auditRetentionDays: 30,
    humanOversightConfig: {
      enabled: false,
      requiredForHighRisk: false,
      maxReviewTimeHours: 168 // 1 week
    },
    biasMonitoringConfig: {
      enabled: true,
      monitoringFrequency: 'daily',
      biasThreshold: 0.2
    },
    reportingConfig: {
      enabled: false,
      scheduledReports: false,
      reportFrequency: 'weekly'
    }
  };
}

/**
 * Minimal compliance configuration for testing
 */
export function createTestComplianceConfig(): ComplianceConfig {
  return {
    euAiActEnabled: true, // Enable for testing
    gdprEnabled: false,
    auditRetentionDays: 1,
    humanOversightConfig: {
      enabled: false,
      requiredForHighRisk: false,
      maxReviewTimeHours: 1
    },
    biasMonitoringConfig: {
      enabled: false,
      monitoringFrequency: 'weekly',
      biasThreshold: 1.0
    },
    reportingConfig: {
      enabled: false,
      scheduledReports: false,
      reportFrequency: 'quarterly'
    }
  };
}