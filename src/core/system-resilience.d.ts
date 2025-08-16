/**
 * System Resilience Patterns for Claude-Zen.
 *
 * Implements advanced resilience patterns for distributed swarm systems.
 * Including bulkheads, timeouts, resource cleanup, and emergency procedures.
 */
/**
 * @file System-resilience implementation.
 */
/**
 * Represents a managed system resource with cleanup capabilities.
 *
 * @interface ResourceHandle
 * @example
 * ```typescript
 * const handle: ResourceHandle = {
 *   id: 'mem_12345',
 *   type: 'memory',
 *   allocated: Date.now(),
 *   size: 1024,
 *   cleanup: async () => { return Promise.resolve(); },
 *   owner: 'agent-worker'
 * };
 * ```
 */
export interface ResourceHandle {
    /** Unique identifier for the resource. */
    id: string;
    /** Type of resource being managed. */
    type: 'memory' | 'file' | 'network' | 'wasm' | 'agent' | 'database';
    /** Timestamp when resource was allocated. */
    allocated: number;
    /** Size of resource in bytes (optional). */
    size?: number;
    /** Cleanup function to release the resource. */
    cleanup: () => Promise<void>;
    /** Component or operation that owns this resource. */
    owner: string;
}
/**
 * System resource limits configuration.
 *
 * @interface ResourceLimits
 * @example
 * ```typescript
 * const limits: ResourceLimits = {
 *   maxMemoryMB: 512,
 *   maxFileHandles: 1000,
 *   maxNetworkConnections: 100,
 *   maxWASMInstances: 10,
 *   maxAgents: 50,
 *   maxDatabaseConnections: 20
 * };
 * ```
 */
export interface ResourceLimits {
    /** Maximum memory usage in megabytes. */
    maxMemoryMB: number;
    /** Maximum number of file handles. */
    maxFileHandles: number;
    /** Maximum number of network connections. */
    maxNetworkConnections: number;
    /** Maximum number of WASM instances. */
    maxWASMInstances: number;
    /** Maximum number of agents. */
    maxAgents: number;
    /** Maximum number of database connections. */
    maxDatabaseConnections: number;
}
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
export declare class ResourceManager {
    private resources;
    private resourcesByType;
    private resourcesByOwner;
    private limits;
    private cleanupInterval;
    /**
     * Creates a new ResourceManager instance.
     *
     * @param limits - Partial resource limits configuration.
     */
    constructor(limits?: Partial<ResourceLimits>);
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
    allocateResource(type: ResourceHandle['type'], owner: string, size?: number, cleanup?: () => Promise<void>): Promise<string>;
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
    releaseResource(resourceId: string): Promise<void>;
    /**
     * Releases all resources owned by a specific component or operation.
     *
     * @param owner - Owner identifier to release resources for.
     * @example
     * ```typescript
     * await manager.releaseResourcesByOwner('worker-agent-123');
     * ```
     */
    releaseResourcesByOwner(owner: string): Promise<void>;
    /**
     * Enforces resource limits before allocation.
     *
     * @private
     * @param type - Type of resource to check limits for.
     * @param size - Size of resource in bytes (optional).
     * @throws {SystemError} When resource limits would be exceeded.
     */
    private enforceResourceLimits;
    private getCurrentMemoryUsage;
    private cleanupOldResources;
    private startCleanupMonitoring;
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
    getResourceStats(): {
        totalResources: number;
        resourcesByType: Record<string, number>;
        memoryUsageMB: number;
        oldestResource: number;
    };
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
    emergencyCleanup(): Promise<void>;
    /**
     * Stops the resource manager and cleanup monitoring.
     *
     * @example
     * ```typescript
     * manager.stop();
     * ```
     */
    stop(): void;
}
/**
 * Configuration for bulkhead pattern implementation.
 *
 * @interface BulkheadConfig
 * @example
 * ```typescript
 * const config: BulkheadConfig = {
 *   name: 'API Requests',
 *   maxConcurrentExecutions: 10,
 *   queueSize: 50,
 *   timeoutMs: 30000,
 *   priority: 5
 * };
 * ```
 */
export interface BulkheadConfig {
    /** Name of the bulkhead for identification. */
    name: string;
    /** Maximum number of concurrent executions allowed. */
    maxConcurrentExecutions: number;
    /** Maximum size of the operation queue. */
    queueSize: number;
    /** Timeout in milliseconds for operations. */
    timeoutMs: number;
    /** Priority level (higher numbers = higher priority). */
    priority: number;
}
/**
 * Performance metrics for a bulkhead instance.
 *
 * @interface BulkheadMetrics
 * @example
 * ```typescript
 * const metrics = bulkhead.getMetrics();
 * console.log(`Success rate: ${metrics.successfulExecutions / metrics.totalExecutions}`);
 * ```
 */
