/**
 * @fileoverview System and Solution Architecture Manager - Lightweight facade for SAFe framework integration.
 *
 * Provides system-level design coordination and solution architect workflow through delegation to specialized
 * services for system design management, compliance monitoring, and architecture reviews.
 *
 * Delegates to: * - SystemDesignManagementService: System design creation and lifecycle management
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
/**
 * System and Solution Architecture Manager configuration
 */
export interface SystemSolutionArchConfig {
    readonly enableSystemDesignCoordination: 'monolithic';
}
/**
 * Solution architecture patterns
 */
export declare enum SolutionArchitecturePattern {
    ')  TRADITIONAL_3_TIER = ' = 0,
    traditional_3_tier = 1,
    ')  MICRO_FRONTEND = ' = 2,
    micro_frontend = 3,
    ')  SERVERLESS = ' = 4,
    serverless = 5,
    ')  CLOUD_NATIVE = ' = 6,
    cloud_native = 7,
    ')  HYBRID_CLOUD = ' = 8,
    hybrid_cloud = 9,
    ')  EDGE_COMPUTING = ' = 10,
    edge_computing = 11,
    ')};; 
    /**
     * System design interface
     */
    = 12
    /**
     * System design interface
     */
    ,
    /**
     * System design interface
     */
    export = 13,
    interface = 14,
    SystemDesign = 15
}
/**
 * Business context for system design
 */
export interface BusinessContext {
    readonly domain: 'service';
}
/**
 * Component interface
 */
export interface ComponentInterface {
    readonly id: string;
    readonly name: string;
    readonly type: 'synchronous' | ' asynchronous' | ' batch';
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
    readonly status: 'compliant| non_compliant| partial' | ' not_assessed';
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
    readonly reviewType: 'peer| formal| compliance' | ' security';
    readonly status: 'pending| in_progress| approved| rejected' | ' conditionally_approved';
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
    readonly category: 'compliance| design| quality' | ' risk';
    readonly severity: critical | high | medium | low;
}
/**
 * System and Solution Architecture Manager - Facade delegating to @claude-zen packages
 *
 * Coordinates system-level design and solution architecture through intelligent delegation
 * to specialized packages for architecture management, workflow orchestration, and compliance.
 */
export declare class SystemSolutionArchitectureManager extends EventBus {
    private readonly logger;
    constructor(_config: getLogger);
}
//# sourceMappingURL=system-solution-architecture-manager.d.ts.map