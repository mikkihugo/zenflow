/**
 * @file Workflow Gate Integration Examples
 *
 * Complete examples demonstrating workflow gate integration with various
 * scenarios including approval flows, escalation handling, and error recovery.
 */
/**
 * Example: Basic Workflow with Approval Gates
 *
 * Demonstrates how to create a simple workflow with approval gates
 * that pause execution until human approval is received.
 */
export declare function basicWorkflowWithGates(): Promise<void>;
/**
 * Example: Multi-Stage Product Approval Workflow
 *
 * Demonstrates a complex workflow with multiple approval stages,
 * different stakeholder groups, and escalation scenarios.
 */
export declare function multiStageProductApprovalWorkflow(): Promise<void>;
/**
 * Example: Gate Error Handling and Recovery
 *
 * Demonstrates how to handle various error scenarios in gate processing
 * including timeouts, escalations, and system failures.
 */
export declare function gateErrorHandlingAndRecovery(): Promise<void>;
/**
 * Example: Performance Optimization with Gates
 *
 * Demonstrates best practices for optimizing performance when using gates
 * in high-throughput scenarios.
 */
export declare function performanceOptimizedGateWorkflow(): Promise<void>;
export declare const examples: {
    basicWorkflowWithGates: typeof basicWorkflowWithGates;
    multiStageProductApprovalWorkflow: typeof multiStageProductApprovalWorkflow;
    gateErrorHandlingAndRecovery: typeof gateErrorHandlingAndRecovery;
    performanceOptimizedGateWorkflow: typeof performanceOptimizedGateWorkflow;
};
export declare function runAllExamples(): Promise<void>;
//# sourceMappingURL=workflow-gate-integration.d.ts.map