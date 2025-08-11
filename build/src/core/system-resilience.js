/**
 * System Resilience Patterns for Claude-Zen.
 *
 * Implements advanced resilience patterns for distributed swarm systems.
 * Including bulkheads, timeouts, resource cleanup, and emergency procedures.
 */
/**
 * @file System-resilience implementation.
 */
import { getLogger } from '../config/logging-config.ts';
import { errorMonitor } from './error-monitoring.ts';
import { AgentError, SystemError, TimeoutError, WASMMemoryError } from './errors.ts';
const logger = getLogger('SystemResilience');
/**
 * Manages system resources with automatic cleanup and limit enforcement.
 *
 * Tracks resource allocation, enforces limits, and provides cleanup mechanisms
 * to prevent resource leaks and system exhaustion.
 *
 * @class ResourceManager
 * @example
 * ```typescript
 * const manager = new ResourceManager({ maxMemoryMB: 1024 });
 *
 * // Allocate a resource
 * const resourceId = await manager.allocateResource(
 *   'memory',
 *   'my-component',
 *   1024 * 1024,
 *   async () => { await cleanup(); }
 * );
 *
 * // Release the resource
 * await manager.releaseResource(resourceId);
 * ```
 */
export class ResourceManager {
    resources = new Map();
    resourcesByType = new Map();
    resourcesByOwner = new Map();
    limits;
    cleanupInterval = null;
    /**
     * Creates a new ResourceManager instance.
     *
     * @param limits - Partial resource limits configuration.
     */
    constructor(limits = {}) {
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
    /**
     * Allocates a new system resource with tracking and limits enforcement.
     *
     * @param type - Type of resource to allocate.
     * @param owner - Component or operation that owns the resource.
     * @param size - Size of resource in bytes (optional).
     * @param cleanup - Cleanup function to release the resource (optional).
     * @returns Promise resolving to unique resource identifier.
     * @throws {SystemError} When resource limits would be exceeded.
     * @example
     * ```typescript
     * const resourceId = await manager.allocateResource(
     *   'memory',
     *   'worker-agent',
     *   1024 * 1024, // 1MB
     *   async () => {
     *     // Custom cleanup logic
     *   }
     * );
     * ```
     */
    async allocateResource(type, owner, size, cleanup) {
        // Check limits before allocation
        await this.enforceResourceLimits(type, size);
        const resourceId = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const resource = {
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
        logger.debug(`Resource allocated: ${resourceId} (${type}) for ${owner}`, {
            size,
        });
        return resourceId;
    }
    /**
     * Releases a previously allocated resource and performs cleanup.
     *
     * @param resourceId - Unique identifier of resource to release.
     * @throws {SystemError} When resource cleanup fails.
     * @example
     * ```typescript
     * await manager.releaseResource('memory_12345_abc');
     * ```
     */
    async releaseResource(resourceId) {
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
        }
        catch (error) {
            logger.error(`Failed to release resource ${resourceId}:`, error);
            // Force remove from tracking even if cleanup failed
            this.resources.delete(resourceId);
            this.resourcesByType.get(resource.type)?.delete(resourceId);
            this.resourcesByOwner.get(resource.owner)?.delete(resourceId);
            throw new SystemError(`Resource cleanup failed: ${error instanceof Error ? error.message : String(error)}`, 'RESOURCE_CLEANUP_FAILED', 'high');
        }
    }
    /**
     * Releases all resources owned by a specific component or operation.
     *
     * @param owner - Owner identifier to release resources for.
     * @example
     * ```typescript
     * await manager.releaseResourcesByOwner('worker-agent-123');
     * ```
     */
    async releaseResourcesByOwner(owner) {
        const ownerResources = this.resourcesByOwner.get(owner);
        if (!ownerResources || ownerResources.size === 0) {
            return;
        }
        logger.info(`Releasing ${ownerResources.size} resources for owner: ${owner}`);
        const releasePromises = Array.from(ownerResources).map((resourceId) => this.releaseResource(resourceId).catch((error) => {
            logger.error(`Failed to release resource ${resourceId} for owner ${owner}:`, error);
        }));
        await Promise.allSettled(releasePromises);
    }
    /**
     * Enforces resource limits before allocation.
     *
     * @private
     * @param type - Type of resource to check limits for.
     * @param size - Size of resource in bytes (optional).
     * @throws {SystemError} When resource limits would be exceeded.
     */
    async enforceResourceLimits(type, size) {
        const currentCount = this.resourcesByType.get(type)?.size ?? 0;
        // Check count limits
        switch (type) {
            case 'file':
                if (currentCount >= this.limits.maxFileHandles) {
                    throw new SystemError(`File handle limit exceeded: ${currentCount}/${this.limits.maxFileHandles}`, 'RESOURCE_LIMIT_EXCEEDED', 'high');
                }
                break;
            case 'network':
                if (currentCount >= this.limits.maxNetworkConnections) {
                    throw new SystemError(`Network connection limit exceeded: ${currentCount}/${this.limits.maxNetworkConnections}`, 'RESOURCE_LIMIT_EXCEEDED', 'high');
                }
                break;
            case 'wasm':
                if (currentCount >= this.limits.maxWASMInstances) {
                    throw new WASMMemoryError(`WASM instance limit exceeded: ${currentCount}/${this.limits.maxWASMInstances}`, size || 0, this.limits.maxWASMInstances);
                }
                break;
            case 'agent':
                if (currentCount >= this.limits.maxAgents) {
                    throw new AgentError(`Agent limit exceeded: ${currentCount}/${this.limits.maxAgents}`, undefined, undefined, 'high');
                }
                break;
            case 'database':
                if (currentCount >= this.limits.maxDatabaseConnections) {
                    throw new SystemError(`Database connection limit exceeded: ${currentCount}/${this.limits.maxDatabaseConnections}`, 'RESOURCE_LIMIT_EXCEEDED', 'high');
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
                    throw new SystemError(`Memory limit would be exceeded: ${newMemoryMB + size / 1024 / 1024}MB > ${this.limits.maxMemoryMB}MB`, 'MEMORY_LIMIT_EXCEEDED', 'critical');
                }
            }
        }
    }
    getCurrentMemoryUsage() {
        let totalMemory = 0;
        for (const resource of this.resources.values()) {
            if (resource.type === 'memory' && resource.size) {
                totalMemory += resource.size;
            }
        }
        return totalMemory / 1024 / 1024; // Convert to MB
    }
    async cleanupOldResources() {
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
                }
                catch (error) {
                    logger.error(`Failed to cleanup old resource ${resource.id}:`, error);
                }
            }
        }
    }
    startCleanupMonitoring() {
        this.cleanupInterval = setInterval(async () => {
            try {
                await this.cleanupOldResources();
                // Log resource usage statistics
                const stats = this.getResourceStats();
                if (stats.totalResources > 0) {
                    logger.debug('Resource usage stats:', stats);
                }
            }
            catch (error) {
                logger.error('Resource cleanup monitoring error:', error);
            }
        }, 5 * 60 * 1000); // Every 5 minutes
    }
    /**
     * Gets current resource usage statistics.
     *
     * @returns Object containing resource statistics.
     * @example
     * ```typescript
     * const stats = manager.getResourceStats();
     * console.log(`Total resources: ${stats.totalResources}`);
     * console.log(`Memory usage: ${stats.memoryUsageMB}MB`);
     * ```
     */
    getResourceStats() {
        const resourcesByType = {};
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
    /**
     * Performs emergency cleanup of all resources.
     *
     * Used during system shutdown or emergency situations.
     * Attempts to release all resources regardless of individual failures.
     *
     * @example
     * ```typescript
     * await manager.emergencyCleanup();
     * ```
     */
    async emergencyCleanup() {
        logger.warn('Emergency resource cleanup initiated');
        const releasePromises = Array.from(this.resources.keys()).map((resourceId) => this.releaseResource(resourceId).catch((error) => {
            logger.error(`Emergency cleanup failed for resource ${resourceId}:`, error);
        }));
        await Promise.allSettled(releasePromises);
        logger.info('Emergency resource cleanup completed');
    }
    /**
     * Stops the resource manager and cleanup monitoring.
     *
     * @example
     * ```typescript
     * manager.stop();
     * ```
     */
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}
/**
 * Bulkhead pattern implementation for isolating system resources.
 *
 * Prevents cascading failures by limiting concurrent executions and
 * providing queuing with timeout and priority support.
 *
 * @class Bulkhead
 * @example
 * ```typescript
 * const bulkhead = new Bulkhead({
 *   name: 'Database Operations',
 *   maxConcurrentExecutions: 5,
 *   queueSize: 20,
 *   timeoutMs: 30000,
 *   priority: 7
 * });
 *
 * const result = await bulkhead.execute(async () => {
 *   return await database.query('SELECT * FROM users');
 * }, 8); // higher priority
 * ```
 */
