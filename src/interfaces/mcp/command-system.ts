/**
 * @file Command Pattern Implementation for MCP Tool Execution
 * Provides command encapsulation with undo support, batch operations, and transaction handling
 */

import { EventEmitter } from 'node:events';
import type { SwarmTopology } from '../../coordination/swarm/core/strategy';

// Core command interfaces
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ResourceMetrics {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  timestamp: Date;
}

export interface CommandResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  executionTime: number;
  resourceUsage: ResourceMetrics;
  warnings?: string[];
  metadata?: Record<string, any>;
}

export interface CommandContext {
  userId?: string;
  sessionId: string;
  timestamp: Date;
  environment: 'development' | 'staging' | 'production';
  permissions: string[];
  resources: ResourceMetrics;
}

// Generic command interface with comprehensive lifecycle support
export interface MCPCommand<T = any> {
  execute(): Promise<CommandResult<T>>;
  undo?(): Promise<void>;
  canUndo(): boolean;
  getCommandType(): string;
  getEstimatedDuration(): number;
  validate(): Promise<ValidationResult>;
  getDescription(): string;
  getRequiredPermissions(): string[];
  clone?(): MCPCommand<T>;
}

// Transaction support for atomic operations
export interface Transaction {
  id: string;
  commands: MCPCommand[];
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'rolled_back';
  createdAt: Date;
  completedAt?: Date;
  rollbackReason?: string;
}

// Command execution statistics
export interface QueueMetrics {
  totalExecuted: number;
  totalFailed: number;
  averageExecutionTime: number;
  commandTypeStats: Map<string, { count: number; avgTime: number; failureRate: number }>;
  queueSize: number;
  processingTime: number;
}

// Swarm-specific command interfaces
export interface SwarmInitResult {
  swarmId: string;
  topology: SwarmTopology;
  agentCount: number;
  estimatedReadyTime: number;
  warnings?: string[];
}

export interface SwarmConfig {
  topology: SwarmTopology;
  agentCount: number;
  capabilities?: string[];
  resourceLimits?: ResourceMetrics;
  timeout?: number;
}

export interface AgentSpawnResult {
  agentId: string;
  capabilities: string[];
  status: 'initializing' | 'ready' | 'error';
  resourceAllocation: ResourceMetrics;
}

export interface TaskOrchestrationResult {
  taskId: string;
  assignedAgents: string[];
  estimatedCompletion: Date;
  dependencies: string[];
  status: 'queued' | 'executing' | 'completed' | 'failed';
}

// Concrete MCP command implementations

// Swarm Initialization Command
export class SwarmInitCommand implements MCPCommand<SwarmInitResult> {
  private swarmId?: string;
  private executionStartTime?: number;

  constructor(
    private config: SwarmConfig,
    private swarmManager: any,
    private context: CommandContext
  ) {}

