/**
 * @fileoverview SAFe-SPARC Integration Bridge Types
 *
 * **CORE INTEGRATION FRAMEWORK TYPES**
 *
 * These are the foundational types for integrating SAFe Framework (business coordination)
 * with SPARC Methodology (technical implementation). These types are designed to be: * - Framework-agnostic and reusable across organizations
 * - Extensible for application-specific business logic
 * - Testable in isolation from application dependencies
 *
 * **EXTENSION PATTERN:**
 * Applications should extend these base types for custom business logic:
 * `typescript') * // In application: claude-code-zen-server/src/types/safe-sparc-integration.ts';
 * import type { IntegratedAgentProfile } from '../safe/types/integration-bridge.js';
 * interface ClaudeZenAgentProfile extends IntegratedAgentProfile {
 *   claudeSpecificCapabilities: string[];
 *   customWorkflows: CustomWorkflow[];
 *}
 * ') */';
// Event-driven integration - SPARC types communicated via events, not direct imports
// SPARCPhase and SPARCProject are now event payload types, not direct dependencies
import type { Feature} from '../types')// =========================================================================== = ''; 
// EVENT PAYLOAD TYPES (Previously imported from SPARC)
// ============================================================================
/**
 * SPARC phase enumeration - defined locally for event payloads
 */
export enum SPARCPhase {
  SPECIFICATION = 'specification')  PSEUDOCODE = 'pseudocode')  ARCHITECTURE = 'architecture')  REFINEMENT = 'refinement')  COMPLETION ='completion')};;
/**
 * SPARC project structure - defined locally for event payloads
 */
export interface SPARCProject {
  id: string;
  name: string;
  description: string;
  currentPhase: SPARCPhase;
  progress: number;
  metadata: Record<string, unknown>;
}
// Define AgentType locally as it's not exported from teamwork package';
export type AgentType ='researcher' | ' coder'|' analyst' | ' coordinator'|' specialist')// =========================================================================== = ';
// INTEGRATION BRIDGE TYPES
// ============================================================================
/**
 * Maps SAFe Feature to SPARC Project execution
 */
export interface FeatureToSPARCMapping {
  readonly safeFeature: Feature;
  readonly sparcProjects: SPARCProject[];
  readonly mappingRationale: string;
  readonly businessContext: BusinessToTechnicalContext;
  readonly progressCorrelation: ProgressCorrelation;
}
/**
 * Business context translated to technical requirements
 */
export interface BusinessToTechnicalContext {
  readonly businessValue: number'; 
  readonly technicalComplexity : 'simple' | ' moderate'|' complex' | ' enterprise')  readonly stakeholderPriority : 'low' | ' medium'|' high' | ' critical')  readonly architecturalImpact: ArchitecturalImpact;;
  readonly complianceRequirements: string[];
}
/**
 * Architectural impact assessment
 */
export interface ArchitecturalImpact {
  readonly level : 'component' | ' service'|' system' | ' enterprise')  readonly affectedSystems: string[];;
  readonly integrationComplexity: number; // 1-10 scale
  readonly riskLevel : 'low' | ' medium'|' high' | ' critical')};;
/**
 * Correlates SAFe progress with SPARC execution
 */
export interface ProgressCorrelation {
  readonly safeStatus: Feature['status];;
  readonly sparcPhases: SPARCPhaseMapping[];
  readonly overallProgress: number; // 0-1
  readonly blockers: IntegrationBlocker[];];;
  readonly predictedCompletion: Date;)};;
/**
 * Maps SAFe milestones to SPARC phases
 */
export interface SPARCPhaseMapping {
  readonly phase: SPARCPhase;
  readonly safeMilestone: string;
  readonly completionPercentage: number;
  readonly qualityGates: QualityGate[];
}
/**
 * Quality gates that bridge SAFe acceptance criteria with SPARC deliverables
 */
export interface QualityGate {
  readonly id: string;
  readonly name: string;
  readonly safeAcceptanceCriteria: string[];
  readonly sparcValidation: SPARCValidation;
  readonly approvalRequired: boolean;
  readonly automatedCheck: boolean;
}
/**
 * SPARC-specific validation requirements
 */
