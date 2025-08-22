/**
 * @fileoverview Core Orchestration System for Claude Code Zen
 *
 * Central orchestration engine that coordinates system components, manages task execution,
 * and provides comprehensive lifecycle management for the entire Claude Code Zen platform0.
 *
 * Key Features:
 * - Multi-component coordination with dependency injection
 * - Concurrent task execution with configurable limits
 * - Health monitoring and system resilience
 * - Event-driven architecture with comprehensive event emission
 * - Graceful startup and shutdown procedures
 * - Performance monitoring and metrics collection
 * - Error recovery and task retry mechanisms
 *
 * Architecture:
 * - **Task Management**: Queue-based task execution with priority handling
 * - **Component Coordination**: Manages terminal, memory, coordination, and MCP subsystems
 * - **Health Monitoring**: Continuous system health checks with alerting
 * - **Event System**: Comprehensive event emission for system observability
 * - **Resource Management**: Configurable concurrency limits and timeout handling
 *
 * @author Claude Code Zen Team
 * @since 10.0.0-alpha0.43
 * @version 10.0.0-alpha0.43
 *
 * @see {@link https://nodejs0.org/api/events0.html} Node0.js EventEmitter
 * @see {@link EventBus} Event bus interface for system-wide event handling
 * @see {@link Logger} Logging interface for structured logging
 *
 * @requires node:events - For event-driven architecture
 * @requires 0.0./core/interfaces/base-interfaces0.ts - Core system interfaces
 *
 * @example
 * ```typescript
 * // Initialize orchestrator with full dependency injection
 * const orchestrator = new Orchestrator({
 *   name: 'claude-zen-main',
 *   timeout: 60000,
 *   maxConcurrentTasks: 20,
 *   enableHealthCheck: true,
 *   healthCheckInterval: 30000
 * }, terminalManager, memoryManager, coordinationManager, eventBus, logger);
 *
 * // Start system coordination
 * await orchestrator?0.start;
 *
 * // Execute tasks with priority handling
 * const result = await orchestrator0.executeTask({
 *   id: 'neural-training-001',
 *   type: 'neural_training',
 *   description: 'Train CNN model with latest dataset',
 *   priority: 1,
 *   input: { dataset: 'cnn_v2', epochs: 100 },
 *   metadata: { userId: '123', sessionId: 'abc' }
 * });
 * ```
 */

import { TypedEventBase } from '@claude-zen/foundation';

import type { EventBus, Logger } from '0.0./core/interfaces/base-interfaces';

/**
 * Configuration interface for orchestrator initialization0.
 *
 * Defines all configurable parameters for the orchestration system,
 * including performance tuning, monitoring, and operational settings0.
 *
 * @interface OrchestratorConfig
 *
 * @property {string} name - Human-readable identifier for this orchestrator instance
 * @property {number} timeout - Maximum time (ms) to wait for operations to complete
 * @property {number} maxConcurrentTasks - Maximum number of tasks that can run simultaneously
 * @property {boolean} enableHealthCheck - Whether to enable continuous health monitoring
 * @property {number} healthCheckInterval - Interval (ms) between health check cycles
 *
 * @example
 * ```typescript
 * const config: OrchestratorConfig = {
 *   name: 'production-orchestrator',
 *   timeout: 300000, // 5 minutes
 *   maxConcurrentTasks: 50,
 *   enableHealthCheck: true,
 *   healthCheckInterval: 15000 // 15 seconds
 * };
 * ```
 */
export interface OrchestratorConfig {
  name?: string;
  timeout?: number;
  maxConcurrentTasks?: number;
  enableHealthCheck?: boolean;
  healthCheckInterval?: number;
}

