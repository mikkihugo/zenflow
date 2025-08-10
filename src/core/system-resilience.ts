/**
 * System Resilience Patterns for Claude-Zen.
 *
 * Implements advanced resilience patterns for distributed swarm systems.
 * including bulkheads, timeouts, resource cleanup, and emergency procedures.
 */
/**
 * @file system-resilience implementation
 */



import { errorMonitor } from './error-monitoring';
import { AgentError, SystemError, TimeoutError, WASMMemoryError } from './errors';
import { createLogger } from './logger';

const logger = createLogger({ prefix: 'SystemResilience' });

// ===============================
// Resource Management and Cleanup
// ===============================

export interface ResourceHandle {
  id: string;
  type: 'memory' | 'file' | 'network' | 'wasm' | 'agent' | 'database';
  allocated: number; // timestamp
  size?: number; // in bytes
  cleanup: () => Promise<void>;
  owner: string; // component or operation that owns this resource
}

export interface ResourceLimits {
  maxMemoryMB: number;
  maxFileHandles: number;
  maxNetworkConnections: number;
  maxWASMInstances: number;
  maxAgents: number;
  maxDatabaseConnections: number;
}

export class ResourceManager {
  private resources: Map<string, ResourceHandle> = new Map();
  private resourcesByType: Map<string, Set<string>> = new Map();
  private resourcesByOwner: Map<string, Set<string>> = new Map();
  private limits: ResourceLimits;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(limits: Partial<ResourceLimits> = {}) {
    this.limits = {
      maxMemoryMB: 512,
      maxFileHandles: 1000,
      maxNetworkConnections: 100,
      maxWASMInstances: 10,
      maxAgents: 50,
      maxDatabaseConnections: 20,
      ...limits,
    };

    // Initialize type tracking
    ['memory', 'file', 'network', 'wasm', 'agent', 'database'].forEach((type) => {
      this.resourcesByType.set(type, new Set());
    });

    this.startCleanupMonitoring();
  }

  public async allocateResource(
    type: ResourceHandle['type'],
    owner: string,
    size?: number,
    cleanup?: () => Promise<void>
  ): Promise<string> {
    // Check limits before allocation
    await this.enforceResourceLimits(type, size);

    const resourceId = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    const resource: ResourceHandle = {
      id: resourceId,
      type,
      allocated: Date.now(),
      size: size || 0,
      cleanup: cleanup || (() => Promise.resolve()),
      owner,
    };

    // Register resource
    this.resources.set(resourceId, resource);
    this.resourcesByType.get(type)?.add(resourceId);

    if (!this.resourcesByOwner.has(owner)) {
      this.resourcesByOwner.set(owner, new Set());
    }
    this.resourcesByOwner.get(owner)?.add(resourceId);

    logger.debug(`Resource allocated: ${resourceId} (${type}) for ${owner}`, { size });

    return resourceId;
  }

  public async releaseResource(resourceId: string): Promise<void> {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      logger.warn(`Attempted to release non-existent resource: ${resourceId}`);
      return;
    }

