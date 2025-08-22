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
import { type ActorRef, createActor } from 'xstate';

// Standalone logger interface (Google TS standards: explicit return types)
interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

// Logger implementation following Google TS standards
const getLogger = (name: string): Logger => ({
  info: (message: string, ...args: any[]): void => console.log(`[INFO] ${name}:`, message, ...args),
  warn: (message: string, ...args: any[]): void =>
    console.warn(`[WARN] ${name}:`, message, ...args),
  error: (message: string, ...args: any[]): void =>
    console.error(`[ERROR] ${name}:`, message, ...args),
  debug: (message: string, ...args: any[]): void =>
    console.debug(`[DEBUG] ${name}:`, message, ...args),
});

// Event system types (standalone, following Google TS standards)
interface TypeSafeEventBus {
  emit(event: any): Promise<void>;
}

// Using enum per Google TS standards instead of const enum
enum EventPriority {
  NORMAL = 'normal',
}

// Event creation helper with explicit return type
const createEvent = (
  type: string,
  data: any,
  options: any
): { type: string; data: any; [key: string]: any } => ({
  type,
  data,
  ...options,
});

import {
  createDefaultWorkflowConfig,
  createWorkflowMachine,
  type WorkflowMachineContext,
} from '../state-machines/workflow';

import type {
  BottleneckReport,
  FlowMetrics,
  HealthCheckResult,
  KanbanOperationResult,
  TaskMovementResult,
  TaskState,
  TimeRange,
  WIPLimits,
  WorkflowBottleneck,
  WorkflowKanbanConfig,
  WorkflowStatistics,
  WorkflowTask,
} from '../types/index';
import {
  ImmutableMetricsUtils,
  ImmutableTaskUtils,
  ImmutableWIPUtils,
} from '../utilities/immutable-utils';
import { validateTaskCreation, validateWIPLimits } from '../utils/validation';

// =============================================================================
// WORKFLOW KANBAN EVENTS
// =============================================================================

/**
 * Events emitted by WorkflowKanban for external coordination
 */
export interface WorkflowKanbanEvents {
  // Task events
  'task:created': [task: WorkflowTask];
  'task:moved': [taskId: string, fromState: TaskState, toState: TaskState];
  'task:blocked': [taskId: string, reason: string];
  'task:completed': [taskId: string, duration: number];

  // Flow events
  'wip:exceeded': [state: TaskState, count: number, limit: number];
  'bottleneck:detected': [bottleneck: WorkflowBottleneck];
  'bottleneck:resolved': [bottleneckId: string];

  // System events
  'optimization:triggered': [strategy: string];
  'health:critical': [health: number];
  'metrics:updated': [metrics: FlowMetrics];

  // Error events
  error: [error: Error, context: string];
}

// =============================================================================
// MAIN WORKFLOW KANBAN API CLASS
// =============================================================================

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
 * ```typescript
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
 * await kanban.moveTask(task.id, 'development');
 *
 * // Monitor flow health
 * const metrics = await kanban.getFlowMetrics();
 * const bottlenecks = await kanban.detectBottlenecks();
 * ```
 */
export class WorkflowKanban extends TypedEventBase<WorkflowKanbanEvents> {
  private readonly logger: Logger;
  private readonly config: WorkflowKanbanConfig;
  private readonly eventBus?: TypeSafeEventBus;

  private workflowMachine: ActorRef<any, any> | null = null;
  private machine: ReturnType<typeof createWorkflowMachine>;
  private initialized = false;
  private readonly taskIndex = new Map<string, WorkflowTask>();

  // Performance tracking
  private readonly performanceMetrics = {
    operationsPerSecond: 0,
    averageResponseTime: 0,
    lastOperationTime: Date.now(),
  };

  constructor(config: Partial<WorkflowKanbanConfig> = {}, eventBus?: TypeSafeEventBus) {
    super();

    this.logger = getLogger('WorkflowKanban');
    this.config = { ...createDefaultWorkflowConfig(), ...config };
    this.eventBus = eventBus;
    this.machine = createWorkflowMachine(this.config);

    this.logger.info('WorkflowKanban initialized with config:', {
      enableIntelligentWIP: this.config.enableIntelligentWIP,
      enableBottleneckDetection: this.config.enableBottleneckDetection,
      enableFlowOptimization: this.config.enableFlowOptimization,
    });
  }

