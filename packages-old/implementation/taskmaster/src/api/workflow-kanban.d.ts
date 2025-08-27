/**
 * @fileoverview Workflow Kanban API - Professional Domain Interface
 *
 * Clean, domain-specific API for workflow coordination powered by XState.
 * Provides high-level interface for Queens/Commanders/Cubes coordination
 * while hiding XState complexity behind professional abstractions.
 *
 * **DOMAIN FOCUS:**
 * - Workflow task coordination and state management
 * - WIP limit enforcement and intelligent optimization
 * - Real-time bottleneck detection and resolution
 * - Flow metrics analysis and performance tracking
 * - Event-driven coordination with type safety
 *
 * **BATTLE-TESTED FOUNDATION:**
 * - XState state machines for reliable state management
 * - EventEmitter3 for high-performance event handling
 * - Foundation utilities for robust error handling
 * - Event system integration for coordination
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { TypedEventBase } from '@claude-zen/foundation';
interface TypeSafeEventBus {
    emit(event: any): Promise<void>;
}
import type { FlowMetrics, KanbanOperationResult, TaskState, WorkflowBottleneck, WorkflowKanbanConfig, WorkflowTask } from '../types/index';
/**
 * Events emitted by WorkflowKanban for external coordination
 */
export interface WorkflowKanbanEvents {
    'task:created': [task: WorkflowTask];
    ': any;
    'task:moved': [taskId: string, fromState: TaskState, toState: TaskState];
    ': any;
    'task:blocked': [taskId: string, reason: string];
    ': any;
    'task:completed': [taskId: string, duration: number];
    ': any;
    'wip:exceeded': [state: TaskState, count: number, limit: number];
    ': any;
    'bottleneck:detected': [bottleneck: WorkflowBottleneck];
    ': any;
    'bottleneck:resolved': [bottleneckId: string];
    ': any;
    'optimization:triggered': [strategy: string];
    ': any;
    'health:critical': [health: number];
    ': any;
    'metrics:updated': [metrics: FlowMetrics];
    ': any;
    error: [error: Error, context: string];
}
/**
 * Professional Workflow Kanban Coordination Engine
 *
 * Provides domain-specific API for workflow coordination with XState-powered
 * state management, intelligent WIP optimization, and real-time bottleneck detection.
 *
 * **Key Features:**
 * - Battle-tested XState foundation for reliable state management
 * - Domain-specific API hiding XState complexity
 * - Real-time flow metrics and performance tracking
 * - Intelligent WIP limit optimization
 * - Automated bottleneck detection and resolution
 * - Event-driven coordination with external systems
 * - Professional error handling and logging
 *
 * @example Basic Usage
 * ```typescript`
 * const kanban = new WorkflowKanban({
 *   enableIntelligentWIP: true,
 *   enableBottleneckDetection: true,
 *   enableFlowOptimization: true
 * });
 *
 * await kanban.initialize();
 *
 * // Create and manage tasks
 * const task = await kanban.createTask({
 *   title: 'Implement feature X',
 *   priority: 'high',
 *   estimatedEffort: 8
 * });
 *
 * // Move through workflow
 * await kanban.moveTask(task.id, 'development');'
 *
 * // Monitor flow health
 * const metrics = await kanban.getFlowMetrics();
 * const bottlenecks = await kanban.detectBottlenecks();
 * ````
 */
export declare class WorkflowKanban extends TypedEventBase<WorkflowKanbanEvents> {
    private readonly logger;
    private readonly config;
    private workflowMachine;
    private machine;
    private initialized;
    private readonly taskIndex;
    constructor(_config?: Partial<WorkflowKanbanConfig>, eventBus?: TypeSafeEventBus);
    /**
     * Initialize the workflow kanban system
     *
     * Sets up XState machine, starts monitoring services, and prepares
     * the system for workflow coordination.
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the workflow kanban system
     */
    shutdown(): Promise<void>;
    /**
     * Create a new workflow task with Zod validation
     */
    createTask(taskData: {
        title: string;
        description?: string;
        priority: 'critical|high|medium|low;;
        estimatedEffort: number;
        assignedAgent?: string;
        dependencies?: string[];
        tags?: string[];
    }): Promise<KanbanOperationResult<WorkflowTask>>;
}
export {};
//# sourceMappingURL=workflow-kanban.d.ts.map