    try {
      // Execute cleanup
      await resource.cleanup();

      // Remove from tracking
      this.resources.delete(resourceId);
      this.resourcesByType.get(resource.type)?.delete(resourceId);
      this.resourcesByOwner.get(resource.owner)?.delete(resourceId);

      logger.debug(`Resource released: ${resourceId} (${resource.type})`);
    } catch (error) {
      logger.error(`Failed to release resource ${resourceId}:`, error);

      // Force remove from tracking even if cleanup failed
      this.resources.delete(resourceId);
      this.resourcesByType.get(resource.type)?.delete(resourceId);
      this.resourcesByOwner.get(resource.owner)?.delete(resourceId);

      throw new SystemError(
        `Resource cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
        'RESOURCE_CLEANUP_FAILED',
        'high'
      );
    }
  }

  public async releaseResourcesByOwner(owner: string): Promise<void> {
    const ownerResources = this.resourcesByOwner.get(owner);
    if (!ownerResources || ownerResources.size === 0) {
      return;
    }

    logger.info(`Releasing ${ownerResources.size} resources for owner: ${owner}`);

    const releasePromises = Array.from(ownerResources).map((resourceId) =>
      this.releaseResource(resourceId).catch((error) => {
        logger.error(`Failed to release resource ${resourceId} for owner ${owner}:`, error);
      })
    );

    await Promise.allSettled(releasePromises);
  }

  private async enforceResourceLimits(type: ResourceHandle['type'], size?: number): Promise<void> {
    const currentCount = this.resourcesByType.get(type)?.size ?? 0;

    // Check count limits
    switch (type) {
      case 'file':
        if (currentCount >= this.limits.maxFileHandles) {
          throw new SystemError(
            `File handle limit exceeded: ${currentCount}/${this.limits.maxFileHandles}`,
            'RESOURCE_LIMIT_EXCEEDED',
            'high'
          );
        }
        break;
      case 'network':
        if (currentCount >= this.limits.maxNetworkConnections) {
          throw new SystemError(
            `Network connection limit exceeded: ${currentCount}/${this.limits.maxNetworkConnections}`,
            'RESOURCE_LIMIT_EXCEEDED',
            'high'
          );
        }
        break;
      case 'wasm':
        if (currentCount >= this.limits.maxWASMInstances) {
          throw new WASMMemoryError(
            `WASM instance limit exceeded: ${currentCount}/${this.limits.maxWASMInstances}`,
            size || 0,
            this.limits.maxWASMInstances
          );
        }
        break;
      case 'agent':
        if (currentCount >= this.limits.maxAgents) {
          throw new AgentError(
            `Agent limit exceeded: ${currentCount}/${this.limits.maxAgents}`,
            undefined,
            undefined,
            'high'
          );
        }
        break;
      case 'database':
        if (currentCount >= this.limits.maxDatabaseConnections) {
          throw new SystemError(
            `Database connection limit exceeded: ${currentCount}/${this.limits.maxDatabaseConnections}`,
            'RESOURCE_LIMIT_EXCEEDED',
            'high'
          );
        }
        break;
    }

    // Check memory limits
    if (type === 'memory' && size) {
      const currentMemoryMB = this.getCurrentMemoryUsage();
      if (currentMemoryMB + size / 1024 / 1024 > this.limits.maxMemoryMB) {
        // Try to free some memory first
        await this.cleanupOldResources();

        const newMemoryMB = this.getCurrentMemoryUsage();
        if (newMemoryMB + size / 1024 / 1024 > this.limits.maxMemoryMB) {
          throw new SystemError(
            `Memory limit would be exceeded: ${newMemoryMB + size / 1024 / 1024}MB > ${this.limits.maxMemoryMB}MB`,
            'MEMORY_LIMIT_EXCEEDED',
            'critical'
          );
        }
      }
    }
  }

  private getCurrentMemoryUsage(): number {
    let totalMemory = 0;
    for (const resource of this.resources.values()) {
      if (resource.type === 'memory' && resource.size) {
        totalMemory += resource.size;
      }
    }
    return totalMemory / 1024 / 1024; // Convert to MB
  }

  private async cleanupOldResources(): Promise<void> {
    const now = Date.now();
    const oldResourcesThreshold = 30 * 60 * 1000; // 30 minutes

    const oldResources = Array.from(this.resources.values())
      .filter((resource) => now - resource.allocated > oldResourcesThreshold)
      .sort((a, b) => a.allocated - b.allocated) // Oldest first
      .slice(0, 10); // Cleanup up to 10 resources

    if (oldResources.length > 0) {
      logger.info(`Cleaning up ${oldResources.length} old resources`);

      for (const resource of oldResources) {
        try {
          await this.releaseResource(resource.id);
        } catch (error) {
          logger.error(`Failed to cleanup old resource ${resource.id}:`, error);
        }
      }
    }
  }

  private startCleanupMonitoring(): void {
    this.cleanupInterval = setInterval(
      async () => {
        try {
          await this.cleanupOldResources();

          // Log resource usage statistics
          const stats = this.getResourceStats();
          if (stats.totalResources > 0) {
            logger.debug('Resource usage stats:', stats);
          }
        } catch (error) {
          logger.error('Resource cleanup monitoring error:', error);
        }
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }

  public getResourceStats(): {
    totalResources: number;
    resourcesByType: Record<string, number>;
    memoryUsageMB: number;
    oldestResource: number;
  } {
    const resourcesByType: Record<string, number> = {};
    let oldestTimestamp = Date.now();

    for (const [type, resourceIds] of this.resourcesByType.entries()) {
      resourcesByType[type] = resourceIds.size;
    }

    for (const resource of this.resources.values()) {
      if (resource.allocated < oldestTimestamp) {
        oldestTimestamp = resource.allocated;
      }
    }

    return {
      totalResources: this.resources.size,
      resourcesByType,
      memoryUsageMB: this.getCurrentMemoryUsage(),
      oldestResource: oldestTimestamp,
    };
  }

  public async emergencyCleanup(): Promise<void> {
    logger.warn('Emergency resource cleanup initiated');

    const releasePromises = Array.from(this.resources.keys()).map((resourceId) =>
      this.releaseResource(resourceId).catch((error) => {
        logger.error(`Emergency cleanup failed for resource ${resourceId}:`, error);
      })
    );

    await Promise.allSettled(releasePromises);

    logger.info('Emergency resource cleanup completed');
  }

  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// ===============================
// Bulkhead Pattern Implementation
// ===============================

export interface BulkheadConfig {
  name: string;
  maxConcurrentExecutions: number;
  queueSize: number;
  timeoutMs: number;
  priority: number; // Higher numbers = higher priority
}

export interface BulkheadMetrics {
  name: string;
  currentExecutions: number;
  queuedExecutions: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  timeoutExecutions: number;
  averageExecutionTime: number;
  maxExecutionTime: number;
}

export class Bulkhead {
  private currentExecutions: number = 0;
  private queue: Array<{
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    enqueuedAt: number;
    priority: number;
  }> = [];

  private totalExecutions: number = 0;
  private successfulExecutions: number = 0;
  private failedExecutions: number = 0;
  private timeoutExecutions: number = 0;
  private executionTimes: number[] = [];

  constructor(private config: BulkheadConfig) {}

  public async execute<T>(
    operation: () => Promise<T>,
    priority: number = this.config.priority
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Check if we can execute immediately
      if (this.currentExecutions < this.config.maxConcurrentExecutions) {
        this.executeOperation(operation, resolve, reject);
      } else {
        // Queue the operation
        if (this.queue.length >= this.config.queueSize) {
          reject(
            new SystemError(
              `Bulkhead queue full for ${this.config.name}`,
              'BULKHEAD_QUEUE_FULL',
              'high'
            )
          );
          return;
        }

        this.queue.push({
          operation,
          resolve,
          reject,
          enqueuedAt: Date.now(),
          priority,
        });

        // Sort queue by priority (higher priority first)
        this.queue.sort((a, b) => b.priority - a.priority);
      }
    });
  }

  private async executeOperation<T>(
    operation: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (error: any) => void
  ): Promise<void> {
    this.currentExecutions++;
    this.totalExecutions++;

    const startTime = Date.now();
    const timeoutId = setTimeout(() => {
      this.timeoutExecutions++;
      this.currentExecutions--;
      reject(
        new TimeoutError(
          `Bulkhead operation timeout in ${this.config.name}`,
          this.config.timeoutMs,
          Date.now() - startTime
        )
      );
      this.processQueue();
    }, this.config.timeoutMs);

    try {
      const result = await operation();

      clearTimeout(timeoutId);
      this.successfulExecutions++;
      this.currentExecutions--;

      const executionTime = Date.now() - startTime;
      this.executionTimes.push(executionTime);

      // Keep only recent execution times
      if (this.executionTimes.length > 100) {
        this.executionTimes = this.executionTimes.slice(-50);
      }

      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      this.failedExecutions++;
      this.currentExecutions--;

      const executionTime = Date.now() - startTime;
      this.executionTimes.push(executionTime);

      reject(error);
    } finally {
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length > 0 && this.currentExecutions < this.config.maxConcurrentExecutions) {
      const next = this.queue.shift()!;

      // Check if queued operation has timed out
      const queuedTime = Date.now() - next.enqueuedAt;
      if (queuedTime > this.config.timeoutMs) {
        this.timeoutExecutions++;
        next.reject(
          new TimeoutError(
            `Bulkhead queue timeout in ${this.config.name}`,
            this.config.timeoutMs,
            queuedTime
          )
        );
        this.processQueue(); // Try next in queue
        return;
      }

      this.executeOperation(next.operation, next.resolve, next.reject);
    }
  }

  public getMetrics(): BulkheadMetrics {
    const avgExecutionTime =
      this.executionTimes.length > 0
        ? this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length
        : 0;

    const maxExecutionTime = this.executionTimes.length > 0 ? Math.max(...this.executionTimes) : 0;

    return {
      name: this.config.name,
      currentExecutions: this.currentExecutions,
      queuedExecutions: this.queue.length,
      totalExecutions: this.totalExecutions,
      successfulExecutions: this.successfulExecutions,
      failedExecutions: this.failedExecutions,
      timeoutExecutions: this.timeoutExecutions,
      averageExecutionTime: avgExecutionTime,
      maxExecutionTime: maxExecutionTime,
    };
  }

  public async drain(): Promise<void> {
    // Wait for all current executions to complete and clear queue
    while (this.currentExecutions > 0 || this.queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

// ===============================
// Timeout Management
// ===============================

export class TimeoutManager {
  private static timeouts: Map<string, NodeJS.Timeout> = new Map();

  public static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    operationName: string = 'unknown'
  ): Promise<T> {
    const timeoutId = `timeout_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeout = setTimeout(() => {
        TimeoutManager.timeouts.delete(timeoutId);
        reject(
          new TimeoutError(`Operation '${operationName}' timed out after ${timeoutMs}ms`, timeoutMs)
        );
      }, timeoutMs);

      TimeoutManager.timeouts.set(timeoutId, timeout);
    });

