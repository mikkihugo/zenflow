import { getLogger } from '../config/logging-config.ts';
import { errorMonitor } from './error-monitoring.ts';
import { AgentError, SystemError, TimeoutError, WASMMemoryError, } from './errors.ts';
const logger = getLogger('SystemResilience');
export class ResourceManager {
    resources = new Map();
    resourcesByType = new Map();
    resourcesByOwner = new Map();
    limits;
    cleanupInterval = null;
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
        ['memory', 'file', 'network', 'wasm', 'agent', 'database'].forEach((type) => {
            this.resourcesByType.set(type, new Set());
        });
        this.startCleanupMonitoring();
    }
    async allocateResource(type, owner, size, cleanup) {
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
    async releaseResource(resourceId) {
        const resource = this.resources.get(resourceId);
        if (!resource) {
            logger.warn(`Attempted to release non-existent resource: ${resourceId}`);
            return;
        }
        try {
            await resource.cleanup();
            this.resources.delete(resourceId);
            this.resourcesByType.get(resource.type)?.delete(resourceId);
            this.resourcesByOwner.get(resource.owner)?.delete(resourceId);
            logger.debug(`Resource released: ${resourceId} (${resource.type})`);
        }
        catch (error) {
            logger.error(`Failed to release resource ${resourceId}:`, error);
            this.resources.delete(resourceId);
            this.resourcesByType.get(resource.type)?.delete(resourceId);
            this.resourcesByOwner.get(resource.owner)?.delete(resourceId);
            throw new SystemError(`Resource cleanup failed: ${error instanceof Error ? error.message : String(error)}`, 'RESOURCE_CLEANUP_FAILED', 'high');
        }
    }
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
    async enforceResourceLimits(type, size) {
        const currentCount = this.resourcesByType.get(type)?.size ?? 0;
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
        if (type === 'memory' && size) {
            const currentMemoryMB = this.getCurrentMemoryUsage();
            if (currentMemoryMB + size / 1024 / 1024 > this.limits.maxMemoryMB) {
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
        return totalMemory / 1024 / 1024;
    }
    async cleanupOldResources() {
        const now = Date.now();
        const oldResourcesThreshold = 30 * 60 * 1000;
        const oldResources = Array.from(this.resources.values())
            .filter((resource) => now - resource.allocated > oldResourcesThreshold)
            .sort((a, b) => a.allocated - b.allocated)
            .slice(0, 10);
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
                const stats = this.getResourceStats();
                if (stats.totalResources > 0) {
                    logger.debug('Resource usage stats:', stats);
                }
            }
            catch (error) {
                logger.error('Resource cleanup monitoring error:', error);
            }
        }, 5 * 60 * 1000);
    }
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
    async emergencyCleanup() {
        logger.warn('Emergency resource cleanup initiated');
        const releasePromises = Array.from(this.resources.keys()).map((resourceId) => this.releaseResource(resourceId).catch((error) => {
            logger.error(`Emergency cleanup failed for resource ${resourceId}:`, error);
        }));
        await Promise.allSettled(releasePromises);
        logger.info('Emergency resource cleanup completed');
    }
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}
export class Bulkhead {
    config;
    currentExecutions = 0;
    queue = [];
    totalExecutions = 0;
    successfulExecutions = 0;
    failedExecutions = 0;
    timeoutExecutions = 0;
    executionTimes = [];
    constructor(config) {
        this.config = config;
    }
    async execute(operation, priority = this.config.priority) {
        return new Promise((resolve, reject) => {
            if (this.currentExecutions < this.config.maxConcurrentExecutions) {
                this.executeOperation(operation, resolve, reject);
            }
            else {
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
        if (this.queue.length > 0 &&
            this.currentExecutions < this.config.maxConcurrentExecutions) {
            const next = this.queue.shift();
            const queuedTime = Date.now() - next.enqueuedAt;
            if (queuedTime > this.config.timeoutMs) {
                this.timeoutExecutions++;
                next.reject(new TimeoutError(`Bulkhead queue timeout in ${this.config.name}`, this.config.timeoutMs, queuedTime));
                this.processQueue();
                return;
            }
            this.executeOperation(next.operation, next.resolve, next.reject);
        }
    }
    getMetrics() {
        const avgExecutionTime = this.executionTimes.length > 0
            ? this.executionTimes.reduce((a, b) => a + b, 0) /
                this.executionTimes.length
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
    async drain() {
        while (this.currentExecutions > 0 || this.queue.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
}
export class TimeoutManager {
    static timeouts = new Map();
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
            const timeout = TimeoutManager.timeouts.get(timeoutId);
            if (timeout) {
                clearTimeout(timeout);
                TimeoutManager.timeouts.delete(timeoutId);
            }
            return result;
        }
        catch (error) {
            const timeout = TimeoutManager.timeouts.get(timeoutId);
            if (timeout) {
                clearTimeout(timeout);
                TimeoutManager.timeouts.delete(timeoutId);
            }
            throw error;
        }
    }
    static clearAllTimeouts() {
        for (const [_id, timeout] of TimeoutManager.timeouts.entries()) {
            clearTimeout(timeout);
        }
        TimeoutManager.timeouts.clear();
    }
    static getActiveTimeouts() {
        return TimeoutManager.timeouts.size;
    }
}
export class ErrorBoundary {
    config;
    errors = [];
    breached = false;
    recoveryAttempts = 0;
    constructor(config) {
        this.config = config;
    }
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
        this.errors.push({ error, timestamp: now });
        this.errors = this.errors.filter((e) => now - e.timestamp <= this.config.windowMs);
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
    async attemptRecovery() {
        if (!this.breached) {
            return true;
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
            logger.warn(`Error boundary '${this.config.name}' recovery attempt ${this.recoveryAttempts} failed`);
            return false;
        }
        catch (recoveryError) {
            logger.error(`Error boundary '${this.config.name}' recovery attempt ${this.recoveryAttempts} threw error:`, recoveryError);
            return false;
        }
    }
    getStatus() {
        return {
            name: this.config.name,
            breached: this.breached,
            errorCount: this.errors.length,
            recoveryAttempts: this.recoveryAttempts,
            windowMs: this.config.windowMs,
        };
    }
    reset() {
        this.errors = [];
        this.breached = false;
        this.recoveryAttempts = 0;
        logger.info(`Error boundary '${this.config.name}' reset`);
    }
}
export class EmergencyShutdownSystem {
    procedures = [];
    shutdownInProgress = false;
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
        errorMonitor.reportError(new SystemError(`Emergency shutdown: ${reason}`, 'EMERGENCY_SHUTDOWN', 'critical'));
        for (const procedure of this.procedures) {
            try {
                logger.info(`Executing emergency procedure: ${procedure.name}`);
                await TimeoutManager.withTimeout(procedure.procedure, procedure.timeoutMs, `emergency_${procedure.name}`);
                logger.info(`Emergency procedure completed: ${procedure.name}`);
            }
            catch (error) {
                logger.error(`Emergency procedure failed: ${procedure.name}`, error);
            }
        }
        logger.info('Emergency shutdown procedures completed');
    }
    isShutdownInProgress() {
        return this.shutdownInProgress;
    }
}
export class SystemResilienceOrchestrator {
    resourceManager;
    bulkheads = new Map();
    errorBoundaries = new Map();
    emergencyShutdown;
    constructor(resourceLimits) {
        this.resourceManager = new ResourceManager(resourceLimits);
        this.emergencyShutdown = new EmergencyShutdownSystem();
        this.setupDefaultBulkheads();
        this.setupDefaultErrorBoundaries();
        this.setupDefaultEmergencyProcedures();
    }
    setupDefaultBulkheads() {
        this.bulkheads.set('fact', new Bulkhead({
            name: 'FACT System',
            maxConcurrentExecutions: 5,
            queueSize: 20,
            timeoutMs: 60000,
            priority: 5,
        }));
        this.bulkheads.set('rag', new Bulkhead({
            name: 'RAG System',
            maxConcurrentExecutions: 3,
            queueSize: 15,
            timeoutMs: 30000,
            priority: 7,
        }));
        this.bulkheads.set('swarm', new Bulkhead({
            name: 'Swarm Coordination',
            maxConcurrentExecutions: 10,
            queueSize: 50,
            timeoutMs: 45000,
            priority: 8,
        }));
        this.bulkheads.set('wasm', new Bulkhead({
            name: 'WASM Execution',
            maxConcurrentExecutions: 2,
            queueSize: 10,
            timeoutMs: 20000,
            priority: 3,
        }));
    }
    setupDefaultErrorBoundaries() {
        this.errorBoundaries.set('fact', new ErrorBoundary({
            name: 'FACT System',
            maxErrors: 5,
            windowMs: 5 * 60 * 1000,
            onBreach: async (errors) => {
                logger.error('FACT system error boundary breached', {
                    errorCount: errors.length,
                });
            },
            recovery: async () => {
                return true;
            },
        }));
        this.errorBoundaries.set('swarm', new ErrorBoundary({
            name: 'Swarm Coordination',
            maxErrors: 10,
            windowMs: 3 * 60 * 1000,
            onBreach: async (errors) => {
                logger.error('Swarm coordination error boundary breached', {
                    errorCount: errors.length,
                });
            },
            recovery: async () => {
                return true;
            },
        }));
    }
    setupDefaultEmergencyProcedures() {
        this.emergencyShutdown.addProcedure({
            name: 'stop_operations',
            priority: 1,
            timeoutMs: 5000,
            procedure: async () => {
                const drainPromises = Array.from(this.bulkheads.values()).map((b) => b.drain());
                await Promise.allSettled(drainPromises);
            },
        });
        this.emergencyShutdown.addProcedure({
            name: 'clear_timeouts',
            priority: 2,
            timeoutMs: 2000,
            procedure: async () => {
                TimeoutManager.clearAllTimeouts();
            },
        });
        this.emergencyShutdown.addProcedure({
            name: 'cleanup_resources',
            priority: 3,
            timeoutMs: 10000,
            procedure: async () => {
                await this.resourceManager.emergencyCleanup();
            },
        });
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
    getBulkhead(name) {
        return this.bulkheads.get(name);
    }
    getErrorBoundary(name) {
        return this.errorBoundaries.get(name);
    }
    getResourceManager() {
        return this.resourceManager;
    }
    async executeWithResilience(operation, options) {
        let wrappedOperation = operation;
        if (options?.timeoutMs) {
            const timeoutOperation = wrappedOperation;
            wrappedOperation = () => TimeoutManager.withTimeout(timeoutOperation, options.timeoutMs, options.operationName || 'resilient_operation');
        }
        if (options?.errorBoundary) {
            const errorBoundary = this.errorBoundaries.get(options.errorBoundary);
            if (errorBoundary) {
                const boundaryOperation = wrappedOperation;
                wrappedOperation = () => errorBoundary.execute(boundaryOperation);
            }
        }
        if (options?.bulkhead) {
            const bulkhead = this.bulkheads.get(options.bulkhead);
            if (bulkhead) {
                return await bulkhead.execute(wrappedOperation);
            }
        }
        return await wrappedOperation();
    }
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
    async initiateEmergencyShutdown(reason) {
        await this.emergencyShutdown.initiateEmergencyShutdown(reason);
    }
}
export const systemResilienceOrchestrator = new SystemResilienceOrchestrator();
//# sourceMappingURL=system-resilience.js.map