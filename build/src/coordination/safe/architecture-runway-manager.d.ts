/**
 * @file Architecture Runway Manager - Phase 3, Day 14 (Task 13.1)
 *
 * Implements SAFe Architecture Runway management including architecture backlog and planning,
 * architectural epic and capability tracking, architecture decision workflow with AGUI,
 * and technical debt management. Integrates with the existing multi-level orchestration.
 *
 * ARCHITECTURE:
 * - Architecture runway and backlog management
 * - Architectural epic and capability tracking
 * - Architecture decision workflow with AGUI gates
 * - Technical debt management and tracking
 * - Integration with Program Increment and Value Stream management
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates.ts';
import type { ProgramIncrementManager } from './program-increment-manager.ts';
import type { ValueStreamMapper } from './value-stream-mapper.ts';
/**
 * Architecture Runway Manager configuration
 */
export interface ArchitectureRunwayConfig {
    readonly enableAGUIIntegration: boolean;
    readonly enableAutomatedTracking: boolean;
    readonly enableTechnicalDebtManagement: boolean;
    readonly enableArchitectureGovernance: boolean;
    readonly enableRunwayPlanning: boolean;
    readonly runwayPlanningHorizon: number;
    readonly technicalDebtThreshold: number;
    readonly architectureReviewInterval: number;
    readonly runwayTrackingInterval: number;
    readonly maxArchitecturalEpics: number;
    readonly maxRunwayItems: number;
    readonly governanceApprovalTimeout: number;
}
/**
 * Architecture Runway item types
 */
export declare enum RunwayItemType {
    FOUNDATION = "foundation",
    INFRASTRUCTURE = "infrastructure",
    PLATFORM = "platform",
    SECURITY = "security",
    COMPLIANCE = "compliance",
    PERFORMANCE = "performance",
    INTEGRATION = "integration",
    TOOLING = "tooling"
}
/**
 * Architecture decision status
 */
export declare enum ArchitectureDecisionStatus {
    PROPOSED = "proposed",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUPERSEDED = "superseded",
    IMPLEMENTED = "implemented"
}
/**
 * Technical debt severity
 */
export declare enum TechnicalDebtSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Architecture Runway item
 */
export interface ArchitectureRunwayItem {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: RunwayItemType;
    readonly category: string;
    readonly priority: number;
    readonly businessValue: number;
    readonly effort: number;
    readonly complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
    readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
    readonly status: RunwayItemStatus;
    readonly assignedTeams: string[];
    readonly requiredSkills: string[];
    readonly dependencies: string[];
    readonly blockers: string[];
    readonly targetPI: string;
    readonly createdBy: string;
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly completedAt?: Date;
    readonly architecture: ArchitecturalContext;
    readonly technicalSpecs: TechnicalSpecification;
    readonly acceptanceCriteria: AcceptanceCriterion[];
    readonly risks: ArchitecturalRisk[];
    readonly decisions: ArchitecturalDecision[];
}
/**
 * Runway item status
 */
export declare enum RunwayItemStatus {
    BACKLOG = "backlog",
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    BLOCKED = "blocked",
    REVIEW = "review",
    APPROVED = "approved",
    IMPLEMENTED = "implemented",
    VERIFIED = "verified",
    CLOSED = "closed"
}
/**
 * Architectural context
 */
export interface ArchitecturalContext {
    readonly domain: string;
    readonly subdomain: string;
    readonly systemBoundaries: string[];
    readonly impactedComponents: string[];
    readonly architecturalLayers: ArchitecturalLayer[];
    readonly integrationPoints: IntegrationPoint[];
    readonly qualityAttributes: QualityAttribute[];
    readonly complianceRequirements: string[];
}
/**
 * Architectural layer
 */
export interface ArchitecturalLayer {
    readonly name: string;
    readonly description: string;
    readonly technologies: string[];
    readonly responsibilities: string[];
    readonly interfaces: LayerInterface[];
}
/**
 * Layer interface
 */
