/**
 * @fileoverview Claude Code Zen SAFe-SPARC Integration Extensions
 *
 * **APPLICATION-SPECIFIC INTEGRATION TYPES**
 *
 * This file extends the base SAFe-SPARC integration types from @claude-zen/enterprise
 * with Claude Code Zen specific business logic, workflows, and agent behaviors.
 *
 * **ARCHITECTURE PATTERN:**
 * - Base types: @claude-zen/enterprise (reusable across organizations)
 * - Extensions: This file (Claude Code Zen specific business logic)
 * - Implementation: Various coordination services use these extended types
 */

import type {
  IntegratedAgentProfile,
  IntegratedWorkflow,
  IntegrationConfiguration,
  QualityGate,
  IntegratedMetrics,
} from '@claude-zen/enterprise');
import type { AgentType, ConversationPattern } from '@claude-zen/intelligence');

// ============================================================================
// CLAUDE-ZEN SPECIFIC AGENT EXTENSIONS
// ============================================================================

/**
 * Claude Code Zen specific agent profile with AI-enhanced capabilities
 */
export interface ClaudeZenAgentProfile extends IntegratedAgentProfile {
  readonly claudeCapabilities: ClaudeAgentCapability[];
  readonly neuralCoordination: NeuralCoordinationProfile;
  readonly swarmIntegration: SwarmIntegrationProfile;
  readonly conversationPatterns: ConversationPattern[];
  readonly learningHistory: LearningHistoryEntry[];
}

/**
 * Claude-specific agent capabilities beyond standard SAFe+SPARC
 */
export interface ClaudeAgentCapability {
  readonly capability: ClaudeSpecificCapability;
  readonly proficiencyLevel: number; // 1-10
  readonly neuralEnhancement: boolean;
  readonly swarmCoordination: boolean;
  readonly realTimeLearning: boolean;
}

/**
 * Claude Code Zen specific capabilities
 */
export type ClaudeSpecificCapability =
  | 'ai-enhanced-specification-writing'
  | 'neural-architecture-design'
  | 'swarm-based-code-generation'
  | 'intelligent-quality-validation'
  | 'predictive-risk-assessment'
  | 'autonomous-refactoring'
  | 'cross-domain-knowledge-transfer'
  | 'real-time-performance-optimization');

/**
 * Neural coordination profile for AI agents
 */
export interface NeuralCoordinationProfile {
  readonly modelType: string;
  readonly coordinationEfficiency: number; // 0-1
  readonly learningRate: number;
  readonly adaptationThreshold: number;
  readonly consensusParticipation: boolean;
}

/**
 * Swarm integration profile
 */
export interface SwarmIntegrationProfile {
  readonly swarmId: string;
  readonly preferredTopology: 'mesh | hierarchical' | 'ring | star');
  readonly communicationProtocol: string;
  readonly loadBalancingStrategy: string;
  readonly faultToleranceLevel: 'basic | enhanced' | 'enterprise');
}

/**
 * Learning history for continuous improvement
 */
export interface LearningHistoryEntry {
  readonly timestamp: Date;
  readonly context: 'safe-ceremony | sparc-phase' | 'integration-handoff');
  readonly outcome: 'success | partial-success' | 'failure');
  readonly lessonsLearned: string[];
  readonly performanceImpact: number; // -1 to 1
}

// ============================================================================
// CLAUDE-ZEN WORKFLOW EXTENSIONS
// ============================================================================

/**
 * Enhanced workflow with Claude Code Zen AI orchestration
 */
export interface ClaudeZenIntegratedWorkflow extends IntegratedWorkflow {
  readonly aiOrchestration: AIOrchestrationConfig;
  readonly neuralDecisionPoints: NeuralDecisionPoint[];
  readonly swarmCoordinationPoints: SwarmCoordinationPoint[];
  readonly adaptiveLearning: AdaptiveLearningConfig;
}

/**
 * AI orchestration configuration
 */
export interface AIOrchestrationConfig {
  readonly enableAutonomousDecisions: boolean;
  readonly humanInTheLoop: HumanInTheLoopConfig;
  readonly confidenceThreshold: number; // 0-1
  readonly escalationThreshold: number; // 0-1
  readonly learningEnabled: boolean;
}

/**
 * Human-in-the-loop configuration
 */
export interface HumanInTheLoopConfig {
  readonly requiredApprovals: ApprovalRequirement[];
  readonly notificationChannels: string[];
  readonly timeoutMinutes: number;
  readonly fallbackStrategy: 'block | proceed' | 'escalate');
}

/**
 * Approval requirements for human oversight
 */
export interface ApprovalRequirement {
  readonly trigger:
    | 'high-risk-decision'
    | 'budget-threshold'
    | 'compliance-critical'
    | 'novel-approach');
  readonly approverRole: string;
  readonly requiredApprovers: number;
  readonly timeout: number; // minutes
}

