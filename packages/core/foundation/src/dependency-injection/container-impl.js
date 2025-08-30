/**
 * Container implementation class - extracted for complexity reduction
 */
const ASYNC_FACTORY_TYPE = 'async-factory';
export class ContainerImpl {
    services = new Map();
    serviceMetadata = new Map();
    singletonCache = new Map();
    disposableServices = new Set();
    eventListeners = new Map();
    // Event methods
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)?.add(listener);
        return this;
    }
    emit(event, ...args) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(...args);
                }
                catch {
                    /* ignore */
                }
            }
            return true;
        }
        return false;
    }
    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.delete(listener);
        }
        return this;
    }
    register(token, implementation, options = {}) {
        this.services.set(token, implementation);
        this.serviceMetadata.set(token, {
            name: token,
            type: 'class',
            capabilities: options.capabilities || [],
            tags: options.tags || [],
            singleton: options.singleton === true,
            registeredAt: Date.now(),
        });
        this.emit('serviceRegistered', { token, type: 'class' });
    }
    registerFunction(token, factory, options = {}) {
        this.services.set(token, factory);
        this.serviceMetadata.set(token, {
            name: token,
            type: 'factory',
            capabilities: options.capabilities || [],
            tags: options.tags || [],
            singleton: options.singleton === true,
            registeredAt: Date.now(),
        });
        this.emit('serviceRegistered', { token, type: 'function' });
    }
    registerValue(token, value, options = {}) {
        this.services.set(token, value);
        this.serviceMetadata.set(token, {
            name: token,
            type: 'instance',
            capabilities: options.capabilities || [],
            tags: options.tags || [],
            singleton: true,
            registeredAt: Date.now(),
        });
        this.emit('serviceRegistered', { token, type: 'instance' });
    }
    registerInstance(token, instance, options = {}) {
        this.registerValue(token, instance, options);
    }
    registerSingleton(token, factory, options = {}) {
        if (typeof factory === 'function' && factory.prototype) {
            this.register(token, factory, {
                ...options,
                singleton: true,
            });
        }
        else {
            this.registerFunction(token, factory, {
                ...options,
                singleton: true,
            });
        }
    }
    registerAsyncFactory(token, factory, options = {}) {
        this.services.set(token, factory);
        this.serviceMetadata.set(token, {
            name: token,
            type: ASYNC_FACTORY_TYPE,
            capabilities: options.capabilities || [],
            tags: options.tags || [],
            singleton: true,
            registeredAt: Date.now(),
        });
        this.emit('serviceRegistered', { token, type: ASYNC_FACTORY_TYPE });
    }
    async resolveAsync(token) {
        const metadata = this.serviceMetadata.get(token);
        if (!metadata) {
            throw new Error(`Service '${token}' is not registered`);
        }
        if (metadata.singleton && this.singletonCache.has(token)) {
            return this.singletonCache.get(token);
        }
        if (metadata.type === ASYNC_FACTORY_TYPE) {
            const factory = this.services.get(token);
            const instance = await factory();
            if (metadata.singleton) {
                this.singletonCache.set(token, instance);
            }
            this.emit('serviceResolved', { token, type: metadata.type });
            return instance;
        }
        // Fallback to sync resolution
        return this.resolve(token);
    }
    resolve(token) {
        const metadata = this.serviceMetadata.get(token);
        if (!metadata) {
            throw new Error(`Service '${token}' is not registered`);
        }
        if (metadata.singleton && this.singletonCache.has(token)) {
            return this.singletonCache.get(token);
        }
        const serviceDefinition = this.services.get(token);
        if (!serviceDefinition) {
            throw new Error(`Service definition for '${token}' not found`);
        }
        const instance = this.createServiceInstance(serviceDefinition, metadata, token);
        this.handleServiceInstance(instance, metadata, token);
        return instance;
    }
    createServiceInstance(serviceDefinition, metadata, token) {
        try {
            switch (metadata.type) {
                case 'class': {
                    const serviceClass = serviceDefinition;
                    return new serviceClass();
                }
                case 'factory': {
                    const factory = serviceDefinition;
                    return factory();
                }
                case 'instance':
                case 'singleton':
                    return serviceDefinition;
                default:
                    throw new Error(`Unknown service type '${metadata.type}' for '${token}'`);
            }
        }
        catch (error) {
            const message = `Failed to resolve service '${token}': ${error instanceof Error ? error.message : String(error)}`;
            this.emit('serviceResolutionFailed', { token, error: message });
            throw new Error(message);
        }
    }
    handleServiceInstance(instance, metadata, token) {
        if (metadata.singleton) {
            this.singletonCache.set(token, instance);
        }
        if (instance &&
            typeof instance.dispose ===
                'function') {
            this.disposableServices.add(instance);
        }
        this.emit('serviceResolved', { token, type: metadata.type });
    }
    has(token) {
        return this.services.has(token);
    }
    remove(token) {
        if (!this.services.has(token)) {
            return false;
        }
        this.services.delete(token);
        this.serviceMetadata.delete(token);
        this.singletonCache.delete(token);
        this.emit('serviceUnregistered', { token });
        return true;
    }
    clear() {
        this.services.clear();
        this.serviceMetadata.clear();
        this.singletonCache.clear();
        this.disposableServices.clear();
        this.emit('containerCleared');
    }
    getServicesByTags(tags) {
        const matchingServices = [];
        for (const [token, metadata] of this.serviceMetadata) {
            const hasAllTags = tags.every((tag) => metadata.tags.includes(tag));
            if (hasAllTags) {
                matchingServices.push(token);
            }
        }
        return matchingServices;
    }
    getServicesByCapabilities(capabilities) {
        const matchingServices = [];
        for (const [token, metadata] of this.serviceMetadata) {
            const hasAllCapabilities = capabilities.every((cap) => metadata.capabilities.includes(cap));
            if (hasAllCapabilities) {
                matchingServices.push(token);
            }
        }
        return matchingServices;
    }
    resolveAll(tags) {
        const serviceTokens = this.getServicesByTags(tags);
        return serviceTokens.map((token) => this.resolve(token));
    }
    registerConditional(token, factory, condition, options) {
        if (condition()) {
            if (typeof factory === 'function' && factory.prototype) {
                this.register(token, factory, options);
            }
            else {
                this.registerFunction(token, factory, options);
            }
        }
    }
    async dispose() {
        const disposePromises = [];
        for (const service of this.disposableServices) {
            try {
                const result = service.dispose();
                if (result instanceof Promise) {
                    disposePromises.push(result);
                }
            }
            catch {
                /* ignore disposal errors */
            }
        }
        await Promise.all(disposePromises);
        this.clear();
        this.emit('containerDisposed', { timestamp: Date.now() });
    }
    getServiceMetadata(token) {
        return this.serviceMetadata.get(token);
    }
    listServices() {
        return Array.from(this.services.keys());
    }
    autoDiscoverServices(patterns, options = {}) {
        const discoveredServices = [];
        void options; // Use options parameter
        for (const pattern of patterns) {
            if (pattern.includes('service')) {
                discoveredServices.push({
                    name: pattern,
                    type: 'class',
                    capabilities: [],
                    tags: ['discovered'],
                    registeredAt: Date.now(),
                    singleton: false,
                });
            }
        }
        this.emit('servicesDiscovered', {
            count: discoveredServices.length,
            timestamp: Date.now(),
        });
        return Promise.resolve(discoveredServices);
    }
    startHealthMonitoring(interval) {
        setInterval(() => {
            this.emit('healthCheck', {
                servicesCount: this.services.size,
                timestamp: Date.now(),
            });
        }, interval);
    }
    getStats() {
        return {
            totalServices: this.services.size,
            healthyServices: this.services.size,
            unhealthyServices: 0,
            lastHealthCheck: Date.now(),
        };
    }
    getServicesByCapability(capability) {
        const matchingServices = [];
        for (const [serviceToken, metadata] of this.serviceMetadata.entries()) {
            if (metadata.capabilities?.includes(capability)) {
                const logger = require('../core/logging').getLogger('foundation:service-discovery');
                logger.debug(`Service ${serviceToken} provides capability:${capability}`);
                matchingServices.push(metadata);
            }
        }
        return matchingServices;
    }
    getServicesByTag(tag) {
        const matchingServices = [];
        for (const [serviceToken, metadata] of this.serviceMetadata.entries()) {
            if (metadata.tags?.includes(tag)) {
                const logger = require('../core/logging').getLogger('foundation:service-discovery');
                logger.debug(`Service ${serviceToken} has tag:${tag}`);
                matchingServices.push(metadata);
            }
        }
        return matchingServices;
    }
    getHealthStatus() {
        return {
            status: 'healthy',
            serviceCount: this.services.size,
            timestamp: Date.now(),
            uptime: Date.now(),
        };
    }
    getName() {
        return 'ServiceContainer';
    }
    getServiceInfo(name) {
        return this.serviceMetadata.get(name);
    }
    getAllServices() {
        return Array.from(this.services.keys());
    }
}