export interface LayerInterface {
    readonly name: string;
    readonly type: 'api' | 'event' | 'database' | 'file' | 'message_queue';
    readonly protocol: string;
    readonly dataFormat: string;
    readonly securityRequirements: string[];
}
/**
 * Integration point
 */
export interface IntegrationPoint {
    readonly name: string;
    readonly type: 'synchronous' | 'asynchronous' | 'batch' | 'stream';
    readonly systems: string[];
    readonly dataFlow: DataFlowDirection;
    readonly protocol: string;
    readonly securityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
    readonly performanceRequirements: PerformanceRequirement;
}
/**
 * Data flow direction
 */
export declare enum DataFlowDirection {
    INBOUND = "inbound",
    OUTBOUND = "outbound",
    BIDIRECTIONAL = "bidirectional"
}
/**
 * Performance requirement
 */
export interface PerformanceRequirement {
    readonly latency: number;
    readonly throughput: number;
    readonly availability: number;
    readonly scalability: ScalabilityRequirement;
}
/**
 * Scalability requirement
 */
export interface ScalabilityRequirement {
    readonly horizontal: boolean;
    readonly vertical: boolean;
    readonly maxLoad: number;
    readonly loadPattern: 'steady' | 'spiky' | 'seasonal';
}
/**
 * Quality attribute
 */
export interface QualityAttribute {
    readonly name: string;
    readonly category: 'performance' | 'security' | 'reliability' | 'scalability' | 'maintainability' | 'usability';
    readonly description: string;
    readonly measurementMethod: string;
    readonly target: QualityTarget;
    readonly current?: QualityMeasurement;
    readonly priority: 'must-have' | 'should-have' | 'could-have' | 'wont-have';
}
/**
 * Quality target
 */
export interface QualityTarget {
    readonly metric: string;
    readonly value: number;
    readonly unit: string;
    readonly condition: string;
    readonly testMethod: string;
}
/**
 * Quality measurement
 */
export interface QualityMeasurement {
    readonly value: number;
    readonly unit: string;
    readonly measuredAt: Date;
    readonly testMethod: string;
    readonly confidence: number;
}
/**
 * Technical specification
 */
export interface TechnicalSpecification {
    readonly technologies: Technology[];
    readonly frameworks: Framework[];
    readonly patterns: ArchitecturalPattern[];
    readonly standards: TechnicalStandard[];
    readonly tools: DevelopmentTool[];
    readonly environments: Environment[];
    readonly deployment: DeploymentSpecification;
}
/**
 * Technology specification
 */
export interface Technology {
    readonly name: string;
    readonly version: string;
    readonly purpose: string;
    readonly justification: string;
    readonly alternatives: string[];
    readonly risks: string[];
    readonly licensing: LicensingInfo;
    readonly support: SupportInfo;
}
/**
 * Framework specification
 */
export interface Framework {
    readonly name: string;
    readonly version: string;
    readonly purpose: string;
    readonly components: string[];
    readonly configuration: any;
    readonly customizations: string[];
}
/**
 * Architectural pattern
 */
export interface ArchitecturalPattern {
    readonly name: string;
    readonly type: 'structural' | 'behavioral' | 'creational';
    readonly description: string;
    readonly applicability: string;
    readonly implementation: string;
    readonly tradeoffs: string[];
}
/**
 * Technical standard
 */
export interface TechnicalStandard {
    readonly name: string;
    readonly version: string;
    readonly authority: string;
    readonly mandatoryRequirements: string[];
    readonly optionalRequirements: string[];
    readonly complianceLevel: 'full' | 'partial' | 'planned';
}
/**
 * Development tool
 */
export interface DevelopmentTool {
    readonly name: string;
    readonly version: string;
    readonly purpose: string;
    readonly configuration: any;
    readonly integrations: string[];
}
/**
 * Environment specification
 */
export interface Environment {
    readonly name: string;
    readonly type: 'development' | 'testing' | 'staging' | 'production';
    readonly infrastructure: InfrastructureSpec;
    readonly configuration: any;
    readonly securityProfile: SecurityProfile;
}
/**
 * Infrastructure specification
 */