export interface SPARCValidation {
  readonly phase: SPARCPhase;
  readonly validationType : 'specification' | ' architecture'|' implementation' | ' testing')  readonly criteria: ValidationCriteria[];;
  readonly tooling: string[];
}
/**
 * Validation criteria for quality gates
 */
export interface ValidationCriteria {
  readonly criterion: string;
  readonly threshold: number;
  readonly measurement: string;
  readonly automated: boolean;
}
/**
 * Integration blockers and resolution strategies
 */
export interface IntegrationBlocker {
  readonly id: string;
  readonly type : 'dependency' | ' resource'|' technical' | ' business')  readonly description: string;;
  readonly impact : 'low' | ' medium'|' high' | ' critical')  readonly affectedFeatures: string[];;
  readonly affectedSPARCProjects: string[];
  readonly resolutionStrategy: string;
  readonly owner: string;
  readonly targetResolutionDate: Date;
}
// ============================================================================
// AGENT COORDINATION TYPES
// ============================================================================
/**
 * Agent roles that understand both SAFe and SPARC contexts
 */
export interface IntegratedAgentProfile {
  readonly agentId: string;
  readonly safeRole: SAFeAgentRole;
  readonly sparcRole: SPARCAgentRole;
  readonly capabilities: AgentCapability[];
  readonly certifications: FrameworkCertification[];
  readonly experienceLevel: ExperienceLevel;
}
/**
 * SAFe-specific agent roles
 */
export type SAFeAgentRole ='product-owner' | ' scrum-master'|' system-architect' | ' business-analyst'|' compliance-officer')/**';
 * SPARC-specific agent roles
 */
export type SPARCAgentRole ='specification-writer' | ' architect'|' implementer' | ' quality-validator'|' technical-writer')/**';
 * Agent capabilities that span both frameworks
 */
export interface AgentCapability {
  readonly capability: ;
|'novice '   // Basic understanding of both frameworks';
|'competent '// Can work independently in either framework';
|'proficient'// Can coordinate between frameworks';
|'expert '   // Can optimize integration patterns';
|'master';   // Can design new integration approaches';
// ============================================================================
// WORKFLOW COORDINATION TYPES
// ============================================================================
/**
 * Coordinated workflows that span both frameworks
 */
export interface IntegratedWorkflow {
  readonly workflowId: string;
  readonly name: string;
  readonly safePhases: SAFeWorkflowPhase[];
  readonly sparcPhases: SPARCWorkflowPhase[];
  readonly synchronizationPoints: SynchronizationPoint[];
  readonly escalationPaths: EscalationPath[];
}
/**
 * SAFe workflow phases
 */
export interface SAFeWorkflowPhase {
  readonly phase : 'portfolio-kanban' | ' program-backlog'|' pi-planning' | ' development'|' system-demo')  readonly duration: number; // milliseconds';
  readonly participants: SAFeAgentRole[];
  readonly deliverables: string[];
  readonly dependencies: string[];
}
/**
 * SPARC workflow phases with SAFe coordination
 */
export interface SPARCWorkflowPhase {
  readonly phase: SPARCPhase;
  readonly safeAlignment: string; // Which SAFe phase this aligns with
  readonly duration: number; // milliseconds
  readonly participants: SPARCAgentRole[];
  readonly deliverables: string[];
  readonly qualityGates: string[];
}
/**
 * Synchronization points between frameworks
 */
export interface SynchronizationPoint {
  readonly id: string;
  readonly name: string;
  readonly safeContext: string;
  readonly sparcContext: string;
  readonly syncType : 'milestone' | ' review'|' approval' | ' handoff')  readonly requiredArtifacts: string[];;
  readonly successCriteria: string[];
  readonly timeout: number; // milliseconds
}
/**
 * Escalation paths for integration issues
 */
export interface EscalationPath {
  readonly trigger: EscalationTrigger;
  readonly escalationLevel: number;
  readonly responsible: SAFeAgentRole| SPARCAgentRole;
  readonly timeoutMinutes: number;
  readonly resolution: ResolutionStrategy;
}
/**
 * Triggers for escalation
 */
export interface EscalationTrigger {
  readonly type : 'delay' | ' quality'|' dependency' | ' resource'|' compliance')  readonly threshold: unknown;;
  readonly description: string;
}
/**
 * Resolution strategies for escalated issues
 */
