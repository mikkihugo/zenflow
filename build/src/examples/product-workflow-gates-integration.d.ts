/**
 * @file Product Workflow Engine with Gates Integration Example
 *
 * Demonstrates the enhanced ProductWorkflowEngine with AGUI gate capabilities:
 * - Gate injection at key workflow steps
 * - Human-in-the-loop decision points
 * - Workflow pause/resume based on gate decisions
 * - Decision audit trail and metrics
 *
 * This example shows how to orchestrate a complete product development workflow
 * with strategic decision gates for human oversight and approval.
 */
export declare class ProductWorkflowGatesIntegrationDemo {
    private engine;
    private eventBus;
    private aguiAdapter;
    private memorySystem;
    private documentManager;
    constructor();
    initialize(): Promise<void>;
    runDemo(): Promise<void>;
    private displaySystemStatus;
    private runProductWorkflowWithGates;
    private monitorWorkflowProgress;
    private simulateGateDecision;
    private displayGateMetrics;
    shutdown(): Promise<void>;
}
/**
 * Run the Product Workflow Gates Integration Demo
 */
export declare function runProductWorkflowGatesDemo(): Promise<void>;
/**
 * Interactive demo with step-by-step execution
 */
export declare function runInteractiveDemo(): Promise<void>;
export default ProductWorkflowGatesIntegrationDemo;
export { runProductWorkflowGatesDemo, runInteractiveDemo };
//# sourceMappingURL=product-workflow-gates-integration.d.ts.map