/**
 * Neural decision points in workflows
 */
export interface NeuralDecisionPoint {
  readonly decisionId: string;
  readonly context:
    | 'feature-complexity-assessment'
    | 'architecture-pattern-selection'
    | 'risk-mitigation-strategy');
  readonly neuralModel: string;
  readonly inputFeatures: string[];
  readonly outputActions: string[];
  readonly confidenceRequired: number; // 0-1
}

/**
 * Swarm coordination points
 */
export interface SwarmCoordinationPoint {
  readonly coordinationId: string;
  readonly triggerEvent: string;
  readonly participantTypes: AgentType[];
  readonly coordinationPattern:
    | 'consensus'
    | 'leader-follower'
    | 'democratic'
    | 'expertise-weighted');
  readonly timeoutSeconds: number;
}

/**
 * Adaptive learning configuration
 */
export interface AdaptiveLearningConfig {
  readonly enabledLearning: LearningType[];
  readonly learningRate: number;
  readonly memoryRetention: number; // days
  readonly crossProjectLearning: boolean;
  readonly federatedLearning: boolean;
}

/**
 * Types of learning enabled
 */
export type LearningType =
  | 'workflow-optimization'
  | 'quality-prediction'
  | 'risk-assessment'
  | 'resource-allocation'
  | 'timeline-prediction'
  | 'stakeholder-satisfaction');

// ============================================================================
// CLAUDE-ZEN QUALITY GATES EXTENSIONS
// ============================================================================

/**
 * AI-enhanced quality gate with neural validation
 */
export interface ClaudeZenQualityGate extends QualityGate {
  readonly aiValidation: AIValidationConfig;
  readonly swarmReview: SwarmReviewConfig;
  readonly continuousMonitoring: ContinuousMonitoringConfig;
  readonly adaptiveThresholds: AdaptiveThresholdConfig;
}

/**
 * AI validation configuration
 */
export interface AIValidationConfig {
  readonly enabledValidators: AIValidator[];
  readonly confidenceThreshold: number; // 0-1
  readonly parallelValidation: boolean;
  readonly consensusRequired: boolean;
}

/**
 * AI validators for quality gates
 */
export interface AIValidator {
  readonly validatorType:
    | 'code-quality'
    | 'architecture-compliance'
    | 'security-scan'
    | 'performance-check');
  readonly model: string;
  readonly weight: number; // 0-1
  readonly timeout: number; // seconds
}

/**
 * Swarm review configuration
 */
export interface SwarmReviewConfig {
  readonly enablePeerReview: boolean;
  readonly requiredReviewers: number;
  readonly expertiseMatching: boolean;
  readonly diversityBonus: number; // 0-1
  readonly reviewTimeout: number; // minutes
}

/**
 * Continuous monitoring configuration
 */
export interface ContinuousMonitoringConfig {
  readonly enableRealTimeMonitoring: boolean;
  readonly monitoringMetrics: string[];
  readonly alertThresholds: Record<string, number>;
  readonly autoCorrection: boolean;
}

/**
 * Adaptive threshold configuration
 */
export interface AdaptiveThresholdConfig {
  readonly enableAdaptiveThresholds: boolean;
  readonly learningWindow: number; // days
  readonly adjustmentRate: number; // 0-1
  readonly minThreshold: number;
  readonly maxThreshold: number;
}

// ============================================================================
// CLAUDE-ZEN INTEGRATION CONFIGURATION
// ============================================================================

/**
 * Claude Code Zen specific integration configuration
 */
export interface ClaudeZenIntegrationConfig extends IntegrationConfiguration {
  readonly neuralCoordination: NeuralCoordinationConfig;
  readonly swarmIntelligence: SwarmIntelligenceConfig;
  readonly knowledgeManagement: KnowledgeManagementConfig;
  readonly performanceOptimization: PerformanceOptimizationConfig;
}

/**
 * Neural coordination configuration
 */
export interface NeuralCoordinationConfig {
  readonly enableNeuralCoordination: boolean;
  readonly maxNeuralAgents: number;
  readonly consensusThreshold: number; // 0-1
  readonly learningEnabled: boolean;
  readonly crossDomainTransfer: boolean;
}

/**
 * Swarm intelligence configuration
 */
export interface SwarmIntelligenceConfig {
  readonly enableSwarmIntelligence: boolean;
  readonly maxSwarmSize: number;
  readonly emergentBehaviors: boolean;
  readonly collectiveLearning: boolean;
  readonly distributedDecisionMaking: boolean;
}

/**
 * Knowledge management integration
 */
export interface KnowledgeManagementConfig {
  readonly enableCrossAgentKnowledge: boolean;
  readonly knowledgeRetention: number; // days
  readonly semanticSearch: boolean;
  readonly expertiseDiscovery: boolean;
  readonly knowledgeValidation: boolean;
}