export interface ResolutionStrategy {
  readonly strategy : 'escalate' | ' fallback'|' retry' | ' skip'|' manual-intervention')  readonly description: string;;
  readonly impact: string;
  readonly alternatives: string[];
}
// ============================================================================
// METRICS AND TRACKING TYPES
// ============================================================================
/**
 * Integrated metrics that track both SAFe and SPARC progress
 */
export interface IntegratedMetrics {
  readonly safeMetrics: SAFeMetrics;
  readonly sparcMetrics: SPARCMetrics;
  readonly correlationMetrics: CorrelationMetrics;
  readonly predictiveMetrics: PredictiveMetrics;
  readonly timestamp: Date;
}
/**
 * SAFe-specific metrics
 */
export interface SAFeMetrics {
  readonly piVelocity: number;
  readonly featureDeliveryRate: number;
  readonly businessValueRealized: number;
  readonly stakeholderSatisfaction: number;
  readonly complianceScore: number;
}
/**
 * SPARC-specific metrics
 */
export interface SPARCMetrics {
  readonly phaseCompletionRate: Record<SPARCPhase, number>;
  readonly qualityGatePassRate: number;
  readonly technicalDebtScore: number;
  readonly implementationEfficiency: number;
  readonly codeQualityScore: number;
}
/**
 * Correlation metrics between frameworks
 */
export interface CorrelationMetrics {
  readonly businessToTechnicalAlignment: number; // 0-1
  readonly timelineCorrelation: number; // 0-1
  readonly qualityCorrelation: number; // 0-1
  readonly resourceUtilizationEfficiency: number; // 0-1
  readonly integrationEffectiveness: number; // 0-1
}
/**
 * Predictive metrics for planning
 */
export interface PredictiveMetrics {
  readonly predictedDeliveryDate: Date;
  readonly riskOfDelayProbability: number; // 0-1
  readonly qualityRiskScore: number; // 0-10
  readonly resourceConstraintRisk: number; // 0-1
  readonly businessValuePrediction: number;
}
// ============================================================================
// CONFIGURATION TYPES
// ============================================================================
/**
 * Configuration for SAFe-SPARC integration
 */
export interface IntegrationConfiguration {
  readonly enabledFeatures: IntegrationFeature[];
  readonly synchronizationSettings: SynchronizationSettings;
  readonly escalationSettings: EscalationSettings;
  readonly metricsSettings: MetricsSettings;
  readonly qualityGateSettings: QualityGateSettings;
}
/**
 * Available integration features
 */
export type IntegrationFeature ='auto-sync' | ' bi-directional-mapping'|' cross-framework-reporting' | ' intelligent-escalation')/**';
 * Synchronization settings
 */
export interface SynchronizationSettings {
  readonly syncInterval: number; // milliseconds
  readonly conflictResolution : 'safe-wins' | ' sparc-wins'|' manual' | ' merge')  readonly timeoutTolerance: number; // milliseconds';
  readonly retryPolicy: RetryPolicy;
}
/**
 * Retry policy for failed synchronizations
 */
export interface RetryPolicy {
  readonly maxRetries: number;
  readonly backoffStrategy : 'linear' | ' exponential')  readonly baseDelay: number; // milliseconds';
}
/**
 * Escalation settings
 */
export interface EscalationSettings {
  readonly enableAutoEscalation: boolean;
  readonly escalationThresholds: EscalationThreshold[];
  readonly notificationChannels: string[];
  readonly maxEscalationLevels: number;
}
/**
 * Escalation thresholds
 */
export interface EscalationThreshold {
  readonly metric: string;
  readonly threshold: number;
  readonly timeWindow: number; // milliseconds
  readonly severity: low' | ' medium'|' high' | ' critical')};;
/**
 * Metrics collection settings
 */
export interface MetricsSettings {
  readonly collectionInterval: number; // milliseconds
  readonly retentionPeriod: number; // days
  readonly enablePredictiveAnalytics: boolean;
  readonly enableRealTimeAlerts: boolean;
  readonly dashboardRefreshRate: number; // milliseconds
}
/**
 * Quality gate settings
 */
export interface QualityGateSettings {
  readonly enableAutomatedGates: boolean;
  readonly requireManualApproval: boolean;
  readonly parallelValidation: boolean;
  readonly validationTimeout: number; // milliseconds
  readonly failureHandling : 'block' | ' warn'|' log')};;
