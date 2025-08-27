/**
 * @fileoverview Multi-ART Coordination Service
 *
 * Service for coordinating multiple Agile Release Trains (ARTs) within a solution train.
 * Handles ART synchronization, dependency management, and cross-ART collaboration.
 *
 * SINGLE RESPONSIBILITY: Multi-ART coordination and synchronization
 * FOCUSES ON: ART coordination, dependency management, cross-train collaboration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
/**
 * Multi-ART coordination configuration
 */
export interface MultiARTCoordinationConfig {
    readonly coordinationId: string;
    readonly solutionId: string;
    readonly coordinatedARTs: CoordinatedART[];
    readonly synchronizationStrategy: SynchronizationStrategy;
    readonly dependencyManagement: DependencyManagementConfig;
    readonly communicationProtocols: CommunicationProtocol[];
    readonly coordinationCadence: CoordinationCadence;
}
/**
 * Coordinated ART information
 */
export interface CoordinatedART {
    readonly artId: string;
    readonly artName: string;
    readonly domain: string;
    readonly rteContact: string;
    readonly teamCount: number;
    readonly capacity: ARTCapacity;
    readonly dependencies: ARTDependency[];
    readonly integrationPoints: IntegrationPoint[];
    readonly synchronizationNeeds: SynchronizationRequirement[];
}
/**
 * ART capacity information
 */
export interface ARTCapacity {
    readonly totalCapacity: number;
    readonly availableCapacity: number;
    readonly utilization: number;
    readonly skillMatrix: SkillCapacity[];
    readonly constrainingFactors: string[];
}
/**
 * Skill-based capacity tracking
 */
export interface SkillCapacity {
    readonly skill: string;
    readonly totalCapacity: number;
    readonly allocatedCapacity: number;
    readonly demand: number;
    readonly shortage: number;
}
/**
 * ART dependency tracking
 */
export interface ARTDependency {
    readonly dependencyId: string;
    readonly fromART: string;
    readonly toART: string;
    readonly type: DependencyType;
    readonly criticality: DependencyCriticality;
    readonly description: string;
    readonly plannedDeliveryDate: Date;
    readonly actualDeliveryDate?: Date;
    readonly status: DependencyStatus;
    readonly mitigationPlan?: string;
}
/**
 * Dependency types
 */
export declare enum DependencyType {
    TECHNICAL = "technical",
    DATA = "data",
    INTEGRATION = "integration",
    SHARED_SERVICE = "shared_service",
    INFRASTRUCTURE = "infrastructure",
    KNOWLEDGE = "knowledge"
}
/**
 * Dependency criticality levels
 */
export declare enum DependencyCriticality {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Dependency status tracking
 */
export declare enum DependencyStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    DELIVERED = "delivered",
    BLOCKED = "blocked",
    AT_RISK = "at_risk",
    CANCELLED = "cancelled"
}
/**
 * Integration point between ARTs
 */
export interface IntegrationPoint {
    readonly integrationId: string;
    readonly name: string;
    readonly participatingARTs: string[];
    readonly integrationType: IntegrationType;
    readonly frequency: IntegrationFrequency;
    readonly complexity: IntegrationComplexity;
    readonly owner: string;
    readonly testStrategy: string;
}
/**
 * Integration types
 */
export declare enum IntegrationType {
    API = "api",
    DATABASE = "database",
    MESSAGE_QUEUE = "message_queue",
    BATCH_PROCESS = "batch_process",
    USER_INTERFACE = "user_interface",
    SHARED_COMPONENT = "shared_component"
}
/**
 * Integration frequency
 */
export declare enum IntegrationFrequency {
    CONTINUOUS = "continuous",
    DAILY = "daily",
    WEEKLY = "weekly",
    PI_BOUNDARY = "pi_boundary",
    ON_DEMAND = "on_demand"
}
/**
 * Integration complexity levels
 */
export declare enum IntegrationComplexity {
    SIMPLE = "simple",
    MODERATE = "moderate",
    COMPLEX = "complex",
    VERY_COMPLEX = "very_complex"
}
/**
 * Synchronization requirements
 */
export interface SynchronizationRequirement {
    readonly requirementId: string;
    readonly description: string;
    readonly synchronizationType: SynchronizationType;
    readonly frequency: SynchronizationFrequency;
    readonly involvedARTs: string[];
    readonly synchronizationPoint: string;
    readonly successCriteria: string[];
}
/**
 * Synchronization types
 */
export declare enum SynchronizationType {
    PLANNING = "planning",
    INTEGRATION = "integration",
    DELIVERY = "delivery",
    MILESTONE = "milestone",
    GOVERNANCE = "governance",
    LEARNING = "learning"
}
/**
 * Synchronization frequency
 */
export declare enum SynchronizationFrequency {
    REAL_TIME = "real_time",
    DAILY = "daily",
    WEEKLY = "weekly",
    SPRINT_BOUNDARY = "sprint_boundary",
    PI_BOUNDARY = "pi_boundary"
}
/**
 * Synchronization strategy
 */
export interface SynchronizationStrategy {
    readonly strategyName: string;
    readonly approach: 'centralized' | 'federated' | 'hybrid';
    readonly coordinationMechanisms: CoordinationMechanism[];
    readonly synchronizationPoints: SynchronizationPoint[];
    readonly escalationPaths: EscalationPath[];
}
/**
 * Coordination mechanism
 */
export interface CoordinationMechanism {
    readonly mechanismId: string;
    readonly name: string;
    readonly type: 'meeting|tool|process|artifact;;
    readonly frequency: string;
    readonly participants: string[];
    readonly purpose: string;
}
/**
 * Synchronization point
 */
