/**
 * Orchestrator - Core orchestration system for claude-zen
 * Coordinates components and manages system lifecycle
 */

import { EventEmitter } from 'node:events';
import type { IEventBus } from './event-bus';
import type { ILogger } from './logger';

export interface OrchestratorConfig {
  name?: string;
  timeout?: number;
  maxConcurrentTasks?: number;
  enableHealthCheck?: boolean;
  healthCheckInterval?: number;
}

export interface Task {
  id: string;
  type: string;
  description: string;
  priority: number;
  input?: any;
  metadata?: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  output?: any;
  duration: number;
  error?: Error;
}

/**
 * Core orchestrator for system coordination
 *
 * @example
 */
export class Orchestrator extends EventEmitter {
  private config: Required<OrchestratorConfig>;
  private isRunning = false;
  private activeTasks = new Map<string, Task>();
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(
    config: OrchestratorConfig,
    private terminalManager?: any,
    private memoryManager?: any,
    private coordinationManager?: any,
    private mcpServer?: any,
    private eventBus?: IEventBus,
    private logger?: ILogger
  ) {
    super();

    this.config = {
      name: config.name || 'claude-zen-orchestrator',
      timeout: config.timeout || 30000,
      maxConcurrentTasks: config.maxConcurrentTasks || 10,
      enableHealthCheck: config.enableHealthCheck !== false,
      healthCheckInterval: config.healthCheckInterval || 30000,
    };

    this.setupEventHandlers();
    this.logger?.info(`Orchestrator initialized: ${this.config.name}`);
  }

  /**
   * Start the orchestrator
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger?.warn('Orchestrator is already running');
      return;
    }

    try {
      this.logger?.info('Starting orchestrator...');

      // Start health checks if enabled
      if (this.config.enableHealthCheck) {
        this.startHealthChecks();
      }

      this.isRunning = true;
      this.emit('started');
      this.logger?.info('Orchestrator started successfully');
    } catch (error) {
      this.logger?.error('Failed to start orchestrator', { error });
      throw error;
    }
  }

  /**
   * Stop the orchestrator
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger?.warn('Orchestrator is not running');
      return;
    }

    try {
      this.logger?.info('Stopping orchestrator...');

      // Stop health checks
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = undefined;
      }

      // Wait for active tasks to complete or timeout
      await this.waitForTasksCompletion();

      this.isRunning = false;
      this.emit('stopped');
      this.logger?.info('Orchestrator stopped successfully');
    } catch (error) {
      this.logger?.error('Error stopping orchestrator', { error });
      throw error;
    }
  }

  /**
   * Execute a task
   *
   * @param task
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
      throw new Error('Maximum concurrent tasks limit reached');
    }

    this.activeTasks.set(task.id, task);
    this.emit('taskStarted', { taskId: task.id });

    try {
      this.logger?.info(`Executing task: ${task.id}`, { type: task.type });

      // Simulate task execution (replace with actual implementation)
      const result = await this.performTask(task);

      const duration = Date.now() - startTime;
      this.logger?.info(`Task completed: ${task.id}`, { duration });

      this.emit('taskCompleted', { taskId: task.id, result, duration });
      return { success: true, output: result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger?.error(`Task failed: ${task.id}`, { error, duration });

      this.emit('taskFailed', { taskId: task.id, error, duration });
      return { success: false, duration, error: error as Error };
    } finally {
      this.activeTasks.delete(task.id);
    }
  }

  /**
   * Get orchestrator status
   */
  getStatus(): {
    running: boolean;
    activeTasks: number;
    name: string;
    uptime: number;
  } {
    return {
      running: this.isRunning,
      activeTasks: this.activeTasks.size,
      name: this.config.name,
      uptime: this.isRunning ? Date.now() : 0,
    };
  }

  /**
   * Get active tasks
   */
  getActiveTasks(): Task[] {
    return Array.from(this.activeTasks.values());
  }

  private setupEventHandlers(): void {
    // Handle system events if eventBus is available
    if (this.eventBus) {
      this.eventBus.on('system:shutdown', () => {
        this.stop().catch((error) => this.logger?.error('Error during shutdown', { error }));
      });
    }
  }

  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private performHealthCheck(): void {
    const status = this.getStatus();
    this.emit('healthCheck', status);

    if (status.activeTasks > this.config.maxConcurrentTasks * 0.8) {
      this.logger?.warn('High task load detected', {
        activeTasks: status.activeTasks,
        maxTasks: this.config.maxConcurrentTasks,
      });
    }
  }

  private async waitForTasksCompletion(): Promise<void> {
    const timeout = this.config.timeout;
    const startTime = Date.now();

    while (this.activeTasks.size > 0 && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this.activeTasks.size > 0) {
      this.logger?.warn(`${this.activeTasks.size} tasks still active after timeout`);
    }
  }

  private async performTask(task: Task): Promise<any> {
    // This is a placeholder implementation
    // In a real system, this would delegate to appropriate subsystems
    // based on task.type and use the injected managers

    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate work

    return {
      taskId: task.id,
      result: `Task ${task.type} completed`,
      timestamp: new Date().toISOString(),
    };
  }
}

export default Orchestrator;
