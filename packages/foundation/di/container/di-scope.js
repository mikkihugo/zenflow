/**
 * Scoped dependency injection container implementation.
 * Provides hierarchical scoping for service lifetimes.
 */
/**
 * @file Di-scope implementation.
 */
export class DIScope {
    parent;
    scopedProviders = new Map();
    scopedInstances = new Map();
    children = new Set();
    constructor(parent) {
        this.parent = parent;
    }
    /**
     * Register a service provider in this scope.
     *
     * @param token
     * @param provider
     */
    register(token, provider) {
        this.scopedProviders.set(token.symbol, provider);
    }
    /**
     * Resolve a service, checking scope hierarchy.
     *
     * @param token
     */
    resolve(token) {
        // First check scoped providers
        const scopedProvider = this.scopedProviders.get(token.symbol);
        if (scopedProvider) {
            return this.resolveScoped(token, scopedProvider);
        }
        // Fallback to parent container
        return this.parent.resolve(token);
    }
    /**
     * Create a child scope.
     */
    createScope() {
        const child = new DIScope(this);
        this.children.add(child);
        return child;
    }
    /**
     * Create a child scope (alias for createScope).
     */
    createChild() {
        return this.createScope();
    }
    /**
     * Dispose scope and all child scopes.
     */
    async dispose() {
        const disposalPromises = [];
        // Dispose all scoped instances
        for (const [symbol, instance] of this.scopedInstances) {
            const provider = this.scopedProviders.get(symbol);
            if (provider?.dispose) {
                disposalPromises.push(provider.dispose(instance));
            }
        }
        // Dispose all child scopes
        for (const child of this.children) {
            disposalPromises.push(child?.dispose());
        }
        await Promise.all(disposalPromises);
        this.scopedInstances.clear();
        this.scopedProviders.clear();
        this.children.clear();
    }
    /**
     * Check if a service is registered in this scope.
     *
     * @param token
     */
    isRegisteredInScope(token) {
        return this.scopedProviders.has(token.symbol);
    }
    /**
     * Resolve a scoped service with instance caching.
     *
     * @param token
     * @param provider
     */
    resolveScoped(token, provider) {
        if (this.scopedInstances.has(token.symbol)) {
            return this.scopedInstances.get(token.symbol);
        }
        const instance = provider.create(this);
        this.scopedInstances.set(token.symbol, instance);
        return instance;
    }
}
//# sourceMappingURL=di-scope.js.map