export interface SynchronizationPoint {
    readonly pointId: string;
    readonly name: string;
    readonly timing: string;
    readonly involvedARTs: string[];
    readonly deliverables: string[];
    readonly successCriteria: string[];
}
/**
 * Escalation path configuration
 */
export interface EscalationPath {
    readonly pathId: string;
    readonly triggerConditions: string[];
    readonly escalationLevels: EscalationLevel[];
    readonly timeThresholds: number[];
    readonly notificationChannels: string[];
}
/**
 * Escalation level
 */
export interface EscalationLevel {
    readonly level: number;
    readonly escalationTo: string[];
    readonly actionRequired: string;
    readonly timeLimit: number;
}
/**
 * Dependency management configuration
 */
export interface DependencyManagementConfig {
    readonly trackingStrategy: 'manual' | 'automated' | 'hybrid';
    readonly identificationMethods: string[];
    readonly managementTools: string[];
    readonly reportingCadence: 'daily|weekly|bi-weekly;;
    readonly escalationCriteria: EscalationCriteria;
}
/**
 * Escalation criteria for dependency management
 */
export interface EscalationCriteria {
    readonly daysOverdue: number;
    readonly criticalityThreshold: DependencyCriticality;
    readonly impactThreshold: 'low' | 'medium' | 'high';
    readonly automaticEscalation: boolean;
}
/**
 * Communication protocol
 */
export interface CommunicationProtocol {
    readonly protocolId: string;
    readonly name: string;
    readonly purpose: string;
    readonly participants: string[];
    readonly frequency: string;
    readonly format: 'synchronous|asynchronous;;
    readonly channels: string[];
    readonly agenda: string[];
}
/**
 * Coordination cadence
 */
export interface CoordinationCadence {
    readonly dailySyncEnabled: boolean;
    readonly weeklySyncEnabled: boolean;
    readonly piPlanningSyncEnabled: boolean;
    readonly inspectAdaptSyncEnabled: boolean;
    readonly adhocSyncProtocol: AdhocSyncProtocol;
}
/**
 * Ad-hoc synchronization protocol
 */
export interface AdhocSyncProtocol {
    readonly triggerConditions: string[];
    readonly responseTime: number;
    readonly escalationPath: string[];
    readonly decisionAuthority: string[];
}
/**
 * ART coordination result
 */
export interface ARTCoordinationResult {
    readonly coordinationId: string;
    readonly timestamp: Date;
    readonly participatingARTs: string[];
    readonly coordinationActivities: CoordinationActivity[];
    readonly dependenciesManaged: ARTDependency[];
    readonly synchronizationOutcomes: SynchronizationOutcome[];
    readonly issuesIdentified: CoordinationIssue[];
    readonly actionItems: ActionItem[];
    readonly effectiveness: CoordinationEffectiveness;
}
/**
 * Coordination activity
 */
export interface CoordinationActivity {
    readonly activityId: string;
    readonly activityType: planning | synchronization | integration | 'review;;
    readonly duration: number;
    readonly participants: string[];
    readonly outcomes: string[];
    readonly followupRequired: boolean;
}
/**
 * Synchronization outcome
 */
export interface SynchronizationOutcome {
    readonly outcomeId: string;
    readonly synchronizationType: SynchronizationType;
    readonly success: boolean;
    readonly participants: string[];
    readonly deliverables: string[];
    readonly issues: string[];
    readonly nextSynchronization: Date;
}
/**
 * Coordination issue
 */
export interface CoordinationIssue {
    readonly issueId: string;
    readonly severity: 'low|medium|high|critical;;
    readonly description: string;
    readonly impactedARTs: string[];
    readonly rootCause: string;
    readonly proposedResolution: string;
    readonly owner: string;
    readonly dueDate: Date;
}
/**
 * Action item from coordination
 */
export interface ActionItem {
    readonly itemId: string;
    readonly description: string;
    readonly owner: string;
    readonly assignedART: string;
    readonly priority: 'high' | 'medium' | 'low';
    readonly dueDate: Date;
    readonly status: 'open|in_progress|completed|cancelled;;
    readonly dependencies: string[];
}
/**
 * Coordination effectiveness metrics
 */
export interface CoordinationEffectiveness {
    readonly overallScore: number;
    readonly participationRate: number;
    readonly dependencyResolutionRate: number;
    readonly synchronizationSuccessRate: number;
    readonly issueEscalationRate: number;
    readonly stakeholderSatisfaction: number;
    readonly recommendations: string[];
}
/**
 * Multi-ART Coordination Service for managing multiple ARTs in a solution train
 */
export declare class MultiARTCoordinationService {
    private readonly logger;
    private coordinationConfigs;
    private dependencies;
    private coordinationResults;
    private integrationPoints;
    constructor(logger: Logger);
    /**
     * Configure multi-ART coordination
     */
    configureCoordination(config: MultiARTCoordinationConfig): void;
    /**
     * Coordinate solution train ARTs
     */
    coordinateARTs(coordinationId: string): ARTCoordinationResult;
    /**
     * Get dependencies for ART
     */
    getDependenciesForART(artId: string): ARTDependency[];
    /**
     * Get critical dependencies
     */
    getCriticalDependencies(): ARTDependency[];
    /**
     * Get blocked dependencies
     */
    getBlockedDependencies(): ARTDependency[];
    /**
     * Private helper methods
     */
    private validateCoordinationConfig;
    private initializeDependencyTracking;
    private initializeIntegrationPoints;
    private configureSynchronizationMechanisms;
    private executeCoordinationActivities;
}
//# sourceMappingURL=multi-art-coordination-service.d.ts.map