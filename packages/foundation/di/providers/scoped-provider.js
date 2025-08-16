/**
 * Scoped provider implementation.
 * Creates one instance per scope lifetime.
 */
/**
 * @file Scoped-provider implementation.
 */
export class ScopedProvider {
    factory;
    disposeFn;
    type = 'scoped';
    scopedInstances = new WeakMap();
    constructor(factory, disposeFn) {
        this.factory = factory;
        this.disposeFn = disposeFn;
    }
    create(container) {
        // For scoped services, we need to find the current scope
        const scope = this.findScope(container);
        if (this.scopedInstances.has(scope)) {
            return this.scopedInstances.get(scope);
        }
        const instance = this.factory(container);
        this.scopedInstances.set(scope, instance);
        return instance;
    }
    async dispose(instance) {
        if (this.disposeFn) {
            await this.disposeFn(instance);
        }
    }
    findScope(container) {
        // If container is a scope, return it
        if ('parent' in container) {
            return container;
        }
        // Otherwise, create a default scope
        return container.createScope();
    }
    /**
     * Clear all scoped instances (useful for testing).
     */
    clearInstances() {
        // WeakMap automatically clears when scopes are garbage collected
        // This method is mainly for explicit cleanup if needed.
    }
}
//# sourceMappingURL=scoped-provider.js.map