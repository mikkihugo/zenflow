import type { Feature } from '../types';
/**
 * SPARC phase enumeration - defined locally for event payloads
 */
export declare enum SPARCPhase {
 SPECIFICATION = "specification",
 PSEUDOCODE = "pseudocode",
 ARCHITECTURE = "architecture",
 REFINEMENT = "refinement",
 COMPLETION = "completion"

}
/**
 * SPARC project structure - defined locally for event payloads
 */
export interface SPARCProject {
 id: string;
 name: string;
 description?: string;
 phase: SPARCPhase;
 requirements: string[];
 deliverables: string[];
 stakeholders: string[];
 estimatedCompletion: Date;
 actualCompletion?: Date;
 status: 'planned' | 'in_progress' | 'completed' | 'blocked';
 qualityGates: QualityGate[];
}
/**
 * Agent types for integrated workflows
 */
export type AgentType = 'researcher' | 'coder' | 'analyst' | 'coordinator' | 'specialist';
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
 readonly businessValue: number;
 readonly technicalComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
 readonly stakeholderPriority: 'low' | 'medium' | 'high' | 'critical';
 readonly architecturalImpact: ArchitecturalImpact;
 readonly complianceRequirements: string[];
 readonly regulatoryConstraints: string[];
}
/**
 * Architectural impact assessment
 */
export interface ArchitecturalImpact {
 readonly level: 'component' | 'service' | 'system' | 'enterprise';
 readonly affectedSystems: string[];
 readonly integrationComplexity: number;
 readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
 readonly scalabilityRequirements: string[];
 readonly securityImplications: string[];
}
/**
 * Correlates SAFe progress with SPARC execution
 */
export interface ProgressCorrelation {
 readonly safeStatus: Feature['status'];
 readonly sparcPhases: SPARCPhaseMapping[];
 readonly overallProgress: number;
 readonly blockers: IntegrationBlocker[];
 readonly predictedCompletion: Date;
 readonly velocity: number;
 readonly qualityMetrics: Record<string, number>;
}
/**
 * Maps SAFe milestones to SPARC phases
 */
export interface SPARCPhaseMapping {
 readonly phase: SPARCPhase;
 readonly safeMilestone: string;
 readonly completionPercentage: number;
 readonly qualityGates: QualityGate[];
 readonly deliverables: string[];
 readonly acceptanceCriteria: string[];
}
/**
 * Quality gates that bridge SAFe acceptance criteria with SPARC deliverables
 */
export interface QualityGate {
 id: string;
 name: string;
 description: string;
 phase: SPARCPhase;
 criteria: ValidationCriteria[];
 status: 'pending' | 'in_progress' | 'passed' | 'failed';
 owner: string;
 dueDate: Date;
 completionDate?: Date;
 evidence: string[];
 automated: boolean;
}
/**
 * SPARC-specific validation requirements
 */
export interface SPARCValidation {
 readonly phase: SPARCPhase;
 readonly validationType: 'specification' | 'architecture' | 'implementation' | 'testing';
 readonly criteria: ValidationCriteria[];
 readonly tooling: string[];
 readonly automationLevel: 'manual' | 'semi_automated' | 'fully_automated';
 readonly frequency: string;
}
/**
 * Validation criteria for quality gates
 */
export interface ValidationCriteria {
 readonly criterion: string;
 readonly threshold: number;
 readonly measurement: string;
 readonly automated: boolean;
 readonly testCases?: string[];
 readonly successDefinition: string;
}
/**
 * Integration blockers and resolution strategies
 */
export interface IntegrationBlocker {
 id: string;
 title: string;
 description: string;
 severity: 'low' | 'medium' | 'high' | 'critical';
 category: 'technical' | 'process' | 'communication' | 'resource';
 impact: string;
 affectedSystems: string[];
 owner: string;
 status: 'identified' | 'investigating' | 'resolved' | 'accepted_risk';
 createdAt: Date;
 resolvedAt?: Date;
 resolution: string;
}
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
 readonly specialization: string[];
}
/**
 * SAFe-specific agent roles
 */
export type SAFeAgentRole = 'product-owner' | 'scrum-master' | 'system-architect' | 'business-analyst' | 'compliance-officer';
export type SPARCAgentRole = 'specification-writer' | 'architect' | 'implementer' | 'quality-validator' | 'technical-writer';
/**
 * Agent capability definition
 */
export interface AgentCapability {
 readonly capability: string;
 readonly proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
 readonly certificationLevel?: string;
 readonly lastAssessed: Date;
 readonly trainingRequired: boolean;
}
/**
 * Framework certifications
 */
export interface FrameworkCertification {
 readonly framework: 'SAFe' | 'SPARC' | 'Scrum' | 'Kanban';
 readonly level: string;
 readonly issuedDate: Date;
 readonly expiryDate?: Date;
 readonly issuingAuthority: string;
}
/**
 * Experience level classification
 */
export interface ExperienceLevel {
 readonly years: number;
 readonly projects: number;
 readonly complexity: 'low' | 'medium' | 'high' | 'enterprise';
 readonly domainExpertise: string[];
}
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
 readonly successMetrics: string[];
}
/**
 * SAFe workflow phases
 */
export interface SAFeWorkflowPhase {
 readonly phase: 'portfolio-kanban' | 'program-backlog' | 'pi-planning' | 'development' | 'system-demo';
 readonly duration: number;
 readonly participants: SAFeAgentRole[];
 readonly deliverables: string[];
 readonly dependencies: string[];
 readonly qualityGates: string[];
}
/**
 * SPARC workflow phases with SAFe coordination
 */