export interface BulkheadMetrics {
    /** Name of the bulkhead. */
    name: string;
    /** Current number of executing operations. */
    currentExecutions: number;
    /** Number of operations in queue. */
    queuedExecutions: number;
    /** Total operations processed. */
    totalExecutions: number;
    /** Number of successful executions. */
    successfulExecutions: number;
    /** Number of failed executions. */
    failedExecutions: number;
    /** Number of timed-out executions. */
    timeoutExecutions: number;
    /** Average execution time in milliseconds. */
    averageExecutionTime: number;
    /** Maximum execution time recorded. */
    maxExecutionTime: number;
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
export declare class Bulkhead {
    private config;
    private currentExecutions;
    private queue;
    private totalExecutions;
    private successfulExecutions;
    private failedExecutions;
    private timeoutExecutions;
    private executionTimes;
    /**
     * Creates a new Bulkhead instance.
     *
     * @param config - Bulkhead configuration.
     */
    constructor(config: BulkheadConfig);
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
    execute<T>(operation: () => Promise<T>, priority?: number): Promise<T>;
    private executeOperation;
    private processQueue;
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
    getMetrics(): BulkheadMetrics;
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
    drain(): Promise<void>;
}
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
export declare class TimeoutManager {
    private static timeouts;
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
    static withTimeout<T>(operation: () => Promise<T>, timeoutMs: number, operationName?: string): Promise<T>;
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
    static clearAllTimeouts(): void;
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
    static getActiveTimeouts(): number;
}
/**
 * Configuration for error boundary implementation.
 *
 * @interface ErrorBoundaryConfig
 * @example
 * ```typescript
 * const config: ErrorBoundaryConfig = {
 *   name: 'API Service',
 *   maxErrors: 5,
 *   windowMs: 60000, // 1 minute
 *   onBreach: async (errors) => {
 *     console.error('Service breached:', errors.length);
 *   },
 *   recovery: async () => {
 *     return await healthCheck();
 *   }
 * };
 * ```
 */
export interface ErrorBoundaryConfig {
    /** Name of the error boundary for identification. */
    name: string;
    /** Maximum errors allowed within the time window. */
    maxErrors: number;
    /** Time window in milliseconds for error counting. */
    windowMs: number;
    /** Callback when error boundary is breached. */
    onBreach: (errors: Error[]) => Promise<void>;
    /** Recovery function to attempt boundary reset. */
    recovery: () => Promise<boolean>;
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
export declare class ErrorBoundary {
    private config;
    private errors;
    private breached;
    private recoveryAttempts;
    /**
     * Creates a new ErrorBoundary instance.
     *
     * @param config - Error boundary configuration.
     */
    constructor(config: ErrorBoundaryConfig);
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
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private recordError;
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
    attemptRecovery(): Promise<boolean>;
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
    getStatus(): {
        name: string;
        breached: boolean;
        errorCount: number;
        recoveryAttempts: number;
        windowMs: number;
    };
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
    reset(): void;
}
/**
 * Emergency shutdown procedure definition.
 *
 * @interface EmergencyProcedure
 * @example
 * ```typescript
 * const procedure: EmergencyProcedure = {
 *   name: 'cleanup-database',
 *   priority: 1, // executes first
 *   timeoutMs: 5000,
 *   procedure: async () => {
 *     await database.close();
 *   }
 * };
 * ```
 */
export interface EmergencyProcedure {
    /** Name of the emergency procedure. */
    name: string;
    /** Priority (lower numbers execute first). */
    priority: number;
    /** Async procedure to execute during shutdown. */
    procedure: () => Promise<void>;
    /** Timeout for procedure execution. */
    timeoutMs: number;
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
export declare class EmergencyShutdownSystem {
    private procedures;
    private shutdownInProgress;
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
    addProcedure(procedure: EmergencyProcedure): void;
    initiateEmergencyShutdown(reason: string): Promise<void>;
    isShutdownInProgress(): boolean;
}
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
export declare class SystemResilienceOrchestrator {
    private resourceManager;
    private bulkheads;
    private errorBoundaries;
    emergencyShutdown: EmergencyShutdownSystem;
    /**
     * Creates a new SystemResilienceOrchestrator instance.
     *
     * @param resourceLimits - Optional resource limits configuration.
     */
    constructor(resourceLimits?: Partial<ResourceLimits>);
    private setupDefaultBulkheads;
    private setupDefaultErrorBoundaries;
    private setupDefaultEmergencyProcedures;
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
    getBulkhead(name: string): Bulkhead | undefined;
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
    getErrorBoundary(name: string): ErrorBoundary | undefined;
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
    getResourceManager(): ResourceManager;
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
    executeWithResilience<T>(operation: () => Promise<T>, options: {
        bulkhead?: string;
        errorBoundary?: string;
        timeoutMs?: number;
        operationName?: string;
    }): Promise<T>;
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
    getSystemStatus(): {
        bulkheads: Record<string, BulkheadMetrics>;
        errorBoundaries: Record<string, unknown>;
        resources: unknown;
        activeTimeouts: number;
        emergencyShutdown: boolean;
    };
    /**
     * Initiates emergency shutdown of the entire system.
     *
     * @param reason - Reason for emergency shutdown.
     * @example
     * ```typescript
     * await orchestrator.initiateEmergencyShutdown('Critical memory leak detected');
     * ```
     */
    initiateEmergencyShutdown(reason: string): Promise<void>;
}
export declare const systemResilienceOrchestrator: SystemResilienceOrchestrator;
//# sourceMappingURL=system-resilience.d.ts.map