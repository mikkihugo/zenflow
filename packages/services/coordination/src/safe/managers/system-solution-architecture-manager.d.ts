/**
 * @fileoverview System and Solution Architecture Manager - Lightweight facade for SAFe framework integration.
 *
 * Provides system-level design coordination and solution architect workflow through delegation to specialized
 * services for system design management, compliance monitoring, and architecture reviews.
 *
 * Delegates to:
 * - SystemDesignManagementService: System design creation and lifecycle management
 * - ComplianceMonitoringService: Automated compliance validation and monitoring
 * - ArchitectureReviewManagementService: Architecture review workflows and coordination
 *
 * REDUCTION: 860 → ~300 lines (~65% reduction) through service delegation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { EventBus } from '@claude-zen/foundation';
import type { MemorySystem, TypeSafeEventBus } from '../types';
/**
 * System and Solution Architecture Manager configuration
 */
export interface SystemSolutionArchConfig {
    readonly enableSystemDesignCoordination: boolean;
    readonly enableSolutionArchitectWorkflow: boolean;
    readonly enableArchitectureReviews: boolean;
    readonly enableComplianceMonitoring: boolean;
    readonly enablePerformanceTracking: boolean;
    readonly maxConcurrentReviews: number;
    readonly reviewTimeout: number;
    readonly complianceCheckInterval: number;
}
/**
 * System architecture types for design coordination
 */
export declare enum SystemArchitectureType {
    MONOLITHIC = "monolithic",
    MICROSERVICES = "microservices",
    SERVICE_ORIENTED = "service_oriented",
    EVENT_DRIVEN = "event_driven",
    LAYERED = "layered",
    HEXAGONAL = "hexagonal",
    CLEAN_ARCHITECTURE = "clean_architecture"
}
/**
 * Solution architecture patterns
 */
export declare enum SolutionArchitecturePattern {
    TRADITIONAL_3_TIER = "traditional_3_tier",
    MICRO_FRONTEND = "micro_frontend",
    SERVERLESS = "serverless",
    CLOUD_NATIVE = "cloud_native",
    HYBRID_CLOUD = "hybrid_cloud",
    EDGE_COMPUTING = "edge_computing"
}
/**
 * System design interface
 */