    try {
      const result = await Promise.race([operation(), timeoutPromise]);

      // Clear timeout on success
      const timeout = TimeoutManager.timeouts.get(timeoutId);
      if (timeout) {
        clearTimeout(timeout);
        TimeoutManager.timeouts.delete(timeoutId);
      }

      return result;
    } catch (error) {
      // Clear timeout on error
      const timeout = TimeoutManager.timeouts.get(timeoutId);
      if (timeout) {
        clearTimeout(timeout);
        TimeoutManager.timeouts.delete(timeoutId);
      }

      throw error;
    }
  }

  public static clearAllTimeouts(): void {
    for (const [_id, timeout] of TimeoutManager.timeouts.entries()) {
      clearTimeout(timeout);
    }
    TimeoutManager.timeouts.clear();
  }

  public static getActiveTimeouts(): number {
    return TimeoutManager.timeouts.size;
  }
}

// ===============================
// Error Boundary Implementation
// ===============================

export interface ErrorBoundaryConfig {
  name: string;
  maxErrors: number;
  windowMs: number;
  onBreach: (errors: Error[]) => Promise<void>;
  recovery: () => Promise<boolean>;
}

export class ErrorBoundary {
  private errors: Array<{ error: Error; timestamp: number }> = [];
  private breached: boolean = false;
  private recoveryAttempts: number = 0;

