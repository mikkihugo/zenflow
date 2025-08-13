/**
 * @fileoverview Workflow Event Manager Factory Implementation
 *
 * Factory for creating workflow event managers that handle workflow execution,
 * orchestration, task management, and process lifecycle events. Provides
 * specialized event management for workflow automation and orchestration.
 *
 * ## Features
 *
 * - **Workflow Events**: Execution, completion, failure, retry events
 * - **Task Events**: Task creation, assignment, execution, completion
 * - **Process Events**: Process lifecycle, state transitions, dependencies
 * - **Orchestration Events**: Coordination, scheduling, resource allocation
 * - **Performance Monitoring**: Execution times, success rates, bottlenecks
 *
 * ## Event Types Handled
 *
 * - `workflow:execution` - Workflow execution and lifecycle events
 * - `workflow:task` - Individual task management and execution events
 * - `workflow:orchestration` - Process coordination and scheduling events
 * - `workflow:performance` - Performance metrics and monitoring events
 * - `workflow:dependency` - Dependency resolution and management events
 *
 * @example
 * ```typescript
 * const factory = new WorkflowEventManagerFactory(logger, config);
 * const manager = await factory.create({
 *   name: 'main-workflow',
 *   type: 'workflow',
 *   maxListeners: 250,
 *   processing: {
 *     strategy: 'reliable',
 *     batchSize: 25
 *   }
 * });
 *
 * // Subscribe to execution events
 * manager.subscribeExecutionEvents((event) => {
 *   console.log(`Workflow ${event.workflowId}: ${event.operation} (${event.data.status})`);
 * });
 *
 * // Emit workflow event
 * await manager.emitWorkflowEvent({
 *   id: 'workflow-001',
 *   timestamp: new Date(),
 *   source: 'orchestrator',
 *   type: 'workflow:execution',
 *   operation: 'start',
 *   workflowId: 'user-onboarding-v2',
 *   data: {
 *     status: 'running',
 *     totalTasks: 5,
 *     completedTasks: 0,
 *     estimatedDuration: 300000
 *   }
 * });
 * ```
 *
 * @author Claude Code Zen Team
 * @version 1.0.0-alpha.43
 * @since 1.0.0
 */

import type {
  IConfig,
  ILogger,
} from '../../../core/interfaces/base-interfaces.ts';
import { BaseEventManager } from '../core/base-event-manager.ts';
import type {
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  IEventManager,
  IEventManagerFactory,
} from '../core/interfaces.ts';
import type { IWorkflowEventManager } from '../event-manager-types.ts';
import type { WorkflowEvent } from '../types.ts';

/**
 * Workflow Event Manager implementation for workflow orchestration.
 *
 * Specialized event manager for handling workflow-related events including
 * execution, task management, orchestration, and performance monitoring.
 * Optimized for reliable workflow processing with comprehensive tracking.
 *
 * ## Operation Types
 *
 * - **Execution Operations**: Start, pause, resume, complete, fail, retry
 * - **Task Operations**: Create, assign, execute, complete, fail, timeout
 * - **Orchestration Operations**: Schedule, coordinate, balance, optimize
 * - **Dependency Operations**: Resolve, wait, block, satisfy, timeout
 *
 * ## Performance Features
 *
 * - **Reliable Processing**: Guaranteed delivery with retry mechanisms
 * - **Workflow Tracking**: Comprehensive execution state management
 * - **Performance Analytics**: Execution times, success rates, bottlenecks
 * - **Dependency Management**: Complex workflow dependency resolution
 */
