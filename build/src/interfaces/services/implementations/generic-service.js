/**
 * Generic Service Implementation.
 *
 * A basic service implementation that can be used for simple services.
 * Or as a fallback when no specific service implementation is available.
 */
/**
 * @file Generic service implementation.
 */
import { BaseService } from './base-service.ts';
/**
 * Generic service that provides basic functionality.
 *
 * @example
 */
export class GenericService extends BaseService {
    operations = new Map();
    healthCheckFn;
    constructor(config) {
        super(config?.name, config?.type, config);
        // Add basic capabilities
        this.addCapability('execute');
        this.addCapability('health-check');
        this.addCapability('metrics');
    }
    // ============================================
    // BaseService Implementation
    // ============================================
    async doInitialize() {
        this.logger.info(`Initializing generic service: ${this.name}`);
        // Register default operations
        this.registerOperation('ping', async () => ({ pong: true, timestamp: new Date() }));
        this.registerOperation('status', async () => await this.getStatus());
        this.registerOperation('metrics', async () => await this.getMetrics());
        this.registerOperation('capabilities', async () => this.getCapabilities());
        // Initialize custom operations from config
        if (this.config.options?.operations) {
            Object.entries(this.config.options.operations).forEach(([name, handler]) => {
                if (typeof handler === 'function') {
                    this.registerOperation(name, handler);
                }
            });
        }
        // Set custom health check if provided
        if (this.config.options?.healthCheck && typeof this.config.options.healthCheck === 'function') {
            this.healthCheckFn = this.config.options.healthCheck;
        }
        this.logger.info(`Generic service ${this.name} initialized with ${this.operations.size} operations`);
    }
    async doStart() {
        this.logger.info(`Starting generic service: ${this.name}`);
        // Perform any startup tasks
        if (this.config.options?.onStart && typeof this.config.options.onStart === 'function') {
            await this.config.options.onStart();
        }
        this.logger.info(`Generic service ${this.name} started successfully`);
    }
    async doStop() {
        this.logger.info(`Stopping generic service: ${this.name}`);
        // Perform any shutdown tasks
        if (this.config.options?.onStop && typeof this.config.options.onStop === 'function') {
            await this.config.options.onStop();
        }
        this.logger.info(`Generic service ${this.name} stopped successfully`);
    }
    async doDestroy() {
        this.logger.info(`Destroying generic service: ${this.name}`);
        // Clear registered operations
        this.operations.clear();
        this.healthCheckFn = undefined;
        // Perform any cleanup tasks
        if (this.config.options?.onDestroy && typeof this.config.options.onDestroy === 'function') {
            await this.config.options.onDestroy();
        }
        this.logger.info(`Generic service ${this.name} destroyed successfully`);
    }
    async doHealthCheck() {
        try {
            // Use custom health check if provided
            if (this.healthCheckFn) {
                return await this.healthCheckFn();
            }
            // Default health check - just verify service is running
            return this.lifecycleStatus === 'running';
        }
        catch (error) {
            this.logger.error(`Health check failed for generic service ${this.name}:`, error);
            return false;
        }
    }
    async executeOperation(operation, params, options) {
        const handler = this.operations.get(operation);
        if (!handler) {
            throw new Error(`Operation '${operation}' not found in service ${this.name}`);
        }
        this.logger.debug(`Executing operation '${operation}' on service ${this.name}`);
        try {
            const result = await handler(params, options);
            return result;
        }
        catch (error) {
            this.logger.error(`Operation '${operation}' failed on service ${this.name}:`, error);
            throw error;
        }
    }
    // ============================================
    // Generic Service Specific Methods
    // ============================================
    /**
     * Register an operation handler.
     *
     * @param name
     * @param handler
     */
    registerOperation(name, handler) {
        this.operations.set(name, handler);
        this.addCapability(name);
        this.logger.debug(`Registered operation '${name}' for service ${this.name}`);
    }
    /**
     * Unregister an operation handler.
     *
     * @param name
     */
    unregisterOperation(name) {
        if (this.operations.delete(name)) {
            this.removeCapability(name);
            this.logger.debug(`Unregistered operation '${name}' from service ${this.name}`);
        }
    }
    /**
     * Get list of registered operations.
     */
    getRegisteredOperations() {
        return Array.from(this.operations.keys());
    }
    /**
     * Check if operation is registered.
     *
     * @param name
     */
    hasOperation(name) {
        return this.operations.has(name);
    }
    /**
     * Set custom health check function.
     *
     * @param healthCheckFn
     */
    setHealthCheck(healthCheckFn) {
        this.healthCheckFn = healthCheckFn;
        this.logger.debug(`Set custom health check for service ${this.name}`);
    }
    /**
     * Execute multiple operations in sequence.
     *
     * @param operations
     */
    async executeSequence(operations) {
        const results = [];
        for (const op of operations) {
            try {
                const response = await this.execute(op.name, op.params);
                results.push(response?.data);
            }
            catch (error) {
                this.logger.error(`Sequence execution failed at operation '${op.name}':`, error);
                throw error;
            }
        }
        return results;
    }
    /**
     * Execute multiple operations in parallel.
     *
     * @param operations
     */
    async executeParallel(operations) {
        const promises = operations.map((op) => this.execute(op.name, op.params));
        try {
            const responses = await Promise.all(promises);
            return responses?.map((response) => response?.data);
        }
        catch (error) {
            this.logger.error(`Parallel execution failed:`, error);
            throw error;
        }
    }
    /**
     * Execute operations with specific strategy.
     *
     * @param operations
     * @param strategy
     */
    async executeBatch(operations, strategy = 'sequence') {
        if (strategy === 'parallel') {
            return await this.executeParallel(operations);
        }
        else {
            return await this.executeSequence(operations);
        }
    }
}
export default GenericService;