  constructor(private config: ErrorBoundaryConfig) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.breached) {
      throw new SystemError(
        `Error boundary '${this.config.name}' is breached`,
        'ERROR_BOUNDARY_BREACHED',
        'critical',
        { metadata: { boundaryName: this.config.name, errorCount: this.errors.length } }
      );
    }

    try {
      return await operation();
    } catch (error) {
      await this.recordError(error as Error);
      throw error;
    }
  }

  private async recordError(error: Error): Promise<void> {
    const now = Date.now();

    // Add error to history
    this.errors.push({ error, timestamp: now });

    // Clean old errors outside window
    this.errors = this.errors.filter((e) => now - e.timestamp <= this.config.windowMs);

    // Check if we've breached the boundary
    if (this.errors.length >= this.config.maxErrors && !this.breached) {
      this.breached = true;

      logger.error(
        `Error boundary '${this.config.name}' breached with ${this.errors.length} errors`
      );

      try {
        await this.config.onBreach(this.errors.map((e) => e.error));
      } catch (breachError) {
        logger.error(
          `Error boundary breach handler failed for '${this.config.name}':`,
          breachError
        );
      }
    }
  }

  public async attemptRecovery(): Promise<boolean> {
    if (!this.breached) {
      return true; // Already recovered
    }

    this.recoveryAttempts++;

    try {
      const recovered = await this.config.recovery();

      if (recovered) {
        this.breached = false;
        this.errors = [];
        this.recoveryAttempts = 0;

        logger.info(`Error boundary '${this.config.name}' recovered successfully`);
        return true;
      } else {
        logger.warn(
          `Error boundary '${this.config.name}' recovery attempt ${this.recoveryAttempts} failed`
        );
        return false;
      }
    } catch (recoveryError) {
      logger.error(
        `Error boundary '${this.config.name}' recovery attempt ${this.recoveryAttempts} threw error:`,
        recoveryError
      );
      return false;
    }
  }

  public getStatus(): {
    name: string;
    breached: boolean;
    errorCount: number;
    recoveryAttempts: number;
    windowMs: number;
  } {
    return {
      name: this.config.name,
      breached: this.breached,
      errorCount: this.errors.length,
      recoveryAttempts: this.recoveryAttempts,
      windowMs: this.config.windowMs,
    };
  }

  public reset(): void {
    this.errors = [];
    this.breached = false;
    this.recoveryAttempts = 0;

    logger.info(`Error boundary '${this.config.name}' reset`);
  }
}