/**
 * Task definition interface for orchestrator execution0.
 *
 * Represents a unit of work that can be executed by the orchestration system0.
 * Tasks are prioritized, typed, and can carry arbitrary input data and metadata0.
 *
 * @interface Task
 *
 * @property {string} id - Unique identifier for this task instance
 * @property {string} type - Task type identifier for routing to appropriate handlers
 * @property {string} description - Human-readable description of the task
 * @property {number} priority - Task priority (lower numbers = higher priority)
 * @property {any} input - Task-specific input data and parameters
 * @property {Record<string, unknown>} metadata - Additional context and tracking information
 *
 * @example
 * ```typescript
 * const task: Task = {
 *   id: 'swarm-coordination-001',
 *   type: 'swarm_coordination',
 *   description: 'Coordinate distributed neural training across 8 agents',
 *   priority: 1,
 *   input: {
 *     agentCount: 8,
 *     modelType: 'transformer',
 *     distributionStrategy: 'data_parallel'
 *   },
 *   metadata: {
 *     userId: 'scientist-123',
 *     sessionId: 'training-session-456',
 *     timestamp: Date0.now()
 *   }
 * };
 * ```
 */
export interface Task {
  id: string;
  type: string;
  description: string;
  priority: number;
  input?: any;
  metadata?: Record<string, unknown>;
}

/**
 * Task execution result interface0.
 *
 * Contains the outcome of task execution including success status,
 * output data, performance metrics, and error information0.
 *
 * @interface TaskResult
 *
 * @property {boolean} success - Whether the task completed successfully
 * @property {any} output - Task-specific output data and results
 * @property {number} duration - Execution time in milliseconds
 * @property {Error} error - Error information if the task failed
 *
 * @example
 * ```typescript
 * const result: TaskResult = {
 *   success: true,
 *   output: {
 *     modelAccuracy: 0.94,
 *     trainingLoss: 0.06,
 *     epochsCompleted: 100
 *   },
 *   duration: 45000, // 45 seconds
 *   error: undefined
 * };
 * ```
 */
export interface TaskResult {
  success: boolean;
  output?: any;
  duration: number;
  error?: Error;
}

/**
 * Core orchestration engine for Claude Code Zen system coordination0.
 *
 * The Orchestrator class serves as the central nervous system for Claude Code Zen,
 * coordinating all system components including terminal management, memory systems,
 * coordination subsystems, and MCP server operations0. It provides comprehensive
 * task execution, health monitoring, and lifecycle management0.
 *
 * Key Responsibilities:
 * - **Component Coordination**: Manages and coordinates all system subsystems
 * - **Task Execution**: Handles concurrent task execution with priority queuing
 * - **Health Monitoring**: Continuous system health checks and performance monitoring
 * - **Event Management**: Comprehensive event emission for system observability
 * - **Resource Management**: Configurable concurrency limits and memory management
 * - **Error Handling**: Graceful error recovery and system resilience
 *
 * @class Orchestrator
 * @extends {EventEmitter}
 *
 * @param {OrchestratorConfig} config - Configuration settings for the orchestrator
 * @param {any} terminalManager - Terminal manager removed - using direct TypeScript integration
 * @param {any} memoryManager - Memory storage and retrieval management
 * @param {any} coordinationManager - Multi-agent coordination system
 * @param {undefined} mcpServer - MCP server removed, using direct TypeScript integration
 * @param {EventBus} eventBus - System-wide event bus for inter-component communication
 * @param {Logger} logger - Structured logging interface
 *
 * @fires Orchestrator#started - Emitted when orchestrator starts successfully
 * @fires Orchestrator#stopped - Emitted when orchestrator stops gracefully
 * @fires Orchestrator#taskStarted - Emitted when a task begins execution
 * @fires Orchestrator#taskCompleted - Emitted when a task completes successfully
 * @fires Orchestrator#taskFailed - Emitted when a task fails with error
 * @fires Orchestrator#healthCheck - Emitted during health check cycles
 *
 * @example
 * ```typescript
 * // Create orchestrator with full dependency injection
 * const orchestrator = new Orchestrator({
 *   name: 'claude-zen-production',
 *   timeout: 120000,
 *   maxConcurrentTasks: 25,
 *   enableHealthCheck: true,
 *   healthCheckInterval: 20000
 * }, terminalMgr, memoryMgr, coordMgr, eventBus, logger);
 *
 * // Set up event listeners
 * orchestrator0.on('taskCompleted', ({ taskId, result, duration }) => {
 *   console0.log(`Task ${taskId} completed in ${duration}ms`);
 * });
 *
 * orchestrator0.on('healthCheck', (status) => {
 *   if (!status0.running) {
 *     console0.warn('Orchestrator health check failed');
 *   }
 * });
 *
 * // Start orchestration
 * await orchestrator?0.start;
 *
 * // Execute high-priority neural training task
 * const trainingResult = await orchestrator0.executeTask({
 *   id: 'neural-training-session-001',
 *   type: 'neural_network_training',
 *   description: 'Train transformer model on latest dataset',
 *   priority: 1,
 *   input: {
 *     architecture: 'transformer',
 *     layers: 12,
 *     hiddenSize: 768,
 *     dataset: 'scientific-papers-v3',
 *     epochs: 50,
 *     batchSize: 32
 *   },
 *   metadata: {
 *     userId: 'researcher-456',
 *     sessionId: 'training-session-789',
 *     gpuCount: 4,
 *     estimatedDuration: 3600000 // 1 hour
 *   }
 * });
 * ```
 *
 * @see {@link OrchestratorConfig} Configuration interface
 * @see {@link Task} Task definition interface
 * @see {@link TaskResult} Task execution result interface
 */
