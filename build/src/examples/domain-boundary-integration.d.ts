/**
 * @file Domain Boundary Integration Examples
 *
 * Comprehensive examples showing how the domain boundary validator integrates
 * with existing domain types and provides runtime validation for the entire system.
 *
 * These examples demonstrate real-world usage patterns for Phase 0 foundation.
 */
import type { ExecutionPlan, PhaseAssignment } from '../coordination/types.ts';
import { type DomainOperation, type TypeSchema } from '../core/domain-boundary-validator.ts';
import type { WorkflowEvent, WorkflowExecution } from '../workflows/types.ts';
/**
 * Extended schemas for complex domain operations
 */
export declare const ExtendedSchemas: any;
/**
 * Common contract rules for domain operations
 */
export declare const ContractRules: {
    /**
     * Validates that an agent has required capabilities for a task
     */
    readonly agentCapabilityValidation: {
        readonly name: "agent-capability-validation";
        readonly description: "Validates agent capabilities match task requirements";
        readonly validator: (operation: DomainOperation, context: any) => Promise<boolean>;
        readonly severity: "error";
        readonly errorMessage: "Agent does not have required capabilities for task";
    };
    /**
     * Rate limiting for cross-domain operations
     */
    readonly rateLimitValidation: {
        readonly name: "rate-limit-validation";
        readonly description: "Enforces rate limits on cross-domain operations";
        readonly validator: (operation: DomainOperation, context: any) => Promise<boolean>;
        readonly severity: "warning";
        readonly errorMessage: "Rate limit exceeded for cross-domain operation";
    };
    /**
     * Security validation for sensitive operations
     */
    readonly securityValidation: {
        readonly name: "security-validation";
        readonly description: "Validates security requirements for domain operations";
        readonly validator: (operation: DomainOperation, context: any) => Promise<boolean>;
        readonly severity: "error";
        readonly errorMessage: "Security validation failed for sensitive operation";
    };
    /**
     * Data consistency validation
     */
    readonly dataConsistencyValidation: {
        readonly name: "data-consistency-validation";
        readonly description: "Ensures data consistency across domain boundaries";
        readonly validator: (operation: DomainOperation, context: any) => Promise<boolean>;
        readonly severity: "warning";
        readonly errorMessage: "Data consistency issue detected between input and output schemas";
    };
};
/**
 * Example: Coordination domain validating agent assignment
 */
export declare function coordinationDomainExample(): Promise<void>;
/**
 * Example: Workflows domain validating execution plans
 */
export declare function workflowsDomainExample(): Promise<void>;
/**
 * Example: Contract enforcement for cross-domain operations
 */
export declare function contractEnforcementExample(): Promise<void>;
/**
 * Example: Performance monitoring and optimization
 */
export declare function performanceMonitoringExample(): Promise<void>;
/**
 * Example: Complex multi-domain workflow validation
 */
export declare function complexMultiDomainExample(): Promise<void>;
/**
 * Example: Error handling and recovery patterns
 */
export declare function errorHandlingExample(): Promise<void>;
/**
 * Run all integration examples
 */
export declare function runAllExamples(): Promise<void>;
export { ContractRules, ExtendedSchemas };
//# sourceMappingURL=domain-boundary-integration.d.ts.map