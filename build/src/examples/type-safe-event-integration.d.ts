/**
 * @file Type-Safe Event System Integration Examples
 *
 * Demonstrates how to use the type-safe event system with domain boundary validation
 * for various scenarios including AGUI integration, multi-agent coordination,
 * and cross-domain workflows.
 *
 * These examples show best practices for:
 * - Event-driven architecture implementation
 * - Domain boundary validation integration
 * - AGUI human validation workflows
 * - Performance-optimized event processing
 * - Error handling and recovery patterns
 */
import type { Agent } from '../coordination/types.ts';
import { type BaseEvent, EventPriority, type TypeSafeEventBus } from '../core/type-safe-event-system.ts';
import type { WorkflowContext, WorkflowDefinition } from '../workflows/types.ts';
/**
 * Example 1: Setting up a type-safe event bus with comprehensive configuration
 */
export declare function createProductionEventBus(): Promise<TypeSafeEventBus>;
/**
 * Example 2: Complete multi-agent coordination workflow using events
 */
export declare class EventDrivenCoordinationSystem {
    private eventBus;
    constructor(eventBus: TypeSafeEventBus);
    initializeCoordination(): Promise<void>;
    createAgent(agentConfig: {
        id: string;
        capabilities: string[];
        type: 'researcher' | 'coder' | 'analyst' | 'coordinator';
    }): Promise<Agent>;
    assignTask(taskId: string, agentId: string): Promise<void>;
    private handleAgentCreated;
    private handleAgentDestroyed;
    private handleTaskAssigned;
    private handleTaskCompleted;
    private handleSwarmStateChanged;
}
/**
 * Example 3: AGUI integration for human validation workflows
 */
export declare class AGUIValidationSystem {
    private eventBus;
    private pendingValidations;
    constructor(eventBus: TypeSafeEventBus);
    initializeAGUI(): Promise<void>;
    requestHumanValidation(validationType: 'approval' | 'selection' | 'input' | 'review', context: any, options?: {
        priority?: EventPriority;
        timeout?: number;
        correlationId?: string;
    }): Promise<{
        approved: boolean;
        input?: any;
        feedback?: string;
    }>;
    openAGUIGate(gateType: string, context: any, requiresApproval?: boolean): Promise<{
        approved: boolean;
        duration: number;
        humanInput?: any;
    }>;
    private closeAGUIGate;
    private handleValidationRequest;
    private handleValidationCompleted;
    private handleGateOpened;
    private handleGateClosed;
}
/**
 * Example 4: Complex workflow orchestration across multiple domains
 */
export declare class CrossDomainWorkflowOrchestrator {
    private eventBus;
    constructor(eventBus: TypeSafeEventBus);
    initializeOrchestrator(): Promise<void>;
    executeComplexWorkflow(workflowId: string, definition: WorkflowDefinition, context: WorkflowContext): Promise<{
        success: boolean;
        result?: any;
        error?: Error;
    }>;
    private handleWorkflowStarted;
    private handleWorkflowCompleted;
    private handleWorkflowFailed;
    private handleWorkflowStepCompleted;
}
/**
 * Example 5: Comprehensive performance monitoring with event analytics
 */
export declare class EventSystemAnalytics {
    private eventBus;
    private metricsCollectionInterval?;
    constructor(eventBus: TypeSafeEventBus);
    startMonitoring(intervalMs?: number): Promise<void>;
    stopMonitoring(): Promise<void>;
    private collectEventAnalytics;
    private reportMetrics;
    getAnalyticsReport(): {
        metrics: any;
        performanceStats: any;
        eventHistory: BaseEvent[];
        recommendations: string[];
    };
}
/**
 * Example 6: Complete system integration demonstrating all features
 */
export declare function demonstrateCompleteIntegration(): Promise<void>;
export { EventDrivenCoordinationSystem, AGUIValidationSystem, CrossDomainWorkflowOrchestrator, EventSystemAnalytics, };
export declare function runExamples(): Promise<void>;
//# sourceMappingURL=type-safe-event-integration.d.ts.map