import { BaseService } from './base-service.ts';
export class GenericService extends BaseService {
    operations = new Map();
    healthCheckFn;
    constructor(config) {
        super(config?.name, config?.type, config);
        this.addCapability('execute');
        this.addCapability('health-check');
        this.addCapability('metrics');
    }
    async doInitialize() {
        this.logger.info(`Initializing generic service: ${this.name}`);
        this.registerOperation('ping', async () => ({
            pong: true,
            timestamp: new Date(),
        }));
        this.registerOperation('status', async () => await this.getStatus());
        this.registerOperation('metrics', async () => await this.getMetrics());
        this.registerOperation('capabilities', async () => this.getCapabilities());
        if (this.config.options?.operations) {
            Object.entries(this.config.options.operations).forEach(([name, handler]) => {
                if (typeof handler === 'function') {
                    this.registerOperation(name, handler);
                }
            });
        }
        if (this.config.options?.healthCheck &&
            typeof this.config.options.healthCheck === 'function') {
            this.healthCheckFn = this.config.options.healthCheck;
        }
        this.logger.info(`Generic service ${this.name} initialized with ${this.operations.size} operations`);
    }
    async doStart() {
        this.logger.info(`Starting generic service: ${this.name}`);
        if (this.config.options?.onStart &&
            typeof this.config.options.onStart === 'function') {
            await this.config.options.onStart();
        }
        this.logger.info(`Generic service ${this.name} started successfully`);
    }
    async doStop() {
        this.logger.info(`Stopping generic service: ${this.name}`);
        if (this.config.options?.onStop &&
            typeof this.config.options.onStop === 'function') {
            await this.config.options.onStop();
        }
        this.logger.info(`Generic service ${this.name} stopped successfully`);
    }
    async doDestroy() {
        this.logger.info(`Destroying generic service: ${this.name}`);
        this.operations.clear();
        this.healthCheckFn = undefined;
        if (this.config.options?.onDestroy &&
            typeof this.config.options.onDestroy === 'function') {
            await this.config.options.onDestroy();
        }
        this.logger.info(`Generic service ${this.name} destroyed successfully`);
    }
    async doHealthCheck() {
        try {
            if (this.healthCheckFn) {
                return await this.healthCheckFn();
            }
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
    registerOperation(name, handler) {
        this.operations.set(name, handler);
        this.addCapability(name);
        this.logger.debug(`Registered operation '${name}' for service ${this.name}`);
    }
    unregisterOperation(name) {
        if (this.operations.delete(name)) {
            this.removeCapability(name);
            this.logger.debug(`Unregistered operation '${name}' from service ${this.name}`);
        }
    }
    getRegisteredOperations() {
        return Array.from(this.operations.keys());
    }
    hasOperation(name) {
        return this.operations.has(name);
    }
    setHealthCheck(healthCheckFn) {
        this.healthCheckFn = healthCheckFn;
        this.logger.debug(`Set custom health check for service ${this.name}`);
    }
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
    async executeBatch(operations, strategy = 'sequence') {
        if (strategy === 'parallel') {
            return await this.executeParallel(operations);
        }
        return await this.executeSequence(operations);
    }
}
export default GenericService;
//# sourceMappingURL=generic-service.js.map