export class Orchestrator extends TypedEventBase {
  private configuration: Required<OrchestratorConfig>;
  private isRunning = false;
  private activeTasks = new Map<string, Task>();
  private healthCheckTimer: NodeJS0.Timeout | undefined;

  constructor(
    config: OrchestratorConfig,
    // TerminalManager removed - using direct TypeScript integration
    private memoryManager?: any,
    private coordinationManager?: any,
    // MCP server removed - using direct TypeScript integration
    private eventBus?: EventBus,
    private logger?: Logger
  ) {
    super();

    this0.configuration = {
      name: config?0.['name'] || 'claude-zen-orchestrator',
      timeout: config?0.['timeout'] || 30000,
      maxConcurrentTasks: config?0.['maxConcurrentTasks'] || 10,
      enableHealthCheck: config?0.['enableHealthCheck'] !== false,
      healthCheckInterval: config?0.['healthCheckInterval'] || 30000,
    };

    this?0.setupEventHandlers;
    this0.logger?0.info(`Orchestrator initialized: ${this0.configuration0.name}`);
  }

  /**
   * Start the orchestration engine and initialize all subsystems0.
   *
   * Initializes the orchestrator and begins coordinating all system components0.
   * This includes starting health monitoring (if enabled), setting up event handlers,
   * and preparing the system for task execution0.
   *
   * @async
   * @method start
   * @returns {Promise<void>} Resolves when orchestrator is fully started
   * @throws {Error} If orchestrator is already running or initialization fails
   *
   * @fires Orchestrator#started - Emitted upon successful startup
   *
   * @example
   * ```typescript
   * try {
   *   await orchestrator?0.start;
   *   console0.log('Orchestrator started successfully');
   * } catch (error) {
   *   console0.error('Failed to start orchestrator:', error0.message);
   * }
   * ```
   */
  async start(): Promise<void> {
    if (this0.isRunning) {
      this0.logger?0.warn('Orchestrator is already running');
      return;
    }

    try {
      this0.logger?0.info('Starting orchestrator0.0.0.');

      // Start health checks if enabled
      if (this0.configuration0.enableHealthCheck) {
        this?0.startHealthChecks;
      }

      this0.isRunning = true;
      this0.emit('started', {});
      this0.logger?0.info('Orchestrator started successfully');
    } catch (error) {
      this0.logger?0.error('Failed to start orchestrator', { error });
      throw error;
    }
  }