/**
 * Performance optimization configuration
 */
export interface PerformanceOptimizationConfig {
  readonly enablePerformanceOptimization: boolean;
  readonly cacheStrategy: 'lru | lfu' | 'adaptive');
  readonly prefetching: boolean;
  readonly loadBalancing: boolean;
  readonly resourceMonitoring: boolean;
}

// ============================================================================
// CLAUDE-ZEN METRICS EXTENSIONS
// ============================================================================

/**
 * Enhanced metrics with AI and swarm intelligence insights
 */
export interface ClaudeZenIntegratedMetrics extends IntegratedMetrics {
  readonly neuralPerformanceMetrics: NeuralPerformanceMetrics;
  readonly swarmIntelligenceMetrics: SwarmIntelligenceMetrics;
  readonly learningProgressMetrics: LearningProgressMetrics;
  readonly autonomyMetrics: AutonomyMetrics;
}

/**
 * Neural performance metrics
 */
export interface NeuralPerformanceMetrics {
  readonly modelAccuracy: number; // 0-1
  readonly predictionConfidence: number; // 0-1
  readonly learningRate: number;
  readonly adaptationSpeed: number;
  readonly consensusEfficiency: number; // 0-1
}

/**
 * Swarm intelligence metrics
 */
export interface SwarmIntelligenceMetrics {
  readonly swarmCoherence: number; // 0-1
  readonly emergentBehaviorStrength: number; // 0-1
  readonly collectiveIntelligence: number; // 0-1
  readonly distributedDecisionEfficiency: number; // 0-1
  readonly swarmLearningRate: number;
}

/**
 * Learning progress metrics
 */
export interface LearningProgressMetrics {
  readonly knowledgeAccumulation: number;
  readonly crossDomainTransfer: number; // 0-1
  readonly expertiseEvolution: number; // 0-1
  readonly learningEfficiency: number; // 0-1
  readonly memoryUtilization: number; // 0-1
}

/**
 * Autonomy metrics
 */
export interface AutonomyMetrics {
  readonly autonomousDecisionRate: number; // 0-1
  readonly humanInterventionRate: number; // 0-1
  readonly errorCorrectionRate: number; // 0-1
  readonly selfOptimizationEfficiency: number; // 0-1
  readonly trustworthinessScore: number; // 0-1
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create Claude Code Zen specific integration configuration
 */
export function createClaudeZenIntegrationConfig(): ClaudeZenIntegrationConfig {
  return {
    // Base configuration
    enabledFeatures: [
      'auto-sparc-project-creation',
      'real-time-progress-sync',
      'automated-quality-gates',
      'predictive-analytics',
      'cross-framework-reporting',
      'intelligent-escalation',
    ],
    synchronizationSettings: {
      syncInterval: 30000, // 30 seconds
      conflictResolution: 'weighted',
      timeoutTolerance: 60000, // 1 minute
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential',
        baseDelay: 1000,
      },
    },
    escalationSettings: {
      enableAutoEscalation: true,
      escalationThresholds: [
        {
          metric: 'quality-gate-failure-rate',
          threshold: .3,
          timeWindow: 3600000, // 1 hour
          severity: 'high',
        },
      ],
      notificationChannels: ['email, slack', 'dashboard'],
      maxEscalationLevels: 3,
    },
    metricsSettings: {
      collectionInterval: 15000, // 15 seconds
      retentionPeriod: 90, // days
      enablePredictiveAnalytics: true,
      enableRealTimeAlerts: true,
      dashboardRefreshRate: 5000, // 5 seconds
    },
    qualityGateSettings: {
      enableAutomatedGates: true,
      requireManualApproval: false,
      parallelValidation: true,
      validationTimeout: 300000, // 5 minutes
      failureHandling: 'warn',
    },

    // Claude-specific extensions
    neuralCoordination: {
      enableNeuralCoordination: true,
      maxNeuralAgents: 20,
      consensusThreshold: .8,
      learningEnabled: true,
      crossDomainTransfer: true,
    },
    swarmIntelligence: {
      enableSwarmIntelligence: true,
      maxSwarmSize: 50,
      emergentBehaviors: true,
      collectiveLearning: true,
      distributedDecisionMaking: true,
    },
    knowledgeManagement: {
      enableCrossAgentKnowledge: true,
      knowledgeRetention: 365, // 1 year
      semanticSearch: true,
      expertiseDiscovery: true,
      knowledgeValidation: true,
    },
    performanceOptimization: {
      enablePerformanceOptimization: true,
      cacheStrategy: 'adaptive',
      prefetching: true,
      loadBalancing: true,
      resourceMonitoring: true,
    },
  };
}
