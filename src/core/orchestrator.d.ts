/**
 * @fileoverview Core Orchestration System for Claude Code Zen
 *
 * Central orchestration engine that coordinates system components, manages task execution,
 * and provides comprehensive lifecycle management for the entire Claude Code Zen platform.
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
 * @since 1.0.0-alpha.43
 * @version 1.0.0-alpha.43
 *
 * @see {@link https://nodejs.org/api/events.html} Node.js EventEmitter
 * @see {@link EventBus} Event bus interface for system-wide event handling
 * @see {@link Logger} Logging interface for structured logging
 *
 * @requires node:events - For event-driven architecture
 * @requires ../core/interfaces/base-interfaces.ts - Core system interfaces
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
 * await orchestrator.start();
 *
 * // Execute tasks with priority handling
 * const result = await orchestrator.executeTask({
 *   id: 'neural-training-001',
 *   type: 'neural_training',
 *   description: 'Train CNN model with latest dataset',
 *   priority: 1,
 *   input: { dataset: 'cnn_v2', epochs: 100 },
 *   metadata: { userId: '123', sessionId: 'abc' }
 * });
 * ```
 */
import { EventEmitter } from 'node:events';
import type { EventBus, Logger } from '../core/interfaces/base-interfaces';
/**
 * Configuration interface for orchestrator initialization.
 *
 * Defines all configurable parameters for the orchestration system,
 * including performance tuning, monitoring, and operational settings.
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
 * Task definition interface for orchestrator execution.
 *
 * Represents a unit of work that can be executed by the orchestration system.
 * Tasks are prioritized, typed, and can carry arbitrary input data and metadata.
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
 *     timestamp: Date.now()
 *   }
 * };
 * ```
 */
export interface Task {
    id: string;
    type: string;
    description: string;
    priority: number;
    input?: unknown;
    metadata?: Record<string, unknown>;
}
/**
 * Task execution result interface.
 *
 * Contains the outcome of task execution including success status,
 * output data, performance metrics, and error information.
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
    output?: unknown;
    duration: number;
    error?: Error;
}
/**
 * Core orchestration engine for Claude Code Zen system coordination.
 *
 * The Orchestrator class serves as the central nervous system for Claude Code Zen,
 * coordinating all system components including terminal management, memory systems,
 * coordination subsystems, and MCP server operations. It provides comprehensive
 * task execution, health monitoring, and lifecycle management.
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
 * orchestrator.on('taskCompleted', ({ taskId, result, duration }) => {
 *   console.log(`Task ${taskId} completed in ${duration}ms`);
 * });
 *
 * orchestrator.on('healthCheck', (status) => {
 *   if (!status.running) {
 *     console.warn('Orchestrator health check failed');
 *   }
 * });
 *
 * // Start orchestration
 * await orchestrator.start();
 *
 * // Execute high-priority neural training task
 * const trainingResult = await orchestrator.executeTask({
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
export declare class Orchestrator extends EventEmitter {
    private memoryManager?;
    private coordinationManager?;
    private eventBus?;
    private logger?;
    private config;
    private isRunning;
    private activeTasks;
    private healthCheckTimer;
    constructor(config: OrchestratorConfig, memoryManager?: unknown | undefined, coordinationManager?: unknown | undefined, eventBus?: EventBus, logger?: Logger);
    /**
     * Start the orchestration engine and initialize all subsystems.
     *
     * Initializes the orchestrator and begins coordinating all system components.
     * This includes starting health monitoring (if enabled), setting up event handlers,
     * and preparing the system for task execution.
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
     *   await orchestrator.start();
     *   console.log('Orchestrator started successfully');
     * } catch (error) {
     *   console.error('Failed to start orchestrator:', error.message);
     * }
     * ```
     */
    start(): Promise<void>;
    /**
     * Stop the orchestration engine and gracefully shutdown all subsystems.
     *
     * Performs a graceful shutdown of the orchestrator, waiting for active tasks
     * to complete (up to the configured timeout), stopping health monitoring,
     * and cleaning up all resources.
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
     *   await orchestrator.stop();
     *   console.log('Orchestrator stopped gracefully');
     * } catch (error) {
     *   console.error('Error during orchestrator shutdown:', error.message);
     * }
     * ```
     */
    stop(): Promise<void>;
    /**
     * Execute a task with comprehensive monitoring and error handling.
     *
     * Executes a single task within the orchestration framework, providing
     * concurrency control, performance monitoring, error handling, and
     * comprehensive event emission for observability.
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
     * const result = await orchestrator.executeTask({
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
     * if (result.success) {
     *   console.log(`Optimization completed in ${result.duration}ms`);
     *   console.log('Memory reduction achieved:', result.output.memoryReduction);
     * } else {
     *   console.error('Optimization failed:', result.error?.message);
     * }
     * ```
     */
    executeTask(task: Task): Promise<TaskResult>;
    /**
     * Get comprehensive orchestrator status and performance metrics.
     *
     * Returns detailed status information including running state, active tasks,
     * performance metrics, and system health indicators.
     *
     * @method getStatus
     * @returns {object} Comprehensive status object with performance metrics
     * @returns {boolean} returns.running - Whether the orchestrator is currently running
     * @returns {number} returns.activeTasks - Number of currently executing tasks
     * @returns {string} returns.name - Orchestrator instance name
     * @returns {number} returns.uptime - System uptime in milliseconds (0 if not running)
     *
     * @example
     * ```typescript
     * const status = orchestrator.getStatus();
     *
     * console.log(`Orchestrator "${status.name}" Status:`);
     * console.log(`Running: ${status.running}`);
     * console.log(`Active Tasks: ${status.activeTasks}`);
     * console.log(`Uptime: ${Math.floor(status.uptime / 1000)}s`);
     *
     * if (status.activeTasks > 15) {
     *   console.warn('High task load detected');
     * }
     * ```
     */
    getStatus(): {
        running: boolean;
        activeTasks: number;
        name: string;
        uptime: number;
    };
    /**
     * Get list of currently active tasks with full details.
     *
     * Returns an array of all tasks currently being executed by the orchestrator,
     * providing visibility into system workload and task distribution.
     *
     * @method getActiveTasks
     * @returns {Task[]} Array of currently executing tasks
     *
     * @example
     * ```typescript
     * const activeTasks = orchestrator.getActiveTasks();
     *
     * console.log(`${activeTasks.length} tasks currently active:`);
     * activeTasks.forEach(task => {
     *   console.log(`- ${task.id}: ${task.description} (Priority: ${task.priority})`);
     * });
     *
     * // Find high-priority tasks
     * const highPriorityTasks = activeTasks.filter(task => task.priority <= 2);
     * if (highPriorityTasks.length > 0) {
     *   console.log(`${highPriorityTasks.length} high-priority tasks active`);
     * }
     * ```
     */
    getActiveTasks(): Task[];
    private setupEventHandlers;
    private startHealthChecks;
    private performHealthCheck;
    private waitForTasksCompletion;
    private performTask;
}
export default Orchestrator;
//# sourceMappingURL=orchestrator.d.ts.map