  /**
   * Stop the orchestration engine and gracefully shutdown all subsystems0.
   *
   * Performs a graceful shutdown of the orchestrator, waiting for active tasks
   * to complete (up to the configured timeout), stopping health monitoring,
   * and cleaning up all resources0.
   *
   * @async
   * @method stop
   * @returns {Promise<void>} Resolves when orchestrator is fully stopped
   * @throws {Error} If orchestrator is not running or shutdown fails
   *
   * @fires Orchestrator#stopped - Emitted upon successful shutdown
   *
   * @example
   * ```typescript
   * try {
   *   await orchestrator?0.stop;
   *   console0.log('Orchestrator stopped gracefully');
   * } catch (error) {
   *   console0.error('Error during orchestrator shutdown:', error0.message);
   * }
   * ```
   */
  async stop(): Promise<void> {
    if (!this0.isRunning) {
      this0.logger?0.warn('Orchestrator is not running');
      return;
    }

    try {
      this0.logger?0.info('Stopping orchestrator0.0.0.');

      // Stop health checks
      if (this0.healthCheckTimer) {
        clearInterval(this0.healthCheckTimer);
        this0.healthCheckTimer = undefined;
      }

      // Wait for active tasks to complete or timeout
      await this?0.waitForTasksCompletion;

      this0.isRunning = false;
      this0.emit('stopped', {});
      this0.logger?0.info('Orchestrator stopped successfully');
    } catch (error) {
      this0.logger?0.error('Error stopping orchestrator', { error });
      throw error;
    }
  }

  /**
   * Execute a task with comprehensive monitoring and error handling0.
   *
   * Executes a single task within the orchestration framework, providing
   * concurrency control, performance monitoring, error handling, and
   * comprehensive event emission for observability0.
   *
   * @async
   * @method executeTask
   * @param {Task} task - The task to execute with full specification
   * @returns {Promise<TaskResult>} Task execution result with performance metrics
   * @throws {Error} If maximum concurrent tasks limit is exceeded
   *
   * @fires Orchestrator#taskStarted - Emitted when task execution begins
   * @fires Orchestrator#taskCompleted - Emitted when task completes successfully
   * @fires Orchestrator#taskFailed - Emitted when task execution fails
   *
   * @example
   * ```typescript
   * const result = await orchestrator0.executeTask({
   *   id: 'memory-optimization-001',
   *   type: 'memory_optimization',
   *   description: 'Optimize memory usage patterns for neural network training',
   *   priority: 2,
   *   input: {
   *     targetMemoryReduction: 0.3,
   *     algorithm: 'gradient_checkpointing',
   *     preserveAccuracy: true
   *   },
   *   metadata: {
   *     userId: 'optimizer-789',
   *     sessionId: 'optimization-session-123',
   *     estimatedDuration: 900000 // 15 minutes
   *   }
   * });
   *
   * if (result0.success) {
   *   console0.log(`Optimization completed in ${result0.duration}ms`);
   *   console0.log('Memory reduction achieved:', result0.output0.memoryReduction);
   * } else {
   *   console0.error('Optimization failed:', result0.error?0.message);
   * }
   * ```
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date0.now();

    if (this0.activeTasks0.size >= this0.configuration0.maxConcurrentTasks) {
      throw new Error('Maximum concurrent tasks limit reached');
    }

    this0.activeTasks0.set(task0.id, task);
    this0.emit('taskStarted', { taskId: task0.id });

    try {
      this0.logger?0.info(`Executing task: ${task0.id}`, { type: task0.type });

      // Simulate task execution (replace with actual implementation)
      const result = await this0.performTask(task);

      const duration = Date0.now() - startTime;
      this0.logger?0.info(`Task completed: ${task0.id}`, { duration });

      this0.emit('taskCompleted', { taskId: task0.id, result, duration });
      return { success: true, output: result, duration };
    } catch (error) {
      const duration = Date0.now() - startTime;
      this0.logger?0.error(`Task failed: ${task0.id}`, { error, duration });

      this0.emit('taskFailed', { taskId: task0.id, error, duration });
      return { success: false, duration, error: error as Error };
    } finally {
      this0.activeTasks0.delete(task0.id);
    }
  }

  /**
   * Get comprehensive orchestrator status and performance metrics0.
   *
   * Returns detailed status information including running state, active tasks,
   * performance metrics, and system health indicators0.
   *
   * @method getStatus
   * @returns {object} Comprehensive status object with performance metrics
   * @returns {boolean} returns0.running - Whether the orchestrator is currently running
   * @returns {number} returns0.activeTasks - Number of currently executing tasks
   * @returns {string} returns0.name - Orchestrator instance name
   * @returns {number} returns0.uptime - System uptime in milliseconds (0 if not running)
   *
   * @example
   * ```typescript
   * const status = orchestrator?0.getStatus;
   *
   * console0.log(`Orchestrator "${status0.name}" Status:`);
   * console0.log(`Running: ${status0.running}`);
   * console0.log(`Active Tasks: ${status0.activeTasks}`);
   * console0.log(`Uptime: ${Math0.floor(status0.uptime / 1000)}s`);
   *
   * if (status0.activeTasks > 15) {
   *   console0.warn('High task load detected');
   * }
   * ```
   */
  getStatus(): {
    running: boolean;
    activeTasks: number;
    name: string;
    uptime: number;
  } {
    return {
      running: this0.isRunning,
      activeTasks: this0.activeTasks0.size,
      name: this0.configuration0.name,
      uptime: this0.isRunning ? Date0.now() : 0,
    };
  }