  async validate(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate agent count
    if (this.config.agentCount <= 0) {
      errors.push('Agent count must be greater than 0');
    }
    if (this.config.agentCount > 100) {
      errors.push('Agent count exceeds maximum limit of 100');
    }
    if (this.config.agentCount > 50) {
      warnings.push('Large agent count may impact performance');
    }

    // Validate topology
    const validTopologies: SwarmTopology[] = ['mesh', 'hierarchical', 'ring', 'star'];
    if (!validTopologies.includes(this.config.topology)) {
      errors.push(`Invalid topology: ${this.config.topology}`);
    }

    // Validate swarm manager health
    if (!this.swarmManager.isHealthy()) {
      errors.push('Swarm manager is not healthy');
    }

    // Validate permissions
    if (!this.context.permissions.includes('swarm:create')) {
      errors.push('Insufficient permissions to create swarm');
    }

    // Validate resources
    if (this.context.resources.cpu < 0.1) {
      errors.push('Insufficient CPU resources');
    }
    if (this.context.resources.memory < 0.2) {
      warnings.push('Low memory resources may impact swarm performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async execute(): Promise<CommandResult<SwarmInitResult>> {
    this.executionStartTime = Date.now();
    const startResources = this.measureResources();

    const validation = await this.validate();
    if (!validation.valid) {
      return {
        success: false,
        error: new Error(`Validation failed: ${validation.errors.join(', ')}`),
        executionTime: Date.now() - this.executionStartTime,
        resourceUsage: this.measureResources(),
        warnings: validation.warnings,
      };
    }

    try {
      // Execute swarm initialization
      const result = await this.swarmManager.initializeSwarm(
        this.config.topology,
        this.config.agentCount,
        {
          capabilities: this.config.capabilities,
          resourceLimits: this.config.resourceLimits,
          timeout: this.config.timeout,
        }
      );

      this.swarmId = result.swarmId;
      const endResources = this.measureResources();

      return {
        success: true,
        data: result,
        executionTime: Date.now() - this.executionStartTime,
        resourceUsage: this.calculateResourceDelta(startResources, endResources),
        warnings: result.warnings,
        metadata: {
          topology: this.config.topology,
          agentCount: this.config.agentCount,
          sessionId: this.context.sessionId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        executionTime: Date.now() - this.executionStartTime,
        resourceUsage: this.measureResources(),
      };
    }
  }

  async undo(): Promise<void> {
    if (this.swarmId) {
      await this.swarmManager.destroySwarm(this.swarmId);
      this.swarmId = undefined;
    }
  }

  canUndo(): boolean {
    return !!this.swarmId;
  }

  getCommandType(): string {
    return 'swarm_init';
  }

  getEstimatedDuration(): number {
    return this.config.agentCount * 100 + 1000; // Base time plus per-agent overhead
  }

  getDescription(): string {
    return `Initialize ${this.config.topology} swarm with ${this.config.agentCount} agents`;
  }

  getRequiredPermissions(): string[] {
    return ['swarm:create', 'agent:spawn'];
  }

  clone(): MCPCommand<SwarmInitResult> {
    return new SwarmInitCommand({ ...this.config }, this.swarmManager, { ...this.context });
  }

  private measureResources(): ResourceMetrics {
    return {
      cpu: process.cpuUsage().system / 1000000, // Convert to seconds
      memory: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
      network: 0, // Would need actual network monitoring
      storage: 0, // Would need actual storage monitoring
      timestamp: new Date(),
    };
  }

  private calculateResourceDelta(start: ResourceMetrics, end: ResourceMetrics): ResourceMetrics {
    return {
      cpu: end.cpu - start.cpu,
      memory: end.memory - start.memory,
      network: end.network - start.network,
      storage: end.storage - start.storage,
      timestamp: end.timestamp,
    };
  }
}

// Agent Spawn Command
export class AgentSpawnCommand implements MCPCommand<AgentSpawnResult> {
  private agentId?: string;

  constructor(
    private agentConfig: {
      type: string;
      capabilities: string[];
      resourceRequirements?: ResourceMetrics;
    },
    private swarmManager: any,
    private swarmId: string,
    private context: CommandContext
  ) {}

  async validate(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.agentConfig.type) {
      errors.push('Agent type is required');
    }

    if (!this.swarmId) {
      errors.push('Swarm ID is required');
    }

    if (!this.context.permissions.includes('agent:spawn')) {
      errors.push('Insufficient permissions to spawn agent');
    }

    const swarmStatus = await this.swarmManager.getSwarmStatus(this.swarmId);
    if (!swarmStatus.healthy) {
      errors.push('Target swarm is not healthy');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async execute(): Promise<CommandResult<AgentSpawnResult>> {
    const startTime = Date.now();
    const validation = await this.validate();

    if (!validation.valid) {
      return {
        success: false,
        error: new Error(`Validation failed: ${validation.errors.join(', ')}`),
        executionTime: Date.now() - startTime,
        resourceUsage: this.measureResources(),
      };
    }

    try {
      const result = await this.swarmManager.spawnAgent(this.swarmId, this.agentConfig);
      this.agentId = result.agentId;

      return {
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        resourceUsage: this.measureResources(),
        metadata: {
          swarmId: this.swarmId,
          agentType: this.agentConfig.type,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        executionTime: Date.now() - startTime,
        resourceUsage: this.measureResources(),
      };
    }
  }

  async undo(): Promise<void> {
    if (this.agentId && this.swarmId) {
      await this.swarmManager.destroyAgent(this.swarmId, this.agentId);
      this.agentId = undefined;
    }
  }

  canUndo(): boolean {
    return !!this.agentId;
  }

  getCommandType(): string {
    return 'agent_spawn';
  }

  getEstimatedDuration(): number {
    return 500; // Agent spawn is typically faster
  }

  getDescription(): string {
    return `Spawn ${this.agentConfig.type} agent in swarm ${this.swarmId}`;
  }

  getRequiredPermissions(): string[] {
    return ['agent:spawn'];
  }

  private measureResources(): ResourceMetrics {
    return {
      cpu: process.cpuUsage().system / 1000000,
      memory: process.memoryUsage().heapUsed / 1024 / 1024,
      network: 0,
      storage: 0,
      timestamp: new Date(),
    };
  }
}

// Task Orchestration Command
export class TaskOrchestrationCommand implements MCPCommand<TaskOrchestrationResult> {
  constructor(
    private task: {
      description: string;
      requirements: string[];
      priority: 'low' | 'medium' | 'high' | 'critical';
      timeout?: number;
    },
    private swarmManager: any,
    private swarmId: string,
    private context: CommandContext
  ) {}

  async validate(): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!this.task.description) {
      errors.push('Task description is required');
    }

    if (!this.context.permissions.includes('task:orchestrate')) {
      errors.push('Insufficient permissions to orchestrate tasks');
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(): Promise<CommandResult<TaskOrchestrationResult>> {
    const startTime = Date.now();
    const validation = await this.validate();

    if (!validation.valid) {
      return {
        success: false,
        error: new Error(`Validation failed: ${validation.errors.join(', ')}`),
        executionTime: Date.now() - startTime,
        resourceUsage: this.measureResources(),
      };
    }

    try {
      const result = await this.swarmManager.orchestrateTask(this.swarmId, this.task);

      return {
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        resourceUsage: this.measureResources(),
        metadata: {
          swarmId: this.swarmId,
          priority: this.task.priority,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        executionTime: Date.now() - startTime,
        resourceUsage: this.measureResources(),
      };
    }
  }

  canUndo(): boolean {
    return false; // Task orchestration typically cannot be undone
  }

  getCommandType(): string {
    return 'task_orchestrate';
  }

  getEstimatedDuration(): number {
    const baseDuration = 200;
    const priorityMultiplier =
      this.task.priority === 'critical'
        ? 0.5
        : this.task.priority === 'high'
          ? 0.7
          : this.task.priority === 'medium'
            ? 1.0
            : 1.5;
    return baseDuration * priorityMultiplier;
  }

  getDescription(): string {
    return `Orchestrate task: ${this.task.description}`;
  }

  getRequiredPermissions(): string[] {
    return ['task:orchestrate'];
  }

  private measureResources(): ResourceMetrics {
    return {
      cpu: process.cpuUsage().system / 1000000,
      memory: process.memoryUsage().heapUsed / 1024 / 1024,
      network: 0,
      storage: 0,
      timestamp: new Date(),
    };
  }
}

// Advanced command queue with transaction support and batch operations
export class MCPCommandQueue extends EventEmitter {
  private commandHistory: Array<{ command: MCPCommand; result: CommandResult; timestamp: Date }> =
    [];
  private undoStack: MCPCommand[] = [];
  private activeTransactions: Map<string, Transaction> = new Map();
  private metrics: QueueMetrics;
  private processing = false;
  private maxConcurrentCommands = 5;
  private currentlyExecuting = 0;
  private queue: Array<{ command: MCPCommand; resolve: Function; reject: Function }> = [];

  constructor(private logger?: any) {
    super();
    this.metrics = this.initializeMetrics();
    this.startProcessing();
  }

  async execute<T>(command: MCPCommand<T>): Promise<CommandResult<T>> {
    return new Promise((resolve, reject) => {
      this.queue.push({ command, resolve, reject });
      this.emit('queue:enqueued', {
        command: command.getCommandType(),
        queueSize: this.queue.length,
      });
    });
  }

  // Execute multiple commands in parallel with concurrency control
  async executeBatch<T>(commands: MCPCommand<T>[]): Promise<CommandResult<T>[]> {
    // Separate commands by estimated duration for optimal batching
    const fastCommands = commands.filter((cmd) => cmd.getEstimatedDuration() < 1000);
    const slowCommands = commands.filter((cmd) => cmd.getEstimatedDuration() >= 1000);

    // Execute fast commands in parallel (with concurrency limit)
    const parallelResults = await this.executeParallel(fastCommands);

    // Execute slow commands sequentially to avoid resource exhaustion
    const sequentialResults: CommandResult<T>[] = [];
    for (const command of slowCommands) {
      sequentialResults.push(await this.execute(command));
    }

    return [...parallelResults, ...sequentialResults];
  }

  // Transaction support for atomic operations
  async executeTransaction(commands: MCPCommand[]): Promise<CommandResult[]> {
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction: Transaction = {
      id: transactionId,
      commands,
      status: 'pending',
      createdAt: new Date(),
    };

    this.activeTransactions.set(transactionId, transaction);
    const results: CommandResult[] = [];

    try {
      transaction.status = 'executing';

      for (const command of commands) {
        const result = await this.execute(command);
        results.push(result);

        if (!result.success) {
          // Rollback all successful commands in this transaction
          await this.rollbackTransaction(transactionId, results);
          transaction.status = 'rolled_back';
          transaction.rollbackReason = result.error?.message;
          break;
        }
      }

      if (results.every((r) => r.success)) {
        transaction.status = 'completed';
        transaction.completedAt = new Date();
      }
    } catch (error) {
      transaction.status = 'failed';
      transaction.rollbackReason = (error as Error).message;
      await this.rollbackTransaction(transactionId, results);
    } finally {
      this.activeTransactions.delete(transactionId);
    }

    return results;
  }

  async undo(): Promise<void> {
    const command = this.undoStack.pop();
    if (command && command.undo) {
      try {
        await command.undo();
        this.metrics.commandTypeStats.get(command.getCommandType())?.count || 0;
        this.emit('command:undone', { commandType: command.getCommandType() });
      } catch (error) {
        this.logger?.error('Undo operation failed:', error);
        this.emit('command:undo_failed', { commandType: command.getCommandType(), error });
        throw error;
      }
    }
  }

  // Retry failed commands with exponential backoff
  async retryCommand<T>(
    originalCommand: MCPCommand<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<CommandResult<T>> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Clone command if possible to avoid state issues
        const command = originalCommand.clone ? originalCommand.clone() : originalCommand;
        const result = await this.execute(command);

        if (result.success) {
          return result;
        }
        lastError = result.error || new Error('Command failed without error details');
      } catch (error) {
        lastError = error as Error;
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  getHistory(): Array<{ command: MCPCommand; result: CommandResult; timestamp: Date }> {
    return [...this.commandHistory];
  }

  getActiveTransactions(): Transaction[] {
    return Array.from(this.activeTransactions.values());
  }

  clearHistory(): void {
    this.commandHistory = [];
    this.undoStack = [];
    this.metrics = this.initializeMetrics();
  }

  // Scheduled command execution
  async scheduleCommand<T>(command: MCPCommand<T>, executeAt: Date): Promise<CommandResult<T>> {
    const delay = executeAt.getTime() - Date.now();

    if (delay <= 0) {
      return this.execute(command);
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await this.execute(command);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }

  async shutdown(): Promise<void> {
    this.processing = false;

    // Wait for currently executing commands to complete
    while (this.currentlyExecuting > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Cancel any active transactions
    for (const [txId, transaction] of this.activeTransactions) {
      if (transaction.status === 'executing') {
        transaction.status = 'failed';
        transaction.rollbackReason = 'System shutdown';
        await this.rollbackTransaction(txId, []);
      }
    }

    this.emit('queue:shutdown');
  }

  private async executeParallel<T>(commands: MCPCommand<T>[]): Promise<CommandResult<T>[]> {
    const chunks = [];
    for (let i = 0; i < commands.length; i += this.maxConcurrentCommands) {
      chunks.push(commands.slice(i, i + this.maxConcurrentCommands));
    }

    const results: CommandResult<T>[] = [];
    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(chunk.map((cmd) => this.execute(cmd)));

      results.push(
        ...chunkResults.map((result) =>
          result.status === 'fulfilled'
            ? result.value
            : {
                success: false,
                error: result.reason,
                executionTime: 0,
                resourceUsage: this.emptyResourceMetrics(),
              }
        )
      );
    }

    return results;
  }

  private startProcessing(): void {
    this.processing = true;

    const processNext = async () => {
      if (!this.processing || this.currentlyExecuting >= this.maxConcurrentCommands) {
        setTimeout(processNext, 10);
        return;
      }

      const item = this.queue.shift();
      if (!item) {
        setTimeout(processNext, 10);
        return;
      }

      this.currentlyExecuting++;
      this.executeCommand(item.command)
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          this.currentlyExecuting--;
          setImmediate(processNext);
        });

      setImmediate(processNext);
    };

    processNext();
  }

  private async executeCommand<T>(command: MCPCommand<T>): Promise<CommandResult<T>> {
    const startTime = Date.now();

    try {
      const result = await command.execute();

      // Update metrics
      this.updateMetrics(command, result, Date.now() - startTime);

      // Store in history
      this.commandHistory.push({
        command,
        result,
        timestamp: new Date(),
      });

      // Add to undo stack if undoable
      if (result.success && command.canUndo()) {
        this.undoStack.push(command);
      }

      this.emit('command:executed', {
        commandType: command.getCommandType(),
        success: result.success,
        executionTime: result.executionTime,
      });

      return result;
    } catch (error) {
      const errorResult: CommandResult<T> = {
        success: false,
        error: error as Error,
        executionTime: Date.now() - startTime,
        resourceUsage: this.emptyResourceMetrics(),
      };

      this.updateMetrics(command, errorResult, errorResult.executionTime);

      this.emit('command:error', {
        commandType: command.getCommandType(),
        error: error as Error,
      });

      return errorResult;
    }
  }

  private async rollbackTransaction(
    transactionId: string,
    results: CommandResult[]
  ): Promise<void> {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) return;

    // Rollback commands in reverse order
    for (let i = results.length - 1; i >= 0; i--) {
      const command = transaction.commands[i];
      if (results[i].success && command.canUndo() && command.undo) {
        try {
          await command.undo();
        } catch (error) {
          this.logger?.error('Transaction rollback failed for command:', error);
        }
      }
    }
  }

  private updateMetrics(
    command: MCPCommand,
    result: CommandResult,
    actualExecutionTime: number
  ): void {
    this.metrics.totalExecuted++;
    if (!result.success) {
      this.metrics.totalFailed++;
    }

    const commandType = command.getCommandType();
    const stats = this.metrics.commandTypeStats.get(commandType) || {
      count: 0,
      avgTime: 0,
      failureRate: 0,
    };

    stats.count++;
    stats.avgTime = (stats.avgTime * (stats.count - 1) + actualExecutionTime) / stats.count;
    stats.failureRate =
      (stats.failureRate * (stats.count - 1) + (result.success ? 0 : 1)) / stats.count;

    this.metrics.commandTypeStats.set(commandType, stats);

    // Update overall average
    this.metrics.averageExecutionTime =
      (this.metrics.averageExecutionTime * (this.metrics.totalExecuted - 1) + actualExecutionTime) /
      this.metrics.totalExecuted;

    this.metrics.queueSize = this.queue.length;
  }

  private initializeMetrics(): QueueMetrics {
    return {
      totalExecuted: 0,
      totalFailed: 0,
      averageExecutionTime: 0,
      commandTypeStats: new Map(),
      queueSize: 0,
      processingTime: 0,
    };
  }

  private emptyResourceMetrics(): ResourceMetrics {
    return {
      cpu: 0,
      memory: 0,
      network: 0,
      storage: 0,
      timestamp: new Date(),
    };
  }
}

// Command factory for creating typed commands
export class CommandFactory {
  static createSwarmInitCommand(
    config: SwarmConfig,
    swarmManager: any,
    context: CommandContext
  ): SwarmInitCommand {
    return new SwarmInitCommand(config, swarmManager, context);
  }

  static createAgentSpawnCommand(
    agentConfig: { type: string; capabilities: string[]; resourceRequirements?: ResourceMetrics },
    swarmManager: any,
    swarmId: string,
    context: CommandContext
  ): AgentSpawnCommand {
    return new AgentSpawnCommand(agentConfig, swarmManager, swarmId, context);
  }

  static createTaskOrchestrationCommand(
    task: {
      description: string;
      requirements: string[];
      priority: 'low' | 'medium' | 'high' | 'critical';
      timeout?: number;
    },
    swarmManager: any,
    swarmId: string,
    context: CommandContext
  ): TaskOrchestrationCommand {
    return new TaskOrchestrationCommand(task, swarmManager, swarmId, context);
  }
}
