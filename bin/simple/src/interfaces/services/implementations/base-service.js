import { EventEmitter } from 'node:events';
import { getLogger } from '../../../config/logging-config.ts';
import { ServiceConfigurationError, ServiceDependencyError, ServiceError, ServiceInitializationError, ServiceOperationError, ServiceTimeoutError, } from '../core/interfaces.ts';
export class BaseService extends EventEmitter {
    name;
    type;
    config;
    logger;
    lifecycleStatus = 'uninitialized';
    startTime = null;
    operationCount = 0;
    successCount = 0;
    errorCount = 0;
    latencyMetrics = [];
    dependencies = new Map();
    capabilities = [];
    constructor(name, type, config) {
        super();
        this.name = name;
        this.type = type;
        this.config = config;
        this.logger = getLogger(`Service:${name}`);
        if (config?.dependencies) {
            config?.dependencies?.forEach((dep) => {
                this.dependencies.set(dep.serviceName, dep);
            });
        }
    }
    async initialize(config) {
        if (this.lifecycleStatus !== 'uninitialized') {
            this.logger.warn(`Service ${this.name} is already initialized`);
            return;
        }
        this.logger.info(`Initializing service: ${this.name}`);
        this.lifecycleStatus = 'initializing';
        this.emit('initializing', this.createEvent('initializing'));
        try {
            if (config) {
                await this.updateConfig(config);
            }
            const isValid = await this.validateConfig(this.config);
            if (!isValid) {
                throw new ServiceConfigurationError(this.name, 'Configuration validation failed');
            }
            if (this.config.dependencies && this.config.dependencies.length > 0) {
                const dependenciesOk = await this.checkDependencies();
                if (!dependenciesOk) {
                    throw new ServiceDependencyError(this.name, 'Dependencies not available');
                }
            }
            await this.doInitialize();
            this.lifecycleStatus = 'initialized';
            this.emit('initialized', this.createEvent('initialized'));
            this.logger.info(`Service ${this.name} initialized successfully`);
        }
        catch (error) {
            this.lifecycleStatus = 'error';
            this.emit('error', this.createEvent('error', undefined, error));
            this.logger.error(`Service ${this.name} initialization failed:`, error);
            throw new ServiceInitializationError(this.name, error);
        }
    }
    async start() {
        if (this.lifecycleStatus === 'running') {
            this.logger.warn(`Service ${this.name} is already running`);
            return;
        }
        if (this.lifecycleStatus !== 'initialized' &&
            this.lifecycleStatus !== 'stopped') {
            throw new ServiceError('Cannot start service that is not initialized', 'INVALID_STATE', this.name);
        }
        this.logger.info(`Starting service: ${this.name}`);
        this.lifecycleStatus = 'starting';
        this.emit('starting', this.createEvent('starting'));
        try {
            if (this.dependencies.size > 0) {
                const dependenciesOk = await this.checkDependencies();
                if (!dependenciesOk) {
                    throw new ServiceDependencyError(this.name, 'Dependencies not available for startup');
                }
            }
            await this.doStart();
            this.lifecycleStatus = 'running';
            this.startTime = new Date();
            this.emit('started', this.createEvent('started'));
            this.logger.info(`Service ${this.name} started successfully`);
        }
        catch (error) {
            this.lifecycleStatus = 'error';
            this.emit('error', this.createEvent('error', undefined, error));
            this.logger.error(`Service ${this.name} startup failed:`, error);
            throw new ServiceOperationError(this.name, 'start', error);
        }
    }
    async stop() {
        if (this.lifecycleStatus === 'stopped' ||
            this.lifecycleStatus === 'uninitialized') {
            this.logger.warn(`Service ${this.name} is already stopped or not initialized`);
            return;
        }
        this.logger.info(`Stopping service: ${this.name}`);
        this.lifecycleStatus = 'stopping';
        this.emit('stopping', this.createEvent('stopping'));
        try {
            await this.doStop();
            this.lifecycleStatus = 'stopped';
            this.emit('stopped', this.createEvent('stopped'));
            this.logger.info(`Service ${this.name} stopped successfully`);
        }
        catch (error) {
            this.lifecycleStatus = 'error';
            this.emit('error', this.createEvent('error', undefined, error));
            this.logger.error(`Service ${this.name} shutdown failed:`, error);
            throw new ServiceOperationError(this.name, 'stop', error);
        }
    }
    async destroy() {
        this.logger.info(`Destroying service: ${this.name}`);
        try {
            if (this.lifecycleStatus === 'running') {
                await this.stop();
            }
            await this.doDestroy();
            this.operationCount = 0;
            this.successCount = 0;
            this.errorCount = 0;
            this.latencyMetrics = [];
            this.dependencies.clear();
            this.removeAllListeners();
            this.lifecycleStatus = 'destroyed';
            this.logger.info(`Service ${this.name} destroyed successfully`);
        }
        catch (error) {
            this.logger.error(`Service ${this.name} destruction failed:`, error);
            throw new ServiceOperationError(this.name, 'destroy', error);
        }
    }
    async getStatus() {
        const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
        const errorRate = this.operationCount > 0
            ? (this.errorCount / this.operationCount) * 100
            : 0;
        let health;
        try {
            const isHealthy = await this.doHealthCheck();
            if (isHealthy && errorRate < 5) {
                health = 'healthy';
            }
            else if (isHealthy && errorRate < 20) {
                health = 'degraded';
            }
            else {
                health = 'unhealthy';
            }
        }
        catch (error) {
            health = 'unknown';
            this.logger.debug(`Health check failed for service ${this.name}:`, error);
        }
        const dependencies = {};
        for (const [depName, _depConfig] of this.dependencies) {
            try {
                dependencies[depName] = {
                    status: 'healthy',
                    lastCheck: new Date(),
                };
            }
            catch (_error) {
                dependencies[depName] = {
                    status: 'unhealthy',
                    lastCheck: new Date(),
                };
            }
        }
        return {
            name: this.name,
            type: this.type,
            lifecycle: this.lifecycleStatus,
            health,
            lastCheck: new Date(),
            uptime,
            errorCount: this.errorCount,
            errorRate,
            dependencies: Object.keys(dependencies).length > 0 ? dependencies : undefined,
            metadata: {
                operationCount: this.operationCount,
                successCount: this.successCount,
                ...this.config.metadata,
            },
        };
    }
    async getMetrics() {
        const averageLatency = this.latencyMetrics.length > 0
            ? this.latencyMetrics.reduce((sum, lat) => sum + lat, 0) /
                this.latencyMetrics.length
            : 0;
        const sortedLatencies = [...this.latencyMetrics].sort((a, b) => a - b);
        const p95Index = Math.floor(sortedLatencies.length * 0.95);
        const p99Index = Math.floor(sortedLatencies.length * 0.99);
        const p95Latency = sortedLatencies[p95Index] || 0;
        const p99Latency = sortedLatencies[p99Index] || 0;
        const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
        const throughput = uptime > 0 ? this.operationCount / (uptime / 1000) : 0;
        return {
            name: this.name,
            type: this.type,
            operationCount: this.operationCount,
            successCount: this.successCount,
            errorCount: this.errorCount,
            averageLatency,
            p95Latency,
            p99Latency,
            throughput,
            timestamp: new Date(),
        };
    }
    async healthCheck() {
        try {
            if (this.lifecycleStatus !== 'running') {
                return false;
            }
            const isHealthy = await this.doHealthCheck();
            this.emit('health-check', this.createEvent('health-check', { healthy: isHealthy }));
            return isHealthy;
        }
        catch (error) {
            this.logger.error(`Health check failed for service ${this.name}:`, error);
            this.emit('health-check', this.createEvent('health-check', { healthy: false }, error));
            return false;
        }
    }
    async updateConfig(config) {
        this.logger.info(`Updating configuration for service: ${this.name}`);
        const newConfig = { ...this.config, ...config };
        const isValid = await this.validateConfig(newConfig);
        if (!isValid) {
            throw new ServiceConfigurationError(this.name, 'Invalid configuration update');
        }
        this.config = newConfig;
        if (config?.dependencies) {
            this.dependencies.clear();
            config?.dependencies?.forEach((dep) => {
                this.dependencies.set(dep.serviceName, dep);
            });
        }
        this.logger.info(`Configuration updated for service: ${this.name}`);
    }
    async validateConfig(config) {
        try {
            if (!(config?.name && config?.type)) {
                return false;
            }
            if (config?.timeout && config?.timeout < 1000) {
                return false;
            }
            if (config?.dependencies) {
                for (const dep of config?.dependencies) {
                    if (!dep.serviceName) {
                        return false;
                    }
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Configuration validation failed for service ${this.name}:`, error);
            return false;
        }
    }
    isReady() {
        return this.lifecycleStatus === 'running';
    }
    getCapabilities() {
        return [...this.capabilities];
    }
    async execute(operation, params, options) {
        const operationId = `${this.name}-${operation}-${Date.now()}`;
        const startTime = Date.now();
        this.logger.debug(`Executing operation: ${operation} on service ${this.name}`);
        this.operationCount++;
        try {
            if (!this.isReady()) {
                throw new ServiceError('Service is not ready', 'SERVICE_NOT_READY', this.name);
            }
            const timeout = options?.timeout || this.config.timeout || 30000;
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new ServiceTimeoutError(this.name, operation, timeout)), timeout));
            const operationPromise = this.executeOperation(operation, params, options);
            const result = await Promise.race([operationPromise, timeoutPromise]);
            const duration = Date.now() - startTime;
            this.successCount++;
            this.recordLatency(duration);
            const response = {
                success: true,
                data: result,
                metadata: {
                    duration,
                    timestamp: new Date(),
                    operationId,
                },
            };
            this.emit('operation', this.createEvent('operation', {
                operation,
                success: true,
                duration,
                operationId,
            }));
            if (options?.trackMetrics !== false) {
                this.emit('metrics-update', this.createEvent('metrics-update'));
            }
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.errorCount++;
            this.recordLatency(duration);
            const response = {
                success: false,
                error: {
                    code: error instanceof ServiceError ? error.code : 'OPERATION_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: params,
                    stack: error instanceof Error ? error.stack : undefined,
                },
                metadata: {
                    duration,
                    timestamp: new Date(),
                    operationId,
                },
            };
            this.emit('operation', this.createEvent('operation', {
                operation,
                success: false,
                duration,
                operationId,
                error: error instanceof Error ? error.message : 'Unknown error',
            }));
            this.logger.error(`Operation ${operation} failed on service ${this.name}:`, error);
            return response;
        }
    }
    async addDependency(dependency) {
        this.dependencies.set(dependency.serviceName, dependency);
        this.logger.info(`Added dependency ${dependency.serviceName} to service ${this.name}`);
    }
    async removeDependency(serviceName) {
        this.dependencies.delete(serviceName);
        this.logger.info(`Removed dependency ${serviceName} from service ${this.name}`);
    }
    async checkDependencies() {
        if (this.dependencies.size === 0) {
            return true;
        }
        const dependencyChecks = Array.from(this.dependencies.entries()).map(async ([depName, depConfig]) => {
            try {
                this.logger.debug(`Checking dependency: ${depName}`);
                const _timeout = depConfig?.timeout || 5000;
                await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
                return { name: depName, available: true };
            }
            catch (error) {
                this.logger.warn(`Dependency check failed for ${depName}:`, error);
                return { name: depName, available: false };
            }
        });
        const results = await Promise.allSettled(dependencyChecks);
        const failedDependencies = results
            ?.filter((result, _index) => {
            if (result?.status === 'fulfilled') {
                return !result?.value?.available;
            }
            return true;
        })
            .map((_, index) => Array.from(this.dependencies.keys())[index]);
        if (failedDependencies.length > 0) {
            const requiredFailures = failedDependencies.filter((depName) => {
                const dep = this.dependencies.get(depName);
                return dep?.required === true;
            });
            if (requiredFailures.length > 0) {
                this.logger.error(`Required dependencies not available: ${requiredFailures.join(', ')}`);
                return false;
            }
            this.logger.warn(`Optional dependencies not available: ${failedDependencies.join(', ')}`);
        }
        return true;
    }
    on(event, handler) {
        return super.on(event, handler);
    }
    off(event, handler) {
        if (handler) {
            return super.off(event, handler);
        }
        return super.removeAllListeners(event);
    }
    emit(event, data, error) {
        const serviceEvent = this.createEvent(event, data, error);
        return super.emit(event, serviceEvent);
    }
    createEvent(type, data, error) {
        return {
            type,
            serviceName: this.name,
            timestamp: new Date(),
            data,
            error,
        };
    }
    recordLatency(latency) {
        this.latencyMetrics.push(latency);
        if (this.latencyMetrics.length > 1000) {
            this.latencyMetrics = this.latencyMetrics.slice(-1000);
        }
    }
    addCapability(capability) {
        if (!this.capabilities.includes(capability)) {
            this.capabilities.push(capability);
            this.logger.debug(`Added capability ${capability} to service ${this.name}`);
        }
    }
    removeCapability(capability) {
        const index = this.capabilities.indexOf(capability);
        if (index >= 0) {
            this.capabilities.splice(index, 1);
            this.logger.debug(`Removed capability ${capability} from service ${this.name}`);
        }
    }
    async executeWithRetries(operation, maxRetries = 3, delay = 1000) {
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Operation attempt ${attempt} failed:`, error);
                if (attempt < maxRetries) {
                    await new Promise((resolve) => setTimeout(resolve, delay * attempt));
                }
            }
        }
        throw lastError || new Error('All retry attempts failed');
    }
}
export default BaseService;
//# sourceMappingURL=base-service.js.map