export interface SPARCWorkflowPhase {
 readonly phase: SPARCPhase;
 readonly safeAlignment: string;
 readonly duration: number;
 readonly participants: SPARCAgentRole[];
 readonly deliverables: string[];
 readonly qualityGates: string[];
 readonly technicalStandards: string[];
}
/**
 * Synchronization points between frameworks
 */
export interface SynchronizationPoint {
 id: string;
 name: string;
 description: string;
 safeMilestone: string;
 sparcPhase: SPARCPhase;
 trigger: 'manual' | 'automatic' | 'scheduled';
 frequency: string;
 participants: string[];
 deliverables: string[];
 status: 'pending' | 'active' | 'completed';
}
/**
 * Escalation paths for integration issues
 */
export interface EscalationPath {
 readonly trigger: EscalationTrigger;
 readonly escalationLevel: number;
 readonly responsible: SAFeAgentRole | SPARCAgentRole;
 readonly timeoutMinutes: number;
 readonly resolution: ResolutionStrategy;
 readonly backupResponsible: string;
}
/**
 * Triggers for escalation
 */
export interface EscalationTrigger {
 readonly type: 'delay' | 'quality' | 'dependency' | 'resource' | 'compliance';
 readonly threshold: unknown;
 readonly description: string;
 readonly measurement: string;
}
/**
 * Resolution strategies for escalated issues
 */
export interface ResolutionStrategy {
 readonly strategy: 'escalate' | 'fallback' | 'retry' | 'skip' | 'manual-intervention';
 readonly description: string;
 readonly impact: string;
 readonly alternatives: string[];
 readonly successRate: number;
}
/**
 * Integrated metrics that track both SAFe and SPARC progress
 */
export interface IntegratedMetrics {
 readonly safeMetrics: SAFeMetrics;
 readonly sparcMetrics: SPARCMetrics;
 readonly correlationMetrics: CorrelationMetrics;
 readonly predictiveMetrics: PredictiveMetrics;
 readonly timestamp: Date;
 readonly reportingPeriod: string;
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
 readonly teamProductivity: number;
 readonly qualityIndex: number;
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
 readonly defectDensity: number;
 readonly reworkPercentage: number;
}
/**
 * Correlation metrics between frameworks
 */
export interface CorrelationMetrics {
 readonly businessToTechnicalAlignment: number;
 readonly timelineCorrelation: number;
 readonly qualityCorrelation: number;
 readonly resourceUtilizationEfficiency: number;
 readonly integrationEffectiveness: number;
 readonly communicationEfficiency: number;
 readonly riskMitigationEffectiveness: number;
}
/**
 * Predictive metrics for planning
 */
export interface PredictiveMetrics {
 readonly predictedDeliveryDate: Date;
 readonly riskOfDelayProbability: number;
 readonly qualityRiskScore: number;
 readonly resourceConstraintRisk: number;
 readonly businessValuePrediction: number;
 readonly confidenceInterval: number;
 readonly monteCarloSimulation: boolean;
}
/**
 * Configuration for SAFe-SPARC integration
 */
export interface IntegrationConfiguration {
 readonly enabledFeatures: IntegrationFeature[];
 readonly synchronizationSettings: SynchronizationSettings;
 readonly escalationSettings: EscalationSettings;
 readonly metricsSettings: MetricsSettings;
 readonly qualityGateSettings: QualityGateSettings;
 readonly securitySettings: SecuritySettings;
}
/**
 * Available integration features
 */
export type IntegrationFeature = 'auto-sync' | 'bi-directional-mapping' | 'cross-framework-reporting' | 'intelligent-escalation';
/**
 * Synchronization settings
 */
export interface SynchronizationSettings {
 readonly syncInterval: number;
 readonly conflictResolution: 'safe-wins' | 'sparc-wins' | 'manual' | 'merge';
 readonly timeoutTolerance: number;
 readonly retryPolicy: RetryPolicy;
 readonly batchSize: number;
}
/**
 * Retry policy for failed synchronizations
 */
export interface RetryPolicy {
 readonly maxRetries: number;
 readonly backoffStrategy: 'linear' | 'exponential';
 readonly baseDelay: number;
 readonly maxDelay: number;
 readonly jitter: boolean;
}
/**
 * Escalation settings
 */
export interface EscalationSettings {
 readonly enableAutoEscalation: boolean;
 readonly escalationThresholds: EscalationThreshold[];
 readonly notificationChannels: string[];
 readonly maxEscalationLevels: number;
 readonly escalationTimeout: number;
}
/**
 * Escalation thresholds
 */
export interface EscalationThreshold {
 readonly metric: string;
 readonly threshold: number;
 readonly timeWindow: number;
 readonly severity: 'low' | 'medium' | 'high' | 'critical';
 readonly autoEscalate: boolean;
}
/**
 * Metrics collection settings
 */
export interface MetricsSettings {
 readonly collectionInterval: number;
 readonly retentionPeriod: number;
 readonly enablePredictiveAnalytics: boolean;
 readonly enableRealTimeAlerts: boolean;
 readonly dashboardRefreshRate: number;
 readonly exportFormats: string[];
}
/**
 * Quality gate settings
 */
export interface QualityGateSettings {
 readonly enableAutomatedGates: boolean;
 readonly requireManualApproval: boolean;
 readonly parallelValidation: boolean;
 readonly validationTimeout: number;
 readonly failureHandling: 'block' | 'warn' | 'log';
 readonly approvalWorkflow: string;
}
/**
 * Security settings for integration
 */
export interface SecuritySettings {
 readonly enableAuditLogging: boolean;
 readonly encryptionLevel: 'basic' | 'advanced' | 'military';
 readonly accessControl: 'role-based' | 'attribute-based';
 readonly dataRetention: number;
 readonly complianceMonitoring: boolean;
}
//# sourceMappingURL=integration-bridge.d.ts.map