// ===============================
// Emergency Shutdown System
// ===============================

export interface EmergencyProcedure {
  name: string;
  priority: number; // Lower numbers execute first
  procedure: () => Promise<void>;
  timeoutMs: number;
}

export class EmergencyShutdownSystem {
  private procedures: EmergencyProcedure[] = [];
  private shutdownInProgress: boolean = false;

  public addProcedure(procedure: EmergencyProcedure): void {
    this.procedures.push(procedure);
    this.procedures.sort((a, b) => a.priority - b.priority);
  }

  public async initiateEmergencyShutdown(reason: string): Promise<void> {
    if (this.shutdownInProgress) {
      logger.warn('Emergency shutdown already in progress');
      return;
    }

    this.shutdownInProgress = true;

    logger.error(`Emergency shutdown initiated: ${reason}`);

    // Report emergency shutdown
    errorMonitor.reportError(
      new SystemError(`Emergency shutdown: ${reason}`, 'EMERGENCY_SHUTDOWN', 'critical')
    );

    // Execute shutdown procedures in priority order
    for (const procedure of this.procedures) {
      try {
        logger.info(`Executing emergency procedure: ${procedure.name}`);

        await TimeoutManager.withTimeout(
          procedure.procedure,
          procedure.timeoutMs,
          `emergency_${procedure.name}`
        );

        logger.info(`Emergency procedure completed: ${procedure.name}`);
      } catch (error) {
        logger.error(`Emergency procedure failed: ${procedure.name}`, error);
        // Continue with other procedures even if one fails
      }
    }

    logger.info('Emergency shutdown procedures completed');
  }

  public isShutdownInProgress(): boolean {
    return this.shutdownInProgress;
  }
}

// ===============================
// System Resilience Orchestrator
// ===============================

export class SystemResilienceOrchestrator {
  private resourceManager: ResourceManager;
  private bulkheads: Map<string, Bulkhead> = new Map();
  private errorBoundaries: Map<string, ErrorBoundary> = new Map();
  public emergencyShutdown: EmergencyShutdownSystem;

  constructor(resourceLimits?: Partial<ResourceLimits>) {
    this.resourceManager = new ResourceManager(resourceLimits);
    this.emergencyShutdown = new EmergencyShutdownSystem();

    this.setupDefaultBulkheads();
    this.setupDefaultErrorBoundaries();
    this.setupDefaultEmergencyProcedures();
  }

  private setupDefaultBulkheads(): void {
    // FACT system bulkhead
    this.bulkheads.set(
      'fact',
      new Bulkhead({
        name: 'FACT System',
        maxConcurrentExecutions: 5,
        queueSize: 20,
        timeoutMs: 60000, // 1 minute
        priority: 5,
      })
    );

    // RAG system bulkhead
    this.bulkheads.set(
      'rag',
      new Bulkhead({
        name: 'RAG System',
        maxConcurrentExecutions: 3,
        queueSize: 15,
        timeoutMs: 30000, // 30 seconds
        priority: 7,
      })
    );

    // Swarm coordination bulkhead
    this.bulkheads.set(
      'swarm',
      new Bulkhead({
        name: 'Swarm Coordination',
        maxConcurrentExecutions: 10,
        queueSize: 50,
        timeoutMs: 45000, // 45 seconds
        priority: 8,
      })
    );

    // WASM execution bulkhead
    this.bulkheads.set(
      'wasm',
      new Bulkhead({
        name: 'WASM Execution',
        maxConcurrentExecutions: 2,
        queueSize: 10,
        timeoutMs: 20000, // 20 seconds
        priority: 3,
      })
    );
  }

  private setupDefaultErrorBoundaries(): void {
    // FACT system error boundary
    this.errorBoundaries.set(
      'fact',
      new ErrorBoundary({
        name: 'FACT System',
        maxErrors: 5,
        windowMs: 5 * 60 * 1000, // 5 minutes
        onBreach: async (errors) => {
          logger.error('FACT system error boundary breached', { errorCount: errors.length });
          // Could implement FACT system restart logic here
        },
        recovery: async () => {
          // Implement FACT system health check
          return true;
        },
      })
    );

    // Swarm coordination error boundary
    this.errorBoundaries.set(
      'swarm',
      new ErrorBoundary({
        name: 'Swarm Coordination',
        maxErrors: 10,
        windowMs: 3 * 60 * 1000, // 3 minutes
        onBreach: async (errors) => {
          logger.error('Swarm coordination error boundary breached', { errorCount: errors.length });
          // Could implement swarm restart logic here
        },
        recovery: async () => {
          // Implement swarm health check
          return true;
        },
      })
    );
  }