class WorkflowEventManager
  extends BaseEventManager
  implements IWorkflowEventManager
{
  private workflowMetrics = {
    totalWorkflows: 0,
    activeWorkflows: 0,
    completedWorkflows: 0,
    failedWorkflows: 0,
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    retryCount: 0,
    totalExecutionTime: 0,
    longestWorkflow: 0,
    averageExecutionTime: 0,
    dependencyResolutions: 0,
    orchestrationEvents: 0,
    performanceStats: {
      successRate: 0,
      averageTaskTime: 0,
      bottleneckTasks: new Set<string>(),
      lastCalculated: new Date(),
    },
  };

  private subscriptions = {
    execution: new Map<string, (event: WorkflowEvent) => void>(),
    task: new Map<string, (event: WorkflowEvent) => void>(),
    orchestration: new Map<string, (event: WorkflowEvent) => void>(),
    performance: new Map<string, (event: WorkflowEvent) => void>(),
    dependency: new Map<string, (event: WorkflowEvent) => void>(),
  };

  private activeWorkflows = new Map<
    string,
    {
      id: string;
      status: string;
      startTime: number;
      totalTasks: number;
      completedTasks: number;
      failedTasks: number;
    }
  >();

  constructor(config: EventManagerConfig, logger: ILogger) {
    super(config, logger);
    this.initializeWorkflowHandlers();
  }

  /**
   * Emit workflow-specific event with workflow context.
   */
  async emitWorkflowEvent(event: WorkflowEvent): Promise<void> {
    try {
      // Update workflow metrics
      this.updateWorkflowMetrics(event);

      // Add workflow-specific metadata
      const enrichedEvent = {
        ...event,
        metadata: {
          ...event.metadata,
          timestamp: new Date(),
          processingTime: Date.now(),
          workflowId: event.workflowId,
          taskId: event.taskId,
          orchestrationId: event.data?.orchestrationId,
        },
      };

      // Emit through base manager
      await this.emit(enrichedEvent);

      // Route to specific workflow handlers
      await this.routeWorkflowEvent(enrichedEvent);

      this.logger.debug(
        `Workflow event emitted: ${event.operation} for ${event.workflowId}`
      );
    } catch (error) {
      this.workflowMetrics.failedWorkflows++;
      this.logger.error('Failed to emit workflow event:', error);
      throw error;
    }
  }

  /**
   * Subscribe to execution events.
   */
  subscribeExecutionEvents(listener: (event: WorkflowEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.execution.set(subscriptionId, listener);

    this.logger.debug(
      `Execution event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to task events.
   */
  subscribeTaskEvents(listener: (event: WorkflowEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.task.set(subscriptionId, listener);

    this.logger.debug(`Task event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to orchestration events.
   */
  subscribeOrchestrationEvents(
    listener: (event: WorkflowEvent) => void
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.orchestration.set(subscriptionId, listener);

    this.logger.debug(
      `Orchestration event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to performance events.
   */
  subscribePerformanceEvents(listener: (event: WorkflowEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.performance.set(subscriptionId, listener);

    this.logger.debug(
      `Performance event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to dependency events.
   */
  subscribeDependencyEvents(listener: (event: WorkflowEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.dependency.set(subscriptionId, listener);

    this.logger.debug(
      `Dependency event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Get workflow-specific metrics and performance data.
   */
  async getWorkflowMetrics(): Promise<{
    activeWorkflows: number;
    completedTasks: number;
    failureRate: number;
    performance: {
      successRate: number;
      averageExecutionTime: number;
      averageTaskTime: number;
      longestWorkflow: number;
    };
    execution: {
      totalWorkflows: number;
      completedWorkflows: number;
      failedWorkflows: number;
      retryCount: number;
    };
    tasks: {
      total: number;
      completed: number;
      failed: number;
      bottlenecks: string[];
    };
    orchestration: {
      events: number;
      dependencyResolutions: number;
    };
  }> {
    const totalWorkflows = this.workflowMetrics.totalWorkflows;
    const failureRate =
      totalWorkflows > 0
        ? this.workflowMetrics.failedWorkflows / totalWorkflows
        : 0;

    const taskFailureRate =
      this.workflowMetrics.totalTasks > 0
        ? this.workflowMetrics.failedTasks / this.workflowMetrics.totalTasks
        : 0;

    // Update performance stats
    this.updatePerformanceStats();

    return {
      activeWorkflows: this.workflowMetrics.activeWorkflows,
      completedTasks: this.workflowMetrics.completedTasks,
      failureRate,
      performance: {
        successRate: this.workflowMetrics.performanceStats.successRate,
        averageExecutionTime: this.workflowMetrics.averageExecutionTime,
        averageTaskTime: this.workflowMetrics.performanceStats.averageTaskTime,
        longestWorkflow: this.workflowMetrics.longestWorkflow,
      },
      execution: {
        totalWorkflows: this.workflowMetrics.totalWorkflows,
        completedWorkflows: this.workflowMetrics.completedWorkflows,
        failedWorkflows: this.workflowMetrics.failedWorkflows,
        retryCount: this.workflowMetrics.retryCount,
      },
      tasks: {
        total: this.workflowMetrics.totalTasks,
        completed: this.workflowMetrics.completedTasks,
        failed: this.workflowMetrics.failedTasks,
        bottlenecks: Array.from(
          this.workflowMetrics.performanceStats.bottleneckTasks
        ),
      },
      orchestration: {
        events: this.workflowMetrics.orchestrationEvents,
        dependencyResolutions: this.workflowMetrics.dependencyResolutions,
      },
    };
  }

  /**
   * Get comprehensive event manager metrics.
   */
  async getMetrics(): Promise<EventManagerMetrics> {
    const baseMetrics = await super.getMetrics();
    const workflowMetrics = await this.getWorkflowMetrics();

    return {
      ...baseMetrics,
      customMetrics: {
        workflow: workflowMetrics,
      },
    };
  }

  /**
   * Health check with workflow-specific validation.
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const baseStatus = await super.healthCheck();
    const workflowMetrics = await this.getWorkflowMetrics();

    // Workflow-specific health checks
    const highFailureRate = workflowMetrics.failureRate > 0.2; // 20% failure rate
    const manyActiveWorkflows = workflowMetrics.activeWorkflows > 100; // 100 active workflows
    const lowSuccessRate = workflowMetrics.performance.successRate < 0.8; // 80% success rate
    const slowExecution =
      workflowMetrics.performance.averageExecutionTime > 60000; // 1 minute

    const isHealthy =
      baseStatus.status === 'healthy' &&
      !highFailureRate &&
      !manyActiveWorkflows &&
      !lowSuccessRate &&
      !slowExecution;

    return {
      ...baseStatus,
      status: isHealthy ? 'healthy' : 'degraded',
      metadata: {
        ...baseStatus.metadata,
        workflow: {
          activeWorkflows: workflowMetrics.activeWorkflows,
          failureRate: workflowMetrics.failureRate,
          successRate: workflowMetrics.performance.successRate,
          averageExecutionTime:
            workflowMetrics.performance.averageExecutionTime,
        },
      },
    };
  }

  /**
   * Private helper methods.
   */

  private initializeWorkflowHandlers(): void {
    this.logger.debug('Initializing workflow event handlers');

    // Set up event type routing
    this.subscribe(
      [
        'workflow:execution',
        'workflow:task',
        'workflow:orchestration',
        'workflow:performance',
        'workflow:dependency',
      ],
      this.handleWorkflowEvent.bind(this)
    );
  }

  private async handleWorkflowEvent(event: WorkflowEvent): Promise<void> {
    try {
      // Route based on operation type
      const operationType = event.type.split(':')[1];

      switch (operationType) {
        case 'execution':
          await this.notifySubscribers(this.subscriptions.execution, event);
          break;
        case 'task':
          await this.notifySubscribers(this.subscriptions.task, event);
          break;
        case 'orchestration':
          await this.notifySubscribers(this.subscriptions.orchestration, event);
          break;
        case 'performance':
          await this.notifySubscribers(this.subscriptions.performance, event);
          break;
        case 'dependency':
          await this.notifySubscribers(this.subscriptions.dependency, event);
          break;
        default:
          this.logger.warn(`Unknown workflow operation type: ${operationType}`);
      }
    } catch (error) {
      this.logger.error('Workflow event handling failed:', error);
      throw error;
    }
  }

  private async routeWorkflowEvent(event: WorkflowEvent): Promise<void> {
    // Track active workflows
    if (event.workflowId) {
      this.updateActiveWorkflows(event);
    }

    // Handle special workflow operations
    switch (event.operation) {
      case 'start':
        this.workflowMetrics.activeWorkflows++;
        this.logger.info(`Workflow started: ${event.workflowId}`);
        if (event.workflowId) {
          this.activeWorkflows.set(event.workflowId, {
            id: event.workflowId,
            status: 'running',
            startTime: Date.now(),
            totalTasks: event.data?.totalTasks || 0,
            completedTasks: 0,
            failedTasks: 0,
          });
        }
        break;
      case 'complete':
        this.workflowMetrics.activeWorkflows = Math.max(
          0,
          this.workflowMetrics.activeWorkflows - 1
        );
        this.workflowMetrics.completedWorkflows++;
        this.logger.info(`Workflow completed: ${event.workflowId}`);
        if (event.workflowId && this.activeWorkflows.has(event.workflowId)) {
          const workflow = this.activeWorkflows.get(event.workflowId)!;
          const duration = Date.now() - workflow.startTime;
          this.workflowMetrics.totalExecutionTime += duration;
          if (duration > this.workflowMetrics.longestWorkflow) {
            this.workflowMetrics.longestWorkflow = duration;
          }
          this.activeWorkflows.delete(event.workflowId);
        }
        break;
      case 'fail':
        this.workflowMetrics.activeWorkflows = Math.max(
          0,
          this.workflowMetrics.activeWorkflows - 1
        );
        this.workflowMetrics.failedWorkflows++;
        this.logger.error(
          `Workflow failed: ${event.workflowId} - ${event.data?.error}`
        );
        if (event.workflowId) {
          this.activeWorkflows.delete(event.workflowId);
        }
        break;
      case 'retry':
        this.workflowMetrics.retryCount++;
        this.logger.warn(
          `Workflow retry: ${event.workflowId} (attempt ${event.data?.attempt})`
        );
        break;
      case 'task-complete':
        this.workflowMetrics.completedTasks++;
        if (event.workflowId && this.activeWorkflows.has(event.workflowId)) {
          this.activeWorkflows.get(event.workflowId)!.completedTasks++;
        }
        break;
      case 'task-fail':
        this.workflowMetrics.failedTasks++;
        if (event.workflowId && this.activeWorkflows.has(event.workflowId)) {
          this.activeWorkflows.get(event.workflowId)!.failedTasks++;
        }
        // Track bottleneck tasks
        if (
          event.taskId &&
          event.data?.duration &&
          event.data.duration > 30000
        ) {
          // 30 second threshold
          this.workflowMetrics.performanceStats.bottleneckTasks.add(
            event.taskId
          );
        }
        break;
      case 'dependency-resolved':
        this.workflowMetrics.dependencyResolutions++;
        this.logger.debug(
          `Dependency resolved: ${event.data?.dependency} for ${event.workflowId}`
        );
        break;
      case 'orchestrate':
        this.workflowMetrics.orchestrationEvents++;
        this.logger.debug(
          `Orchestration event: ${event.data?.action} for ${event.workflowId}`
        );
        break;
    }
  }

  private updateWorkflowMetrics(event: WorkflowEvent): void {
    const operationType = event.type.split(':')[1];

    switch (operationType) {
      case 'execution':
        if (event.operation === 'start') {
          this.workflowMetrics.totalWorkflows++;
        }
        break;
      case 'task':
        if (event.operation === 'create' || event.operation === 'start') {
          this.workflowMetrics.totalTasks++;
        }
        break;
      case 'orchestration':
        this.workflowMetrics.orchestrationEvents++;
        break;
    }
  }

  private updateActiveWorkflows(event: WorkflowEvent): void {
    if (!event.workflowId) return;

    const workflow = this.activeWorkflows.get(event.workflowId);
    if (workflow) {
      switch (event.operation) {
        case 'pause':
          workflow.status = 'paused';
          break;
        case 'resume':
          workflow.status = 'running';
          break;
        case 'task-complete':
          workflow.completedTasks++;
          break;
        case 'task-fail':
          workflow.failedTasks++;
          break;
      }
    }
  }

  private updatePerformanceStats(): void {
    const totalWorkflows = this.workflowMetrics.totalWorkflows;
    const completedWorkflows = this.workflowMetrics.completedWorkflows;

    this.workflowMetrics.performanceStats.successRate =
      totalWorkflows > 0 ? completedWorkflows / totalWorkflows : 0;

    this.workflowMetrics.averageExecutionTime =
      completedWorkflows > 0
        ? this.workflowMetrics.totalExecutionTime / completedWorkflows
        : 0;

    const completedTasks = this.workflowMetrics.completedTasks;
    this.workflowMetrics.performanceStats.averageTaskTime =
      completedTasks > 0
        ? this.workflowMetrics.totalExecutionTime / completedTasks
        : 0;

    this.workflowMetrics.performanceStats.lastCalculated = new Date();
  }

  private async notifySubscribers(
    subscribers: Map<string, (event: WorkflowEvent) => void>,
    event: WorkflowEvent
  ): Promise<void> {
    const notifications = Array.from(subscribers.values()).map(
      async (listener) => {
        try {
          await listener(event);
        } catch (error) {
          this.logger.error('Workflow event listener failed:', error);
        }
      }
    );

    await Promise.allSettled(notifications);
  }

  private generateSubscriptionId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Factory for creating WorkflowEventManager instances.
 *
 * Provides configuration management and instance creation for workflow
 * event managers with optimized settings for workflow orchestration and
 * reliable process execution with comprehensive tracking.
 *
 * ## Configuration Options
 *
 * - **Reliable Processing**: Guaranteed delivery with retry mechanisms
 * - **Workflow Tracking**: Comprehensive execution state management
 * - **Performance Analytics**: Execution times, success rates, bottlenecks
 * - **Dependency Management**: Complex workflow dependency resolution
 *
 * @example
 * ```typescript
 * const factory = new WorkflowEventManagerFactory(logger, config);
 *
 * const orchestrationManager = await factory.create({
 *   name: 'main-orchestration',
 *   type: 'workflow',
 *   maxListeners: 200,
 *   processing: {
 *     strategy: 'reliable',
 *     retries: 3,
 *     timeout: 60000
 *   }
 * });
 * ```
 */
export class WorkflowEventManagerFactory
  implements IEventManagerFactory<EventManagerConfig>
{
  constructor(
    private logger: ILogger,
    private config: IConfig
  ) {
    this.logger.debug('WorkflowEventManagerFactory initialized');
  }

  /**
   * Create a new WorkflowEventManager instance.
   */
  async create(config: EventManagerConfig): Promise<IEventManager> {
    this.logger.info(`Creating workflow event manager: ${config.name}`);

    this.validateConfig(config);
    const optimizedConfig = this.applyWorkflowDefaults(config);
    const manager = new WorkflowEventManager(optimizedConfig, this.logger);
    await this.configureWorkflowManager(manager, optimizedConfig);

    this.logger.info(
      `Workflow event manager created successfully: ${config.name}`
    );
    return manager;
  }

  private validateConfig(config: EventManagerConfig): void {
    if (!config.name) {
      throw new Error('Workflow event manager name is required');
    }

    if (config.type !== 'workflow') {
      throw new Error('Manager type must be "workflow"');
    }

    if (config.processing?.timeout && config.processing.timeout < 5000) {
      this.logger.warn(
        'Workflow processing timeout < 5000ms may be too short for complex workflows'
      );
    }
  }

  private applyWorkflowDefaults(
    config: EventManagerConfig
  ): EventManagerConfig {
    return {
      ...config,
      maxListeners: config.maxListeners || 200,
      processing: {
        strategy: 'reliable', // Workflows need reliable processing
        timeout: 30000, // 30 second timeout for workflow operations
        retries: 3, // Multiple retries for workflow reliability
        batchSize: 25, // Moderate batch size for workflows
        ...config.processing,
      },
      persistence: {
        enabled: true, // Important to track workflow state
        maxAge: 2592000000, // 30 days
        ...config.persistence,
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60000, // 1 minute metrics collection
        healthCheckInterval: 180000, // 3 minute health checks
        ...config.monitoring,
      },
    };
  }

  private async configureWorkflowManager(
    manager: WorkflowEventManager,
    config: EventManagerConfig
  ): Promise<void> {
    if (config.monitoring?.enabled) {
      await manager.start();
      this.logger.debug(
        `Workflow event manager monitoring started: ${config.name}`
      );
    }

    if (config.monitoring?.healthCheckInterval) {
      setInterval(async () => {
        try {
          const status = await manager.healthCheck();
          if (status.status !== 'healthy') {
            this.logger.warn(
              `Workflow manager health degraded: ${config.name}`,
              status.metadata
            );
          }
        } catch (error) {
          this.logger.error(
            `Workflow manager health check failed: ${config.name}`,
            error
          );
        }
      }, config.monitoring.healthCheckInterval);
    }
  }
}

export default WorkflowEventManagerFactory;