export interface InfrastructureSpec {
    readonly compute: ComputeSpec;
    readonly storage: StorageSpec;
    readonly network: NetworkSpec;
    readonly monitoring: MonitoringSpec;
}
/**
 * Compute specification
 */
export interface ComputeSpec {
    readonly cpu: string;
    readonly memory: string;
    readonly instances: number;
    readonly autoScaling: boolean;
    readonly containerization: ContainerSpec;
}
/**
 * Container specification
 */
export interface ContainerSpec {
    readonly platform: string;
    readonly orchestration: string;
    readonly registry: string;
    readonly securityScanning: boolean;
}
/**
 * Deployment specification
 */
export interface DeploymentSpecification {
    readonly strategy: 'blue-green' | 'canary' | 'rolling' | 'recreate';
    readonly automation: boolean;
    readonly rollbackStrategy: string;
    readonly healthChecks: HealthCheck[];
    readonly monitoring: MonitoringRequirement[];
}
/**
 * Health check
 */
export interface HealthCheck {
    readonly name: string;
    readonly type: 'liveness' | 'readiness' | 'startup';
    readonly endpoint: string;
    readonly interval: number;
    readonly timeout: number;
    readonly retries: number;
}
/**
 * Acceptance criterion
 */
export interface AcceptanceCriterion {
    readonly id: string;
    readonly description: string;
    readonly type: 'functional' | 'non-functional' | 'technical' | 'business';
    readonly priority: 'must' | 'should' | 'could' | 'wont';
    readonly testMethod: string;
    readonly acceptanceTest: string;
    readonly status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'blocked';
    readonly verifiedBy?: string;
    readonly verifiedAt?: Date;
}
/**
 * Architectural risk
 */
export interface ArchitecturalRisk {
    readonly id: string;
    readonly category: 'technical' | 'business' | 'operational' | 'security' | 'compliance';
    readonly description: string;
    readonly impact: 'low' | 'medium' | 'high' | 'critical';
    readonly probability: number;
    readonly riskScore: number;
    readonly mitigation: RiskMitigation;
    readonly contingency?: RiskContingency;
    readonly owner: string;
    readonly status: 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'transferred' | 'avoided';
}
/**
 * Risk mitigation
 */
export interface RiskMitigation {
    readonly strategy: 'mitigate' | 'avoid' | 'transfer' | 'accept';
    readonly actions: string[];
    readonly timeline: string;
    readonly resources: string[];
    readonly successCriteria: string[];
}
/**
 * Risk contingency
 */
export interface RiskContingency {
    readonly trigger: string;
    readonly actions: string[];
    readonly resources: string[];
    readonly timeline: string;
    readonly escalation: string[];
}
/**
 * Architectural decision
 */
export interface ArchitecturalDecision {
    readonly id: string;
    readonly title: string;
    readonly context: string;
    readonly problem: string;
    readonly decision: string;
    readonly alternatives: Alternative[];
    readonly consequences: Consequence[];
    readonly rationale: string;
    readonly assumptions: string[];
    readonly constraints: string[];
    readonly stakeholders: string[];
    readonly status: ArchitectureDecisionStatus;
    readonly decisionDate?: Date;
    readonly reviewDate?: Date;
    readonly supersededBy?: string;
    readonly relatedDecisions: string[];
}
/**
 * Decision alternative
 */
export interface Alternative {
    readonly name: string;
    readonly description: string;
    readonly pros: string[];
    readonly cons: string[];
    readonly cost: number;
    readonly effort: number;
    readonly risk: 'low' | 'medium' | 'high';
    readonly feasibility: number;
}
/**
 * Decision consequence
 */
export interface Consequence {
    readonly type: 'positive' | 'negative' | 'neutral';
    readonly description: string;
    readonly impact: 'low' | 'medium' | 'high';
    readonly scope: string;
    readonly timeline: string;
}
/**
 * Technical debt item
 */