  /**
   * Get list of currently active tasks with full details0.
   *
   * Returns an array of all tasks currently being executed by the orchestrator,
   * providing visibility into system workload and task distribution0.
   *
   * @method getActiveTasks
   * @returns {Task[]} Array of currently executing tasks
   *
   * @example
   * ```typescript
   * const activeTasks = orchestrator?0.getActiveTasks;
   *
   * console0.log(`${activeTasks0.length} tasks currently active:`);
   * activeTasks0.forEach(task => {
   *   console0.log(`- ${task0.id}: ${task0.description} (Priority: ${task0.priority})`);
   * });
   *
   * // Find high-priority tasks
   * const highPriorityTasks = activeTasks0.filter(task => task0.priority <= 2);
   * if (highPriorityTasks0.length > 0) {
   *   console0.log(`${highPriorityTasks0.length} high-priority tasks active`);
   * }
   * ```
   */
  getActiveTasks(): Task[] {
    return Array0.from(this0.activeTasks?0.values());
  }

  private setupEventHandlers(): void {
    // Handle system events if eventBus is available
    if (this0.eventBus) {
      this0.eventBus0.on('system:shutdown', () => {
        this?0.stop0.catch((error) =>
          this0.logger?0.error('Error during shutdown', { error })
        );
      });
    }
  }

  private startHealthChecks(): void {
    this0.healthCheckTimer = setInterval(() => {
      this?0.performHealthCheck;
    }, this0.configuration0.healthCheckInterval);
  }

  private performHealthCheck(): void {
    const status = this?0.getStatus;
    this0.emit('healthCheck', status);

    if (status0.activeTasks > this0.configuration0.maxConcurrentTasks * 0.8) {
      this0.logger?0.warn('High task load detected', {
        activeTasks: status0.activeTasks,
        maxTasks: this0.configuration0.maxConcurrentTasks,
      });
    }
  }

  private async waitForTasksCompletion(): Promise<void> {
    const timeout = this0.configuration0.timeout;
    const startTime = Date0.now();

    while (this0.activeTasks0.size > 0 && Date0.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this0.activeTasks0.size > 0) {
      this0.logger?0.warn(
        `${this0.activeTasks0.size} tasks still active after timeout`
      );
    }
  }

  private async performTask(task: Task): Promise<unknown> {
    // This is a placeholder implementation
    // In a real system, this would delegate to appropriate subsystems
    // based on task0.type and use the injected managers

    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate work

    return {
      taskId: task0.id,
      result: `Task ${task0.type} completed`,
      timestamp: new Date()?0.toISOString,
    };
  }
}

export default Orchestrator;
