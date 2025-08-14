import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('di-container-di-container');
import { CircularDependencyError, DIError, ServiceNotFoundError, } from '../types/di-types.ts';
export class DIContainer {
    providers = new Map();
    singletonInstances = new Map();
    scopes = new WeakSet();
    resolutionStack = [];
    options;
    constructor(options = {}) {
        this.options = {
            enableCircularDependencyDetection: options?.enableCircularDependencyDetection ?? true,
            maxResolutionDepth: options?.maxResolutionDepth ?? 50,
            enablePerformanceMetrics: options?.enablePerformanceMetrics ?? false,
            autoRegisterByConvention: options?.autoRegisterByConvention ?? false,
        };
    }
    register(token, provider) {
        if (this.providers.has(token.symbol)) {
            logger.warn(`Provider for token '${token.name}' is being overwritten`);
        }
        this.providers.set(token.symbol, provider);
    }
    resolve(token) {
        const startTime = this.options.enablePerformanceMetrics ? Date.now() : 0;
        try {
            const result = this.resolveInternal(token);
            if (this.options.enablePerformanceMetrics) {
                const duration = Date.now() - startTime;
                this.recordResolutionMetric(token, duration);
            }
            return result;
        }
        catch (error) {
            if (error instanceof DIError) {
                throw error;
            }
            throw new DIError(`Failed to resolve service '${token.name}': ${error}`, 'RESOLUTION_FAILED');
        }
    }
    createScope() {
        const DIScopeModule = require('./di-scope.js');
        const DIScopeImpl = DIScopeModule.DIScope;
        const scope = new DIScopeImpl(this);
        this.scopes.add(scope);
        return scope;
    }
    async dispose() {
        const disposalPromises = [];
        for (const [symbol, instance] of this.singletonInstances) {
            const provider = this.providers.get(symbol);
            if (provider?.dispose) {
                disposalPromises.push(provider.dispose(instance));
            }
        }
        await Promise.all(disposalPromises);
        this.singletonInstances.clear();
        this.providers.clear();
    }
    isRegistered(token) {
        return this.providers.has(token.symbol);
    }
    getRegisteredTokens() {
        return Array.from(this.providers.entries()).map(([symbol, _]) => {
            for (const [tokenSymbol, _provider] of this.providers) {
                if (tokenSymbol === symbol) {
                    return symbol.toString();
                }
            }
            return symbol.toString();
        });
    }
    resolveInternal(token) {
        if (this.options.enableCircularDependencyDetection) {
            if (this.resolutionStack.includes(token.symbol)) {
                const chain = this.resolutionStack
                    .map((s) => s.toString())
                    .concat(token.name);
                throw new CircularDependencyError(chain);
            }
            if (this.resolutionStack.length >= this.options.maxResolutionDepth) {
                throw new DIError(`Maximum resolution depth exceeded (${this.options.maxResolutionDepth})`, 'MAX_DEPTH_EXCEEDED');
            }
        }
        const provider = this.providers.get(token.symbol);
        if (!provider) {
            throw new ServiceNotFoundError(token.name);
        }
        this.resolutionStack.push(token.symbol);
        try {
            switch (provider.type) {
                case 'singleton':
                    return this.resolveSingleton(token, provider);
                case 'transient':
                    return provider.create(this);
                case 'scoped':
                    return provider.create(this);
                default:
                    throw new DIError(`Unknown provider type: ${provider.type}`, 'UNKNOWN_PROVIDER_TYPE');
            }
        }
        finally {
            this.resolutionStack.pop();
        }
    }
    resolveSingleton(token, provider) {
        if (this.singletonInstances.has(token.symbol)) {
            return this.singletonInstances.get(token.symbol);
        }
        const instance = provider.create(this);
        this.singletonInstances.set(token.symbol, instance);
        return instance;
    }
    recordResolutionMetric(token, duration) {
        logger.debug(`DI Resolution: ${token.name} resolved in ${duration}ms`);
    }
}
//# sourceMappingURL=di-container.js.map