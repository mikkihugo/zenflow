/**
 * @file Workflow Gate System Integration Example
 *
 * Comprehensive example demonstrating the workflow gates system with:
 * - All five gate types (Strategic, Architectural, Quality, Business, Ethical)
 * - Event-driven triggers and condition evaluation
 * - Queue management and processing
 * - AGUI integration for human-in-the-loop decisions
 * - Real-world workflow scenarios
 * - Metrics and analytics
 *
 * This example shows how to integrate the workflow gates system into a
 * product development workflow with realistic scenarios.
 */
/**
 * Comprehensive integration example showing real-world usage of the workflow gates system
 */
export declare class WorkflowGateSystemIntegration {
    private readonly gatesManager;
    private readonly eventBus;
    private readonly gateProcessor;
    private readonly aguiInterface;
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    private setupEventHandlers;
    private processGateForReview;
    private createWorkflowGateRequest;
    private emitIntegrationEvent;
    /**
     * Scenario 1: Product Requirements Document (PRD) Approval Workflow
     */
    runPRDApprovalWorkflow(): Promise<void>;
    /**
     * Scenario 2: Architecture Review Workflow
     */
    runArchitectureReviewWorkflow(): Promise<void>;
    /**
     * Scenario 3: Security and Performance Quality Gates
     */
    runQualityGateWorkflow(): Promise<void>;
    /**
     * Scenario 4: Business Validation and Metrics Review
     */
    runBusinessValidationWorkflow(): Promise<void>;
    /**
     * Scenario 5: Ethical AI Review
     */
    runEthicalReviewWorkflow(): Promise<void>;
    /**
     * Run complete end-to-end workflow with all gate types
     */
    runCompleteWorkflow(): Promise<void>;
    /**
     * Monitor workflow progress in real-time
     */
    monitorWorkflowProgress(): Promise<void>;
    private simulateWorkflowEvent;
    private waitForGateResolution;
    private displayMetricsReport;
    private mapImpactToLevel;
    private mapGatePriorityToValidationPriority;
}
/**
 * Run the complete workflow gates system integration demonstration
 */
export declare function runWorkflowGateSystemDemo(): Promise<void>;
/**
 * Run individual workflow scenario demonstrations
 */
export declare function runIndividualWorkflowScenarios(): Promise<void>;
export default WorkflowGateSystemIntegration;
export { runWorkflowGateSystemDemo, runIndividualWorkflowScenarios };
//# sourceMappingURL=workflow-gate-system-integration.d.ts.map