  // =============================================================================
  // LIFECYCLE MANAGEMENT
  // =============================================================================

  /**
   * Initialize the workflow kanban system
   *
   * Sets up XState machine, starts monitoring services, and prepares
   * the system for workflow coordination.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('WorkflowKanban already initialized');
      return;
    }

    try {
      // Create and start XState actor
      this.workflowMachine = createActor(this.machine);

      // Subscribe to machine state changes
      this.workflowMachine.subscribe((state: any) => {
        this.handleMachineStateChange(state);
      });

      // Start the machine
      this.workflowMachine.start();

      // Initialize monitoring services
      if (this.config.enableRealTimeMonitoring) {
        this.startRealTimeMonitoring();
      }

      this.initialized = true;
      this.logger.info('WorkflowKanban initialized successfully');

      // Emit initialization event
      this.emitCoordinationEvent('workflow:initialized', {
        timestamp: new Date(),
        config: this.config,
      });
    } catch (error) {
      this.logger.error('Failed to initialize WorkflowKanban:', error);
      this.emit('error', error as Error, 'initialization');
      throw error;
    }
  }

  /**
   * Shutdown the workflow kanban system
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      // Stop XState machine
      if (this.workflowMachine) {
        this.workflowMachine.stop();
        this.workflowMachine = null;
      }

      // Clear task index
      this.taskIndex.clear();

      this.initialized = false;
      this.logger.info('WorkflowKanban shutdown complete');
    } catch (error) {
      this.logger.error('Error during WorkflowKanban shutdown:', error);
      throw error;
    }
  }

  // =============================================================================
  // TASK MANAGEMENT API
  // =============================================================================

  /**
   * Create a new workflow task with Zod validation
   */
  async createTask(taskData: {
    title: string;
    description?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedEffort: number;
    assignedAgent?: string;
    dependencies?: string[];
    tags?: string[];
  }): Promise<KanbanOperationResult<WorkflowTask>> {
    this.ensureInitialized();

    const startTime = performance.now();

    try {
      // Validate input with Zod for runtime safety
      const validationResult = validateTaskCreation(taskData);
      if (!validationResult.success) {
        throw new Error(
          `Invalid task data: ${validationResult.error.issues.map((i) => i.message).join(', ')}`
        );
      }

      const validatedData = validationResult.data;

      const task: WorkflowTask = {
        id: this.generateTaskId(),
        title: validatedData.title,
        description: validatedData.description,
        state: 'backlog',
        priority: validatedData.priority,
        assignedAgent: validatedData.assignedAgent,
        estimatedEffort: validatedData.estimatedEffort,
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: validatedData.dependencies,
        tags: validatedData.tags,
        metadata: {},
      };

      // Add to local index
      this.taskIndex.set(task.id, task);

      // Send to XState machine
      this.workflowMachine?.send({
        type: 'TASK_CREATED',
        task,
      });

      // Emit events
      this.emit('task:created', task);
      this.emitCoordinationEvent('task:created', { task });

      this.updatePerformanceMetrics(startTime);
      this.logger.info(`Task created: ${task.id} - ${task.title}`);

      return {
        success: true,
        data: task,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to create task:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Move task to different state with WIP limit checking
   */
  async moveTask(
    taskId: string,
    toState: TaskState,
    reason?: string
  ): Promise<KanbanOperationResult<TaskMovementResult>> {
    this.ensureInitialized();

    const startTime = performance.now();

    try {
      const task = this.taskIndex.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const fromState = task.state;

      // Check WIP limits before moving
      const wipCheck = await this.checkWIPLimits(toState);
      if (!wipCheck.allowed) {
        this.logger.warn(
          `WIP limit exceeded for ${toState}: ${wipCheck.currentCount}/${wipCheck.limit}`
        );

        this.emit('wip:exceeded', toState, wipCheck.currentCount, wipCheck.limit);

        return {
          success: false,
          error: `WIP limit exceeded for ${toState} (${wipCheck.currentCount}/${wipCheck.limit})`,
          timestamp: new Date(),
        };
      }

      // Send move event to XState machine
      this.workflowMachine?.send({
        type: 'TASK_MOVED',
        taskId,
        fromState,
        toState,
      });

      // Update local index using Immer for safe state mutations
      const updatedTask = ImmutableTaskUtils.updateTask([task], taskId, (draft) => {
        draft.state = toState;
        draft.updatedAt = new Date();

        if (toState === 'development' && !draft.startedAt) {
          draft.startedAt = new Date();
        }
        if (toState === 'done') {
          draft.completedAt = new Date();
        }
        if (toState === 'blocked') {
          draft.blockedAt = new Date();
          draft.blockingReason = reason;
        }
      })[0];

      this.taskIndex.set(taskId, updatedTask);

      // Calculate duration if completing
      const duration =
        toState === 'done' && task.startedAt ? Date.now() - task.startedAt.getTime() : undefined;

      // Emit events
      this.emit('task:moved', taskId, fromState, toState);
      if (toState === 'blocked') {
        this.emit('task:blocked', taskId, reason || 'Unknown reason');
      }
      if (toState === 'done' && duration) {
        this.emit('task:completed', taskId, duration);
      }

      const result: TaskMovementResult = {
        success: true,
        taskId,
        fromState,
        toState,
        timestamp: new Date(),
      };

      this.emitCoordinationEvent('task:moved', result);

      this.updatePerformanceMetrics(startTime);
      this.logger.info(`Task moved: ${taskId} from ${fromState} to ${toState}`);

      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to move task:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<WorkflowTask | null> {
    this.ensureInitialized();
    return this.taskIndex.get(taskId) || null;
  }

  /**
   * Get tasks by state
   */
  async getTasksByState(state: TaskState): Promise<WorkflowTask[]> {
    this.ensureInitialized();

    const tasks: WorkflowTask[] = [];
    for (const task of this.taskIndex.values()) {
      if (task.state === state) {
        tasks.push(task);
      }
    }

    return tasks;
  }

  // =============================================================================
  // WIP MANAGEMENT API
  // =============================================================================

  /**
   * Check WIP limits for a state
   */
  async checkWIPLimits(state: TaskState): Promise<{
    allowed: boolean;
    currentCount: number;
    limit: number;
    utilization: number;
  }> {
    this.ensureInitialized();

    const tasksInState = await this.getTasksByState(state);
    const currentCount = tasksInState.length;
    const limit = this.config.defaultWIPLimits[state];
    const utilization = limit > 0 ? currentCount / limit : 0;

    return {
      allowed: currentCount < limit,
      currentCount,
      limit,
      utilization,
    };
  }

  /**
   * Get current WIP limits
   */
  async getWIPLimits(): Promise<WIPLimits> {
    return { ...this.config.defaultWIPLimits };
  }

  /**
   * Update WIP limits (triggers reconfiguration) with Immer for safe mutations
   */
  async updateWIPLimits(newLimits: Partial<WIPLimits>): Promise<void> {
    this.ensureInitialized();

    // Use Immer for safe WIP limits update
    const updatedLimits = ImmutableWIPUtils.updateWIPLimits(
      this.config.defaultWIPLimits,
      newLimits
    );

    // Validate updated limits
    const validation = validateWIPLimits(updatedLimits);
    if (!validation.success) {
      throw new Error(
        `Invalid WIP limits: ${validation.error.issues.map((i) => i.message).join(', ')}`
      );
    }

    // Update configuration
    this.workflowMachine?.send({
      type: 'CONFIGURATION_UPDATED',
      config: {
        defaultWIPLimits: validation.data,
      },
    });

    this.logger.info('WIP limits updated:', validation.data);
    this.emitCoordinationEvent('wip:updated', { limits: validation.data });
  }

  // =============================================================================
  // FLOW ANALYSIS & METRICS API
  // =============================================================================

  /**
   * Get current flow metrics using Immer for safe calculations
   */
  async getFlowMetrics(): Promise<FlowMetrics | null> {
    this.ensureInitialized();

    // Get current tasks and calculate metrics using Immer utilities
    const allTasks = Array.from(this.taskIndex.values());
    const completedTasks = allTasks.filter((t) => t.state === 'done');
    const blockedTasks = allTasks.filter((t) => t.state === 'blocked');

    if (completedTasks.length === 0) return null;

    // Use Immer utilities for safe metrics calculation
    const metrics = ImmutableMetricsUtils.calculateFlowMetrics(
      allTasks,
      completedTasks,
      blockedTasks,
      {
        wipEfficiency: this.calculateWIPEfficiency(),
        predictabilityCalculator: this.calculatePredictability.bind(this),
        qualityCalculator: this.calculateQualityIndex.bind(this),
      }
    );

    this.emit('metrics:updated', metrics);
    return metrics;
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStatistics(timeRange?: TimeRange): Promise<WorkflowStatistics> {
    this.ensureInitialized();

    const allTasks = Array.from(this.taskIndex.values());
    const range = timeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    };

    const tasksInRange = allTasks.filter(
      (t) => t.createdAt >= range.start && t.createdAt <= range.end
    );

    const completedTasks = tasksInRange.filter((t) => t.state === 'done');
    const blockedTasks = tasksInRange.filter((t) => t.state === 'blocked');

    // Calculate averages
    const cycleTimes = completedTasks
      .filter((t) => t.startedAt && t.completedAt)
      .map((t) => ((t.completedAt?.getTime() || 0) - (t.startedAt?.getTime() || 0)) / (1000 * 60 * 60));

    const leadTimes = completedTasks.map(
      (t) => ((t.completedAt?.getTime() || 0) - t.createdAt.getTime()) / (1000 * 60 * 60)
    );

    const averageCycleTime =
      cycleTimes.length > 0 ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0;

    const averageLeadTime =
      leadTimes.length > 0 ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : 0;

    const rangeHours = (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60);
    const throughput = rangeHours > 0 ? (completedTasks.length / rangeHours) * 24 : 0; // tasks per day

    return {
      totalTasks: tasksInRange.length,
      completedTasks: completedTasks.length,
      blockedTasks: blockedTasks.length,
      averageCycleTime,
      averageLeadTime,
      throughput,
      wipEfficiency: this.calculateWIPEfficiency(),
      timeRange: range,
    };
  }

  // =============================================================================
  // BOTTLENECK DETECTION API
  // =============================================================================

  /**
   * Detect current bottlenecks in the workflow
   */
  async detectBottlenecks(): Promise<BottleneckReport> {
    this.ensureInitialized();

    const bottlenecks: WorkflowBottleneck[] = [];
    const timestamp = new Date();

    // Analyze each workflow state for bottlenecks
    const states: TaskState[] = ['analysis', 'development', 'testing', 'review', 'deployment'];

    for (const state of states) {
      const tasks = await this.getTasksByState(state);
      const wipCheck = await this.checkWIPLimits(state);

      // WIP capacity bottleneck
      if (wipCheck.utilization > 0.9) {
        bottlenecks.push({
          id: `wip-${state}-${Date.now()}`,
          state,
          type: 'capacity',
          severity: wipCheck.utilization > 0.95 ? 'critical' : 'high',
          impactScore: wipCheck.utilization,
          detectedAt: timestamp,
          affectedTasks: tasks.map((t) => t.id),
          estimatedDelay: (tasks.length - wipCheck.limit) * 2, // Rough estimate
          recommendedResolution: `Increase WIP limit for ${state} or optimize task flow`,
          metadata: {
            currentCount: wipCheck.currentCount,
            limit: wipCheck.limit,
            utilization: wipCheck.utilization,
          },
        });
      }

      // Long-dwelling tasks (potential skill/process bottlenecks)
      const oldTasks = tasks.filter((t) => {
        const hoursInState = (Date.now() - t.updatedAt.getTime()) / (1000 * 60 * 60);
        return hoursInState > 48; // Tasks stuck for more than 2 days
      });

      if (oldTasks.length > 0) {
        bottlenecks.push({
          id: `dwelling-${state}-${Date.now()}`,
          state,
          type: 'process',
          severity: oldTasks.length > 3 ? 'high' : 'medium',
          impactScore: Math.min(1, oldTasks.length / tasks.length),
          detectedAt: timestamp,
          affectedTasks: oldTasks.map((t) => t.id),
          estimatedDelay: 24 * oldTasks.length,
          recommendedResolution: `Review long-dwelling tasks in ${state} for process improvements`,
          metadata: {
            oldTaskCount: oldTasks.length,
            totalTasks: tasks.length,
            averageAge:
              oldTasks.reduce((acc, t) => acc + (Date.now() - t.updatedAt.getTime()), 0) /
              oldTasks.length /
              (1000 * 60 * 60),
          },
        });
      }
    }

    // Emit bottleneck events
    for (const bottleneck of bottlenecks) {
      this.emit('bottleneck:detected', bottleneck);

      // Send to XState machine
      this.workflowMachine?.send({
        type: 'BOTTLENECK_DETECTED',
        bottleneck,
      });
    }

    const report: BottleneckReport = {
      reportId: `report-${timestamp.getTime()}`,
      generatedAt: timestamp,
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: timestamp,
      },
      bottlenecks,
      systemHealth: this.calculateSystemHealth(bottlenecks),
      recommendations: bottlenecks.map((b) => ({
        bottleneckId: b.id,
        strategy: this.getOptimizationStrategy(b),
        description: b.recommendedResolution,
        estimatedImpact: Math.min(1, b.impactScore * 0.8),
        implementationEffort: b.severity === 'critical' ? 4 : 2,
        priority: b.severity as any,
        prerequisites: [],
      })),
      trends: [], // TODO: Implement trend analysis
    };

    this.logger.info(`Bottleneck detection complete: ${bottlenecks.length} bottlenecks found`);

    return report;
  }

  // =============================================================================
  // SYSTEM HEALTH & MONITORING
  // =============================================================================

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<HealthCheckResult> {
    this.ensureInitialized();

    const bottleneckReport = await this.detectBottlenecks();
    const metrics = await this.getFlowMetrics();

    // Calculate component health
    const wipHealth = this.calculateWIPHealth();
    const bottleneckHealth = 1 - Math.min(1, bottleneckReport.bottlenecks.length * 0.2);
    const flowHealth = metrics ? Math.min(1, metrics.flowEfficiency) : 1;
    const coordinationHealth = this.performanceMetrics.operationsPerSecond > 0 ? 1 : 0.5;

    const overallHealth = (wipHealth + bottleneckHealth + flowHealth + coordinationHealth) / 4;

    // Check for critical health
    if (overallHealth < 0.3) {
      this.emit('health:critical', overallHealth);
    }

    return {
      timestamp: new Date(),
      overallHealth,
      componentHealth: {
        wipManagement: wipHealth,
        bottleneckDetection: bottleneckHealth,
        flowOptimization: flowHealth,
        taskCoordination: coordinationHealth,
      },
      activeIssues: bottleneckReport.bottlenecks,
      recommendations: [
        ...(overallHealth < 0.5
          ? ['System health is degraded - consider immediate optimization']
          : []),
        ...(wipHealth < 0.7 ? ['WIP limits may need adjustment'] : []),
        ...(bottleneckHealth < 0.7 ? ['Active bottlenecks require attention'] : []),
        ...(flowHealth < 0.7 ? ['Flow efficiency is below optimal'] : []),
      ],
    };
  }

  // =============================================================================
  // PRIVATE UTILITY METHODS
  // =============================================================================

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('WorkflowKanban not initialized - call initialize() first');
    }
  }

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private updatePerformanceMetrics(startTime: number): void {
    const duration = performance.now() - startTime;
    const now = Date.now();
    const timeSinceLastOp = now - this.performanceMetrics.lastOperationTime;

    this.performanceMetrics.averageResponseTime =
      (this.performanceMetrics.averageResponseTime + duration) / 2;

    if (timeSinceLastOp > 0) {
      this.performanceMetrics.operationsPerSecond =
        (this.performanceMetrics.operationsPerSecond + 1000 / timeSinceLastOp) / 2;
    }

    this.performanceMetrics.lastOperationTime = now;
  }

  private calculateWIPEfficiency(): number {
    let totalUtilization = 0;
    let stateCount = 0;

    const states: TaskState[] = ['analysis', 'development', 'testing', 'review', 'deployment'];

    for (const state of states) {
      const limit = this.config.defaultWIPLimits[state];
      const tasks = Array.from(this.taskIndex.values()).filter((t) => t.state === state);
      const utilization = limit > 0 ? tasks.length / limit : 0;

      totalUtilization += Math.min(1, utilization);
      stateCount++;
    }

    return stateCount > 0 ? totalUtilization / stateCount : 0;
  }

  private calculatePredictability(cycleTimes: number[]): number {
    if (cycleTimes.length < 3) return 1;

    const mean = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
    const variance =
      cycleTimes.reduce((acc, time) => acc + (time - mean) ** 2, 0) / cycleTimes.length;
    const stdDev = Math.sqrt(variance);

    // Lower coefficient of variation = higher predictability
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
    return Math.max(0, 1 - Math.min(1, coefficientOfVariation));
  }

  private calculateQualityIndex(completedTasks: WorkflowTask[] | any[]): number {
    // Simple quality metric based on tasks not being blocked
    const totalTasks = completedTasks.length;
    const blockedTasks = Array.from(this.taskIndex.values()).filter(
      (t) => t.state === 'blocked'
    ).length;

    return totalTasks > 0 ? Math.max(0, 1 - blockedTasks / (totalTasks + blockedTasks)) : 1;
  }

  private calculateSystemHealth(bottlenecks: WorkflowBottleneck[]): number {
    const criticalCount = bottlenecks.filter((b) => b.severity === 'critical').length;
    const highCount = bottlenecks.filter((b) => b.severity === 'high').length;
    const mediumCount = bottlenecks.filter((b) => b.severity === 'medium').length;

    const healthImpact = criticalCount * 0.3 + highCount * 0.2 + mediumCount * 0.1;
    return Math.max(0, 1 - Math.min(1, healthImpact));
  }

  private calculateWIPHealth(): number {
    let overutilizedStates = 0;
    const states: TaskState[] = ['analysis', 'development', 'testing', 'review', 'deployment'];

    for (const state of states) {
      const limit = this.config.defaultWIPLimits[state];
      const currentCount = Array.from(this.taskIndex.values()).filter(
        (t) => t.state === state
      ).length;

      if (currentCount >= limit) {
        overutilizedStates++;
      }
    }

    return Math.max(0, 1 - overutilizedStates / states.length);
  }

  private getOptimizationStrategy(bottleneck: WorkflowBottleneck): any {
    switch (bottleneck.type) {
      case 'capacity':
        return 'wip_reduction';
      case 'process':
        return 'bottleneck_removal';
      case 'dependency':
        return 'parallel_processing';
      default:
        return 'cycle_time_reduction';
    }
  }

  private handleMachineStateChange(state: any): void {
    // Handle XState machine state changes
    this.logger.debug('Machine state changed:', state.value);

    // Extract relevant data from machine context
    if (state.context) {
      const context = state.context as WorkflowMachineContext;

      // Sync local state with machine state
      if (context.errors.length > 0) {
        const latestError = context.errors[context.errors.length - 1];
        this.logger.error('Machine error:', latestError);
      }
    }
  }

  private startRealTimeMonitoring(): void {
    // Start periodic monitoring services
    setInterval(async () => {
      try {
        const metrics = await this.getFlowMetrics();
        if (metrics) {
          this.emit('metrics:updated', metrics);
        }
      } catch (error) {
        this.logger.error('Real-time monitoring error:', error);
      }
    }, this.config.wipCalculationInterval);
  }

  private emitCoordinationEvent(eventType: string, data: any): void {
    if (this.eventBus) {
      const event = createEvent(eventType, data, {
        priority: EventPriority.NORMAL,
        source: 'workflow-kanban',
        timestamp: Date.now(),
      });

      this.eventBus.emit(event).catch((error) => {
        this.logger.error('Failed to emit coordination event:', error);
      });
    }
  }
}

// =============================================================================
// FACTORY & CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create workflow kanban with default configuration
 */
export const createWorkflowKanban = (
  config?: Partial<WorkflowKanbanConfig>,
  eventBus?: TypeSafeEventBus
): WorkflowKanban => {
  return new WorkflowKanban(config, eventBus);
};

/**
 * Create workflow kanban optimized for high-throughput scenarios
 */
export const createHighThroughputWorkflowKanban = (eventBus?: TypeSafeEventBus): WorkflowKanban => {
  const config: Partial<WorkflowKanbanConfig> = {
    enableIntelligentWIP: true,
    enableBottleneckDetection: true,
    enableFlowOptimization: true,
    enableRealTimeMonitoring: true,
    wipCalculationInterval: 15000, // 15 seconds
    bottleneckDetectionInterval: 30000, // 30 seconds
    optimizationAnalysisInterval: 120000, // 2 minutes
    maxConcurrentTasks: 100,
    defaultWIPLimits: {
      backlog: 200,
      analysis: 10,
      development: 20,
      testing: 15,
      review: 8,
      deployment: 5,
      done: 2000,
      blocked: 15,
      expedite: 5,
      total: 100,
    },
  };

  return new WorkflowKanban(config, eventBus);
};