export interface TechnicalDebtItem {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly type: TechnicalDebtType;
    readonly severity: TechnicalDebtSeverity;
    readonly category: string;
    readonly component: string;
    readonly estimatedEffort: number;
    readonly businessImpact: string;
    readonly technicalImpact: string;
    readonly currentCost: number;
    readonly growthRate: number;
    readonly mitigationOptions: DebtMitigationOption[];
    readonly assignedTeam?: string;
    readonly targetResolution?: Date;
    readonly status: TechnicalDebtStatus;
    readonly priority: number;
    readonly createdBy: string;
    readonly createdAt: Date;
    readonly lastAssessed: Date;
}
/**
 * Technical debt types
 */
export declare enum TechnicalDebtType {
    CODE_QUALITY = "code_quality",
    ARCHITECTURE = "architecture",
    DESIGN = "design",
    DOCUMENTATION = "documentation",
    TESTING = "testing",
    SECURITY = "security",
    PERFORMANCE = "performance",
    INFRASTRUCTURE = "infrastructure"
}
/**
 * Technical debt status
 */
export declare enum TechnicalDebtStatus {
    IDENTIFIED = "identified",
    ASSESSED = "assessed",
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    ACCEPTED = "accepted",
    DEFERRED = "deferred"
}
/**
 * Debt mitigation option
 */
export interface DebtMitigationOption {
    readonly name: string;
    readonly description: string;
    readonly effort: number;
    readonly cost: number;
    readonly timeline: string;
    readonly benefits: string[];
    readonly risks: string[];
    readonly prerequisites: string[];
}
/**
 * Architecture backlog
 */
export interface ArchitectureBacklog {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly owner: string;
    readonly runwayItems: ArchitectureRunwayItem[];
    readonly technicalDebtItems: TechnicalDebtItem[];
    readonly architecturalDecisions: ArchitecturalDecision[];
    readonly prioritizationCriteria: PrioritizationCriterion[];
    readonly lastPrioritized: Date;
    readonly nextReview: Date;
}
/**
 * Prioritization criterion
 */
export interface PrioritizationCriterion {
    readonly name: string;
    readonly description: string;
    readonly weight: number;
    readonly evaluationMethod: string;
}
/**
 * Architecture Runway Manager state
 */
export interface ArchitectureRunwayState {
    readonly architectureBacklogs: Map<string, ArchitectureBacklog>;
    readonly runwayItems: Map<string, ArchitectureRunwayItem>;
    readonly technicalDebtItems: Map<string, TechnicalDebtItem>;
    readonly architecturalDecisions: Map<string, ArchitecturalDecision>;
    readonly runwayPlanning: Map<string, RunwayPlan>;
    readonly governanceReviews: Map<string, GovernanceReview>;
    readonly lastTracking: Date;
    readonly lastGovernanceReview: Date;
}
/**
 * Runway plan for PI
 */
export interface RunwayPlan {
    readonly piId: string;
    readonly artId: string;
    readonly plannedRunwayItems: string[];
    readonly plannedDebtItems: string[];
    readonly capacityAllocation: CapacityAllocation[];
    readonly dependencies: string[];
    readonly risks: string[];
    readonly success: any;
    Criteria: string[];
    readonly createdAt: Date;
    readonly approvedBy?: string;
    readonly approvedAt?: Date;
}
/**
 * Capacity allocation for runway work
 */
export interface CapacityAllocation {
    readonly teamId: string;
    readonly teamName: string;
    readonly allocatedCapacity: number;
    readonly runwayItems: string[];
    readonly debtItems: string[];
    readonly skills: string[];
    readonly constraints: string[];
}
/**
 * Governance review
 */
export interface GovernanceReview {
    readonly id: string;
    readonly type: 'architecture' | 'technology' | 'compliance' | 'security';
    readonly scope: string;
    readonly reviewDate: Date;
    readonly reviewers: string[];
    readonly items: ReviewItem[];
    readonly decisions: ReviewDecision[];
    readonly actionItems: ActionItem[];
    readonly nextReview: Date;
    readonly status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}