export interface SystemDesign {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly type: SystemArchitectureType;
    readonly pattern: SolutionArchitecturePattern;
    readonly status: SystemDesignStatus;
    readonly businessContext: BusinessContext;
    readonly stakeholders: Stakeholder[];
    readonly architecturalDrivers: ArchitecturalDriver[];
    readonly components: SystemComponent[];
    readonly interfaces: ComponentInterface[];
    readonly constraints: ArchitecturalConstraint[];
    readonly qualityAttributes: QualityAttributeSpec[];
    readonly complianceRequirements: ComplianceRequirement[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly reviewHistory: ArchitectureReview[];
}
/**
 * System design status
 */
export declare enum SystemDesignStatus {
    DRAFT = "draft",
    IN_REVIEW = "in_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    DEPRECATED = "deprecated",
    IMPLEMENTATION_READY = "implementation_ready"
}
/**
 * Business context for system design
 */
export interface BusinessContext {
    readonly domain: string;
    readonly businessGoals: string[];
    readonly constraints: string[];
    readonly assumptions: string[];
    readonly risks: string[];
    readonly successCriteria: string[];
}
/**
 * Stakeholder information
 */
export interface Stakeholder {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly concerns: string[];
    readonly influence: 'high' | 'medium' | 'low';
    readonly involvement: 'active' | 'consulted' | 'informed';
}
/**
 * Architectural driver
 */
export interface ArchitecturalDriver {
    readonly id: string;
    readonly type: 'functional' | 'quality' | 'constraint';
    readonly description: string;
    readonly rationale: string;
    readonly priority: 'critical|high|medium|low;;
    readonly source: string;
    readonly impactedComponents: string[];
}
/**
 * Quality attribute specification
 */
export interface QualityAttributeSpec {
    readonly id: string;
    readonly attribute: string;
    readonly scenarios: QualityAttributeScenario[];
    readonly measures: QualityMeasure[];
    readonly tactics: ArchitecturalTactic[];
}
/**
 * Quality attribute scenario
 */
export interface QualityAttributeScenario {
    readonly id: string;
    readonly source: string;
    readonly stimulus: string;
    readonly artifact: string;
    readonly environment: string;
    readonly response: string;
    readonly measure: string;
}
/**
 * Quality measure
 */
export interface QualityMeasure {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly unit: string;
    readonly target: number;
    readonly threshold: number;
    readonly measurementMethod: string;
}
/**
 * Architectural tactic
 */
export interface ArchitecturalTactic {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly applicableScenarios: string[];
    readonly tradeoffs: string[];
}
/**
 * Architectural constraint
 */
export interface ArchitecturalConstraint {
    readonly id: string;
    readonly type: 'technical|business|regulatory|organizational;;
    readonly description: string;
    readonly rationale: string;
    readonly implications: string[];
    readonly compliance: ComplianceRequirement[];
}
/**
 * System component
 */
export interface SystemComponent {
    readonly id: string;
    readonly name: string;
    readonly type: ComponentType;
    readonly description: string;
    readonly responsibilities: string[];
    readonly interfaces: string[];
    readonly dependencies: string[];
    readonly qualityAttributes: string[];
    readonly constraints: string[];
    readonly deploymentUnit: string;
}
/**
 * Component type
 */
export declare enum ComponentType {
    SERVICE = "service",
    DATABASE = "database",
    GATEWAY = "gateway",
    QUEUE = "queue",
    CACHE = "cache",
    EXTERNAL_SYSTEM = "external_system",
    UI_COMPONENT = "ui_component"
}
/**
 * Component interface
 */
export interface ComponentInterface {
    readonly id: string;
    readonly name: string;
    readonly type: 'synchronous' | 'asynchronous' | 'batch';
    readonly protocol: string;
    readonly producer: string;
    readonly consumer: string;
    readonly dataFormat: string;
    readonly securityRequirements: string[];
    readonly performanceRequirements: PerformanceExpectation[];
}
/**
 * Performance expectation
 */
export interface PerformanceExpectation {
    readonly metric: string;
    readonly target: number;
    readonly threshold: number;
    readonly unit: string;
}
/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
    readonly id: string;
    readonly framework: string;
    readonly requirement: string;
    readonly description: string;
    readonly controls: ControlRequirement[];
    readonly evidence: string[];
    readonly status: 'compliant|non_compliant|partial|not_assessed;;
}
/**
 * Control requirement
 */
export interface ControlRequirement {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly mandatory: boolean;
    readonly implementation: string;
    readonly verification: string;
}
/**
 * Architecture review
 */
export interface ArchitectureReview {
    readonly id: string;
    readonly reviewerId: string;
    readonly reviewType: 'peer|formal|compliance|security;;
    readonly status: 'pending|in_progress|approved|rejected|conditionally_approved;;
    readonly findings: ReviewFinding[];
    readonly recommendations: string[];
    readonly decision: string;
    readonly createdAt: Date;
    readonly completedAt?: Date;
}
/**
 * Review finding
 */
export interface ReviewFinding {
    readonly id: string;
    readonly category: 'compliance|design|quality|risk;;
    readonly severity: 'critical|high|medium|low|info;;
    readonly description: string;
    readonly recommendation: string;
    readonly impactedComponents: string[];
    readonly mustFix: boolean;
}
/**
 * System and Solution Architecture Manager - Facade delegating to @claude-zen packages
 *
 * Coordinates system-level design and solution architecture through intelligent delegation
 * to specialized packages for architecture management, workflow orchestration, and compliance.
 */
export declare class SystemSolutionArchitectureManager extends EventBus {
    private readonly logger;
    private readonly eventBus;
    private systemDesignService?;
    private complianceMonitoringService?;
    private architectureReviewService?;
    private performanceTracker?;
    private telemetryManager?;
    private initialized;
    constructor(_config: SystemSolutionArchConfig, memorySystem: MemorySystem, eventBus: TypeSafeEventBus);
    /**
     * Initialize with service delegation - LAZY LOADING
     */
    initialize(): Promise<void>;
    /**
     * Create a new system design - Delegates to System Design Management Service
     */
    createSystemDesign(name: string, type: SystemArchitectureType, pattern: SolutionArchitecturePattern, businessContext: BusinessContext): Promise<SystemDesign>;
}
//# sourceMappingURL=system-solution-architecture-manager.d.ts.map