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
* REDUCTION: 860 ~300 lines (~65% reduction) through service delegation
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
    readonly enableSystemDesignCoordination: boolean;
}

/**
* Solution architecture patterns
*/
export declare enum SolutionArchitecturePattern {
    monolithic = 0,
    traditional_3_tier = 1,
    microservices = 2,
    micro_frontend = 3,
    event_driven = 4,
    serverless = 5,
    cloud_native = 6,
    hybrid_cloud = 7,
    edge_computing = 8
}

/**
* Component interface
*/
export interface ComponentInterface {
    id: string;
    name: string;
    type: string;
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
id: string;

}
/**
* Control requirement
*/
export interface ControlRequirement {
id: string;

}
/**
* Architecture review
*/
export interface ArchitectureReview {
id: string;

}
/**
* Review finding
*/
export interface ReviewFinding {
id: string;

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