/**
 * Review item
 */
export interface ReviewItem {
    readonly id: string;
    readonly type: 'runway_item' | 'technical_debt' | 'architecture_decision' | 'design_document';
    readonly title: string;
    readonly description: string;
    readonly presenter: string;
    readonly duration: number;
    readonly materials: string[];
}
/**
 * Review decision
 */
export interface ReviewDecision {
    readonly itemId: string;
    readonly decision: 'approved' | 'rejected' | 'conditional' | 'deferred';
    readonly rationale: string;
    readonly conditions?: string[];
    readonly concerns: string[];
    readonly recommendations: string[];
    readonly followUpRequired: boolean;
    readonly followUpDate?: Date;
}
/**
 * Action item
 */
export interface ActionItem {
    readonly id: string;
    readonly description: string;
    readonly assignee: string;
    readonly dueDate: Date;
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly dependencies: string[];
    readonly status: 'open' | 'in_progress' | 'completed' | 'cancelled';
}
/**
 * Architecture Runway Manager - SAFe Architecture Runway and technical debt management
 */
export declare class ArchitectureRunwayManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly piManager;
    private readonly valueStreamMapper;
    private readonly config;
    private state;
    private trackingTimer?;
    private reviewTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, piManager: ProgramIncrementManager, valueStreamMapper: ValueStreamMapper, config?: Partial<ArchitectureRunwayConfig>);
    /**
     * Initialize the Architecture Runway Manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Architecture Runway Manager
     */
    shutdown(): Promise<void>;
    /**
     * Create architecture backlog and planning
     */
    createArchitectureBacklog(name: string, description: string, owner: string): Promise<ArchitectureBacklog>;
    /**
     * Add architecture runway item
     */
    addArchitectureRunwayItem(backlogId: string, runwayItemData: Partial<ArchitectureRunwayItem>): Promise<ArchitectureRunwayItem>;
    /**
     * Plan architecture runway for PI
     */
    planArchitectureRunwayForPI(piId: string, artId: string, availableCapacity: CapacityAllocation[]): Promise<RunwayPlan>;
    /**
     * Track architectural epic implementation
     */
    trackArchitecturalEpicProgress(epicId: string): Promise<EpicProgressReport>;
    /**
     * Track capability development
     */
    trackCapabilityDevelopment(capabilityId: string): Promise<CapabilityProgressReport>;
    /**
     * Create architecture decision with AGUI workflow
     */
    createArchitecturalDecision(title: string, context: string, problem: string, alternatives: Alternative[], stakeholders: string[]): Promise<ArchitecturalDecision>;
    /**
     * Execute architecture decision workflow through AGUI
     */
    executeArchitectureDecisionWorkflow(decisionId: string): Promise<void>;
    /**
     * Create technical debt management system
     */
    createTechnicalDebtManagement(): Promise<void>;
    /**
     * Add technical debt item
     */
    addTechnicalDebtItem(debtData: Partial<TechnicalDebtItem>): Promise<TechnicalDebtItem>;
    /**
     * Assess technical debt portfolio
     */
    assessTechnicalDebtPortfolio(): Promise<TechnicalDebtAssessment>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private initializeDefaultBacklog;
    private startRunwayTracking;
    private startGovernanceReviews;
    private registerEventHandlers;
    private createRunwayApprovalGate;
    private getEligibleRunwayItems;
    private prioritizeRunwayItems;
    private selectRunwayItemsForCapacity;
    private selectTechnicalDebtForPI;
    private identifyRunwayDependencies;
    private assessRunwayPlanRisks;
    private createRunwayPlanApprovalGate;
    private getEpicDetails;
    private calculateEpicProgress;
    private assessArchitecturalCompliance;
    private assessQualityAttributes;
    private getCapabilityDetails;
    private getCapabilityEpics;
    private getCapabilityFeatures;
    private calculateCapabilityProgress;
    private createArchitectureDecisionGate;
    private createDecisionReviewGate;
    private processDecisionGateResult;
    private setupAutomatedDebtDetection;
    private setupDebtThresholdMonitoring;
    private createCriticalDebtAlert;
    private checkDebtThreshold;
    private groupDebtByType;
    private groupDebtBySeverity;
    private calculateAverageDebtAge;
    private calculateDebtTrends;
    private generateDebtRecommendations;
    private calculateDebtRiskLevel;
    private performRunwayTracking;
    private performGovernanceReview;
    private handlePIPlanningStarted;
    private handleFeatureCompletion;
    private handleDebtThresholdExceeded;
}
export interface EpicProgressReport {
    readonly epicId: string;
    readonly epicName: string;
    readonly overallProgress: number;
    readonly runwayItemsCompleted: number;
    readonly runwayItemsTotal: number;
    readonly architecturalCompliance: any;
    readonly qualityAttributeStatus: any;
    readonly risks: string[];
    readonly blockers: string[];
    readonly nextMilestones: string[];
    readonly lastUpdated: Date;
}
export interface CapabilityProgressReport {
    readonly capabilityId: string;
    readonly capabilityName: string;
    readonly domain: string;
    readonly overallProgress: number;
    readonly epicProgress: number;
    readonly featureProgress: number;
    readonly runwayProgress: number;
    readonly architecturalReadiness: number;
    readonly risks: string[];
    readonly dependencies: string[];
    readonly lastUpdated: Date;
}
export interface TechnicalDebtAssessment {
    readonly totalItems: number;
    readonly debtByType: Record<string, number>;
    readonly debtBySeverity: Record<string, number>;
    readonly totalMonthlyCost: number;
    readonly averageAge: number;
    readonly trends: any;
    readonly highImpactItems: TechnicalDebtItem[];
    readonly recommendations: string[];
    readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
    readonly lastAssessed: Date;
}
export interface LicensingInfo {
    readonly type: 'open_source' | 'commercial' | 'proprietary' | 'custom';
    readonly license: string;
    readonly cost: number;
    readonly restrictions: string[];
}
export interface SupportInfo {
    readonly level: 'community' | 'commercial' | 'enterprise';
    readonly provider: string;
    readonly endOfLife?: Date;
    readonly updateFrequency: string;
}
export interface StorageSpec {
    readonly type: 'ssd' | 'hdd' | 'nvme' | 'cloud';
    readonly capacity: string;
    readonly iops: number;
    readonly backup: boolean;
}
export interface NetworkSpec {
    readonly bandwidth: string;
    readonly latency: string;
    readonly security: SecurityProfile;
    readonly loadBalancing: boolean;
}
export interface SecurityProfile {
    readonly authentication: string[];
    readonly authorization: string[];
    readonly encryption: EncryptionSpec;
    readonly compliance: string[];
}
export interface EncryptionSpec {
    readonly inTransit: boolean;
    readonly atRest: boolean;
    readonly algorithm: string;
    readonly keyManagement: string;
}
export interface MonitoringSpec {
    readonly metrics: string[];
    readonly logging: LoggingSpec;
    readonly alerting: AlertingSpec;
    readonly dashboards: string[];
}
export interface LoggingSpec {
    readonly level: 'debug' | 'info' | 'warn' | 'error';
    readonly retention: string;
    readonly aggregation: boolean;
}
export interface AlertingSpec {
    readonly channels: string[];
    readonly thresholds: Record<string, number>;
    readonly escalation: string[];
}
export interface MonitoringRequirement {
    readonly metric: string;
    readonly threshold: number;
    readonly action: string;
    readonly severity: 'info' | 'warning' | 'critical';
}
export default ArchitectureRunwayManager;
export type { ArchitectureRunwayConfig, ArchitectureRunwayItem, ArchitecturalDecision, TechnicalDebtItem, ArchitectureBacklog, RunwayPlan, ArchitectureRunwayState, EpicProgressReport, CapabilityProgressReport, TechnicalDebtAssessment, };
//# sourceMappingURL=architecture-runway-manager.d.ts.map