export class Bulkhead {
    config;
    currentExecutions = 0;
    queue = [];
    totalExecutions = 0;
    successfulExecutions = 0;
    failedExecutions = 0;
    timeoutExecutions = 0;
    executionTimes = [];
    /**
     * Creates a new Bulkhead instance.
     *
     * @param config - Bulkhead configuration.
     */
    constructor(config) {
        this.config = config;
    }
    /**
     * Executes an operation within the bulkhead's constraints.
     *
     * @template T
     * @param operation - Async operation to execute.
     * @param priority - Operation priority (defaults to bulkhead priority).
     * @returns Promise resolving to operation result.
     * @throws {SystemError} When queue is full or operation fails.
     * @example
     * ```typescript
     * const result = await bulkhead.execute(
     *   async () => await expensiveOperation(),
     *   10 // high priority
     * );
     * ```
     */
    async execute(operation, priority = this.config.priority) {
        return new Promise((resolve, reject) => {
            // Check if we can execute immediately
            if (this.currentExecutions < this.config.maxConcurrentExecutions) {
                this.executeOperation(operation, resolve, reject);
            }
            else {
                // Queue the operation
                if (this.queue.length >= this.config.queueSize) {
                    reject(new SystemError(`Bulkhead queue full for ${this.config.name}`, 'BULKHEAD_QUEUE_FULL', 'high'));
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
    async executeOperation(operation, resolve, reject) {
        this.currentExecutions++;
        this.totalExecutions++;
        const startTime = Date.now();
        const timeoutId = setTimeout(() => {
            this.timeoutExecutions++;
            this.currentExecutions--;
            reject(new TimeoutError(`Bulkhead operation timeout in ${this.config.name}`, this.config.timeoutMs, Date.now() - startTime));
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
        }
        catch (error) {
            clearTimeout(timeoutId);
            this.failedExecutions++;
            this.currentExecutions--;
            const executionTime = Date.now() - startTime;
            this.executionTimes.push(executionTime);
            reject(error);
        }
        finally {
            this.processQueue();
        }
    }
    processQueue() {
        if (this.queue.length > 0 && this.currentExecutions < this.config.maxConcurrentExecutions) {
            const next = this.queue.shift();
            // Check if queued operation has timed out
            const queuedTime = Date.now() - next.enqueuedAt;
            if (queuedTime > this.config.timeoutMs) {
                this.timeoutExecutions++;
                next.reject(new TimeoutError(`Bulkhead queue timeout in ${this.config.name}`, this.config.timeoutMs, queuedTime));
                this.processQueue(); // Try next in queue
                return;
            }
            this.executeOperation(next.operation, next.resolve, next.reject);
        }
    }
    /**
     * Gets current bulkhead performance metrics.
     *
     * @returns Bulkhead performance metrics.
     * @example
     * ```typescript
     * const metrics = bulkhead.getMetrics();
     * console.log(`Queue utilization: ${metrics.queuedExecutions}/${config.queueSize}`);
     * ```
     */
    getMetrics() {
        const avgExecutionTime = this.executionTimes.length > 0
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
    /**
     * Drains the bulkhead by waiting for all operations to complete.
     *
     * @returns Promise that resolves when all operations are finished.
     * @example
     * ```typescript
     * await bulkhead.drain();
     * console.log('All operations completed');
     * ```
     */
    async drain() {
        // Wait for all current executions to complete and clear queue
        while (this.currentExecutions > 0 || this.queue.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
}
// ===============================
// Timeout Management
// ===============================
/**
 * Manages operation timeouts with automatic cleanup.
 *
 * Provides timeout functionality for async operations with automatic
 * cleanup and tracking of active timeouts.
 *
 * @class TimeoutManager
 * @example
 * ```typescript
 * // Execute operation with timeout
 * const result = await TimeoutManager.withTimeout(
 *   async () => await longRunningOperation(),
 *   5000, // 5 second timeout
 *   'data-processing'
 * );
 * ```
 */
export class TimeoutManager {
    static timeouts = new Map();
    /**
     * Executes an operation with a timeout.
     *
     * @template T
     * @param operation - Async operation to execute.
     * @param timeoutMs - Timeout in milliseconds.
     * @param operationName - Name for debugging (optional).
     * @returns Promise resolving to operation result.
     * @throws {TimeoutError} When operation exceeds timeout.
     * @example
     * ```typescript
     * const data = await TimeoutManager.withTimeout(
     *   () => fetch('/api/data'),
     *   10000,
     *   'api-fetch'
     * );
     * ```
     */
    static async withTimeout(operation, timeoutMs, operationName = 'unknown') {
        const timeoutId = `timeout_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const timeoutPromise = new Promise((_, reject) => {
            const timeout = setTimeout(() => {
                TimeoutManager.timeouts.delete(timeoutId);
                reject(new TimeoutError(`Operation '${operationName}' timed out after ${timeoutMs}ms`, timeoutMs));
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
        }
        catch (error) {
            // Clear timeout on error
            const timeout = TimeoutManager.timeouts.get(timeoutId);
            if (timeout) {
                clearTimeout(timeout);
                TimeoutManager.timeouts.delete(timeoutId);
            }
            throw error;
        }
    }
    /**
     * Clears all active timeouts.
     *
     * Used during emergency shutdown to prevent timeout callbacks.
     *
     * @example
     * ```typescript
     * TimeoutManager.clearAllTimeouts();
     * ```
     */
    static clearAllTimeouts() {
        for (const [_id, timeout] of TimeoutManager.timeouts.entries()) {
            clearTimeout(timeout);
        }
        TimeoutManager.timeouts.clear();
    }
    /**
     * Gets the number of active timeouts.
     *
     * @returns Number of currently active timeouts.
     * @example
     * ```typescript
     * const activeCount = TimeoutManager.getActiveTimeouts();
     * console.log(`${activeCount} operations are timing out`);
     * ```
     */
    static getActiveTimeouts() {
        return TimeoutManager.timeouts.size;
    }
}
/**
 * Error boundary implementation for containing and recovering from failures.
 *
 * Tracks errors within a time window and triggers breach handling and
 * recovery procedures when error thresholds are exceeded.
 *
 * @class ErrorBoundary
 * @example
 * ```typescript
 * const boundary = new ErrorBoundary({
 *   name: 'Database Service',
 *   maxErrors: 3,
 *   windowMs: 30000,
 *   onBreach: async (errors) => {
 *     await notifyAdmins('Database service failing');
 *   },
 *   recovery: async () => {
 *     return await reconnectDatabase();
 *   }
 * });
 *
 * try {
 *   await boundary.execute(() => database.query('SELECT 1'));
 * } catch (error) {
 *   // Error is tracked and boundary state updated
 * }
 * ```
 */
export class ErrorBoundary {
    config;
    errors = [];
    breached = false;
    recoveryAttempts = 0;
    /**
     * Creates a new ErrorBoundary instance.
     *
     * @param config - Error boundary configuration.
     */
    constructor(config) {
        this.config = config;
    }
    /**
     * Executes an operation within the error boundary.
     *
     * @template T
     * @param operation - Async operation to execute.
     * @returns Promise resolving to operation result.
     * @throws {SystemError} When boundary is breached.
     * @throws Original error from operation.
     * @example
     * ```typescript
     * const result = await boundary.execute(async () => {
     *   return await riskyOperation();
     * });
     * ```
     */
    async execute(operation) {
        if (this.breached) {
            throw new SystemError(`Error boundary '${this.config.name}' is breached`, 'ERROR_BOUNDARY_BREACHED', 'critical', {
                metadata: {
                    boundaryName: this.config.name,
                    errorCount: this.errors.length,
                },
            });
        }
        try {
            return await operation();
        }
        catch (error) {
            await this.recordError(error);
            throw error;
        }
    }
    async recordError(error) {
        const now = Date.now();
        // Add error to history
        this.errors.push({ error, timestamp: now });
        // Clean old errors outside window
        this.errors = this.errors.filter((e) => now - e.timestamp <= this.config.windowMs);
        // Check if we've breached the boundary
        if (this.errors.length >= this.config.maxErrors && !this.breached) {
            this.breached = true;
            logger.error(`Error boundary '${this.config.name}' breached with ${this.errors.length} errors`);
            try {
                await this.config.onBreach(this.errors.map((e) => e.error));
            }
            catch (breachError) {
                logger.error(`Error boundary breach handler failed for '${this.config.name}':`, breachError);
            }
        }
    }
    /**
     * Attempts to recover the error boundary from breached state.
     *
     * @returns Promise resolving to true if recovery succeeded.
     * @example
     * ```typescript
     * if (boundary.getStatus().breached) {
     *   const recovered = await boundary.attemptRecovery();
     *   console.log(`Recovery ${recovered ? 'succeeded' : 'failed'}`);
     * }
     * ```
     */
    async attemptRecovery() {
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
            }
            else {
                logger.warn(`Error boundary '${this.config.name}' recovery attempt ${this.recoveryAttempts} failed`);
                return false;
            }
        }
        catch (recoveryError) {
            logger.error(`Error boundary '${this.config.name}' recovery attempt ${this.recoveryAttempts} threw error:`, recoveryError);
            return false;
        }
    }
    /**
     * Gets current error boundary status.
     *
     * @returns Error boundary status information.
     * @example
     * ```typescript
     * const status = boundary.getStatus();
     * if (status.breached) {
     *   console.log(`Boundary breached with ${status.errorCount} errors`);
     * }
     * ```
     */
    getStatus() {
        return {
            name: this.config.name,
            breached: this.breached,
            errorCount: this.errors.length,
            recoveryAttempts: this.recoveryAttempts,
            windowMs: this.config.windowMs,
        };
    }
    /**
     * Resets the error boundary to initial state.
     *
     * Clears all error history and resets breach status.
     *
     * @example
     * ```typescript
     * boundary.reset();
     * console.log('Boundary reset to clean state');
     * ```
     */
    reset() {
        this.errors = [];
        this.breached = false;
        this.recoveryAttempts = 0;
        logger.info(`Error boundary '${this.config.name}' reset`);
    }
}
/**
 * Emergency shutdown system with ordered procedure execution.
 *
 * Manages emergency shutdown procedures with prioritized execution
 * and timeout handling for graceful system termination.
 *
 * @class EmergencyShutdownSystem
 * @example
 * ```typescript
 * const shutdown = new EmergencyShutdownSystem();
 *
 * shutdown.addProcedure({
 *   name: 'save-state',
 *   priority: 1,
 *   timeoutMs: 3000,
 *   procedure: async () => await saveApplicationState()
 * });
 *
 * // Initiate emergency shutdown
 * await shutdown.initiateEmergencyShutdown('Critical system error');
 * ```
 */
export class EmergencyShutdownSystem {
    procedures = [];
    shutdownInProgress = false;
    /**
     * Adds an emergency procedure to the shutdown sequence.
     *
     * @param procedure - Emergency procedure to add.
     * @example
     * ```typescript
     * shutdown.addProcedure({
     *   name: 'close-connections',
     *   priority: 2,
     *   timeoutMs: 2000,
     *   procedure: async () => await closeAllConnections()
     * });
     * ```
     */
    addProcedure(procedure) {
        this.procedures.push(procedure);
        this.procedures.sort((a, b) => a.priority - b.priority);
    }
    async initiateEmergencyShutdown(reason) {
        if (this.shutdownInProgress) {
            logger.warn('Emergency shutdown already in progress');
            return;
        }
        this.shutdownInProgress = true;
        logger.error(`Emergency shutdown initiated: ${reason}`);
        // Report emergency shutdown
        errorMonitor.reportError(new SystemError(`Emergency shutdown: ${reason}`, 'EMERGENCY_SHUTDOWN', 'critical'));
        // Execute shutdown procedures in priority order
        for (const procedure of this.procedures) {
            try {
                logger.info(`Executing emergency procedure: ${procedure.name}`);
                await TimeoutManager.withTimeout(procedure.procedure, procedure.timeoutMs, `emergency_${procedure.name}`);
                logger.info(`Emergency procedure completed: ${procedure.name}`);
            }
            catch (error) {
                logger.error(`Emergency procedure failed: ${procedure.name}`, error);
                // Continue with other procedures even if one fails
            }
        }
        logger.info('Emergency shutdown procedures completed');
    }
    isShutdownInProgress() {
        return this.shutdownInProgress;
    }
}
// ===============================
// System Resilience Orchestrator
// ===============================
/**
 * Main orchestrator for system resilience patterns.
 *
 * Coordinates resource management, bulkheads, error boundaries, and
 * emergency shutdown procedures for comprehensive system resilience.
 *
 * @class SystemResilienceOrchestrator
 * @example
 * ```typescript
 * const orchestrator = new SystemResilienceOrchestrator({
 *   maxMemoryMB: 1024,
 *   maxAgents: 100
 * });
 *
 * // Execute operation with resilience patterns
 * const result = await orchestrator.executeWithResilience(
 *   async () => await complexOperation(),
 *   {
 *     bulkhead: 'api',
 *     errorBoundary: 'service',
 *     timeoutMs: 30000,
 *     operationName: 'user-request'
 *   }
 * );
 * ```
 */
export class SystemResilienceOrchestrator {
    resourceManager;
    bulkheads = new Map();
    errorBoundaries = new Map();
    emergencyShutdown;
    /**
     * Creates a new SystemResilienceOrchestrator instance.
     *
     * @param resourceLimits - Optional resource limits configuration.
     */
    constructor(resourceLimits) {
        this.resourceManager = new ResourceManager(resourceLimits);
        this.emergencyShutdown = new EmergencyShutdownSystem();
        this.setupDefaultBulkheads();
        this.setupDefaultErrorBoundaries();
        this.setupDefaultEmergencyProcedures();
    }
    setupDefaultBulkheads() {
        // FACT system bulkhead
        this.bulkheads.set('fact', new Bulkhead({
            name: 'FACT System',
            maxConcurrentExecutions: 5,
            queueSize: 20,
            timeoutMs: 60000, // 1 minute
            priority: 5,
        }));
        // RAG system bulkhead
        this.bulkheads.set('rag', new Bulkhead({
            name: 'RAG System',
            maxConcurrentExecutions: 3,
            queueSize: 15,
            timeoutMs: 30000, // 30 seconds
            priority: 7,
        }));
        // Swarm coordination bulkhead
        this.bulkheads.set('swarm', new Bulkhead({
            name: 'Swarm Coordination',
            maxConcurrentExecutions: 10,
            queueSize: 50,
            timeoutMs: 45000, // 45 seconds
            priority: 8,
        }));
        // WASM execution bulkhead
        this.bulkheads.set('wasm', new Bulkhead({
            name: 'WASM Execution',
            maxConcurrentExecutions: 2,
            queueSize: 10,
            timeoutMs: 20000, // 20 seconds
            priority: 3,
        }));
    }
    setupDefaultErrorBoundaries() {
        // FACT system error boundary
        this.errorBoundaries.set('fact', new ErrorBoundary({
            name: 'FACT System',
            maxErrors: 5,
            windowMs: 5 * 60 * 1000, // 5 minutes
            onBreach: async (errors) => {
                logger.error('FACT system error boundary breached', {
                    errorCount: errors.length,
                });
                // Could implement FACT system restart logic here
            },
            recovery: async () => {
                // Implement FACT system health check
                return true;
            },
        }));
        // Swarm coordination error boundary
        this.errorBoundaries.set('swarm', new ErrorBoundary({
            name: 'Swarm Coordination',
            maxErrors: 10,
            windowMs: 3 * 60 * 1000, // 3 minutes
            onBreach: async (errors) => {
                logger.error('Swarm coordination error boundary breached', {
                    errorCount: errors.length,
                });
                // Could implement swarm restart logic here
            },
            recovery: async () => {
                // Implement swarm health check
                return true;
            },
        }));
    }
    setupDefaultEmergencyProcedures() {
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
    /**
     * Gets a bulkhead by name.
     *
     * @param name - Name of the bulkhead to retrieve.
     * @returns Bulkhead instance or undefined if not found.
     * @example
     * ```typescript
     * const apiBulkhead = orchestrator.getBulkhead('api');
     * if (apiBulkhead) {
     *   const metrics = apiBulkhead.getMetrics();
     * }
     * ```
     */
    getBulkhead(name) {
        return this.bulkheads.get(name);
    }
    /**
     * Gets an error boundary by name.
     *
     * @param name - Name of the error boundary to retrieve.
     * @returns ErrorBoundary instance or undefined if not found.
     * @example
     * ```typescript
     * const dbBoundary = orchestrator.getErrorBoundary('database');
     * if (dbBoundary) {
     *   const status = dbBoundary.getStatus();
     * }
     * ```
     */
    getErrorBoundary(name) {
        return this.errorBoundaries.get(name);
    }
    /**
     * Gets the resource manager instance.
     *
     * @returns ResourceManager instance.
     * @example
     * ```typescript
     * const manager = orchestrator.getResourceManager();
     * const stats = manager.getResourceStats();
     * ```
     */
    getResourceManager() {
        return this.resourceManager;
    }
    /**
     * Executes an operation with comprehensive resilience patterns.
     *
     * @template T
     * @param operation - Async operation to execute.
     * @param options.bulkhead - Name of bulkhead to use for execution isolation.
     * @param options.errorBoundary - Name of error boundary to use for failure handling.
     * @param options.timeoutMs - Timeout in milliseconds for the operation.
     * @param options.operationName - Name of the operation for debugging and logging.
     * @param options - Resilience options (bulkhead, error boundary, timeout, etc.).
     * @returns Promise resolving to operation result.
     * @example
     * ```typescript
     * const result = await orchestrator.executeWithResilience(
     *   async () => await apiCall(),
     *   {
     *     bulkhead: 'api',
     *     errorBoundary: 'external-service',
     *     timeoutMs: 10000,
     *     operationName: 'user-data-fetch'
     *   }
     * );
     * ```
     */
    async executeWithResilience(operation, options) {
        let wrappedOperation = operation;
        // Apply timeout if specified
        if (options?.timeoutMs) {
            const timeoutOperation = wrappedOperation;
            wrappedOperation = () => TimeoutManager.withTimeout(timeoutOperation, options.timeoutMs, options.operationName || 'resilient_operation');
        }
        // Apply error boundary if specified
        if (options?.errorBoundary) {
            const errorBoundary = this.errorBoundaries.get(options.errorBoundary);
            if (errorBoundary) {
                const boundaryOperation = wrappedOperation;
                wrappedOperation = () => errorBoundary.execute(boundaryOperation);
            }
        }
        // Apply bulkhead if specified
        if (options?.bulkhead) {
            const bulkhead = this.bulkheads.get(options.bulkhead);
            if (bulkhead) {
                return await bulkhead.execute(wrappedOperation);
            }
        }
        return await wrappedOperation();
    }
    /**
     * Gets comprehensive system resilience status.
     *
     * @returns System status including all resilience components.
     * @example
     * ```typescript
     * const status = orchestrator.getSystemStatus();
     * console.log(`Active timeouts: ${status.activeTimeouts}`);
     * console.log(`Total resources: ${status.resources.totalResources}`);
     * ```
     */
    getSystemStatus() {
        const bulkheadMetrics = {};
        for (const [name, bulkhead] of this.bulkheads.entries()) {
            bulkheadMetrics[name] = bulkhead.getMetrics();
        }
        const errorBoundaryStatus = {};
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
    /**
     * Initiates emergency shutdown of the entire system.
     *
     * @param reason - Reason for emergency shutdown.
     * @example
     * ```typescript
     * await orchestrator.initiateEmergencyShutdown('Critical memory leak detected');
     * ```
     */
    async initiateEmergencyShutdown(reason) {
        await this.emergencyShutdown.initiateEmergencyShutdown(reason);
    }
}
// Export singleton instance
export const systemResilienceOrchestrator = new SystemResilienceOrchestrator();