  private setupDefaultEmergencyProcedures(): void {
    // Stop all ongoing operations
    this.emergencyShutdown.addProcedure({
      name: 'stop_operations',
      priority: 1,
      timeoutMs: 5000,
      procedure: async () => {
        // Drain all bulkheads
        const drainPromises = Array.from(this.bulkheads.values()).map((b) => b.drain());
        await Promise.allSettled(drainPromises);
      },
    });

    // Clear all timeouts
    this.emergencyShutdown.addProcedure({
      name: 'clear_timeouts',
      priority: 2,
      timeoutMs: 2000,
      procedure: async () => {
        TimeoutManager.clearAllTimeouts();
      },
    });

    // Cleanup all resources
    this.emergencyShutdown.addProcedure({
      name: 'cleanup_resources',
      priority: 3,
      timeoutMs: 10000,
      procedure: async () => {
        await this.resourceManager.emergencyCleanup();
      },
    });

    // Stop monitoring systems
    this.emergencyShutdown.addProcedure({
      name: 'stop_monitoring',
      priority: 4,
      timeoutMs: 3000,
      procedure: async () => {
        errorMonitor.stopMonitoring();
        this.resourceManager.stop();
      },
    });
  }

  public getBulkhead(name: string): Bulkhead | undefined {
    return this.bulkheads.get(name);
  }

  public getErrorBoundary(name: string): ErrorBoundary | undefined {
    return this.errorBoundaries.get(name);
  }

  public getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  public async executeWithResilience<T>(
    operation: () => Promise<T>,
    options: {
      bulkhead?: string;
      errorBoundary?: string;
      timeoutMs?: number;
      operationName?: string;
    }
  ): Promise<T> {
    let wrappedOperation = operation;

    // Apply timeout if specified
    if (options?.["timeoutMs"]) {
      const timeoutOperation = wrappedOperation;
      wrappedOperation = () =>
        TimeoutManager.withTimeout(
          timeoutOperation,
          options?.["timeoutMs"]!,
          options?.["operationName"] || 'resilient_operation'
        );
    }

    // Apply error boundary if specified
    if (options?.["errorBoundary"]) {
      const errorBoundary = this.errorBoundaries.get(options?.["errorBoundary"]);
      if (errorBoundary) {
        const boundaryOperation = wrappedOperation;
        wrappedOperation = () => errorBoundary.execute(boundaryOperation);
      }
    }

    // Apply bulkhead if specified
    if (options?.["bulkhead"]) {
      const bulkhead = this.bulkheads.get(options?.["bulkhead"]);
      if (bulkhead) {
        return await bulkhead.execute(wrappedOperation);
      }
    }

    return await wrappedOperation();
  }

  public getSystemStatus(): {
    bulkheads: Record<string, BulkheadMetrics>;
    errorBoundaries: Record<string, any>;
    resources: any;
    activeTimeouts: number;
    emergencyShutdown: boolean;
  } {
    const bulkheadMetrics: Record<string, BulkheadMetrics> = {};
    for (const [name, bulkhead] of this.bulkheads.entries()) {
      bulkheadMetrics[name] = bulkhead.getMetrics();
    }

    const errorBoundaryStatus: Record<string, any> = {};
    for (const [name, boundary] of this.errorBoundaries.entries()) {
      errorBoundaryStatus[name] = boundary.getStatus();
    }

    return {
      bulkheads: bulkheadMetrics,
      errorBoundaries: errorBoundaryStatus,
      resources: this.resourceManager.getResourceStats(),
      activeTimeouts: TimeoutManager.getActiveTimeouts(),
      emergencyShutdown: this.emergencyShutdown.isShutdownInProgress(),
    };
  }

  public async initiateEmergencyShutdown(reason: string): Promise<void> {
    await this.emergencyShutdown.initiateEmergencyShutdown(reason);
  }
}

// Export singleton instance
export const systemResilienceOrchestrator = new SystemResilienceOrchestrator();
