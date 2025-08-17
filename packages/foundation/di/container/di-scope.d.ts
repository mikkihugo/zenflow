/**
 * Scoped dependency injection container implementation.
 * Provides hierarchical scoping for service lifetimes.
 */
/**
 * @file Di-scope implementation.
 */
import type { DIContainer, DIToken, DIScope as DIScopeInterface, Provider } from '../types/di-types';
export declare class DIScope implements DIScopeInterface {
    readonly parent: DIContainer;
    private readonly scopedProviders;
    private readonly scopedInstances;
    private readonly children;
    constructor(parent: DIContainer);
    /**
     * Register a service provider in this scope.
     *
     * @param token
     * @param provider
     */
    register<T>(token: DIToken<T>, provider: Provider<T>): void;
    /**
     * Resolve a service, checking scope hierarchy.
     *
     * @param token
     */
    resolve<T>(token: DIToken<T>): T;
    /**
     * Create a child scope.
     */
    createScope(): DIScope;
    /**
     * Create a child scope (alias for createScope).
     */
    createChild(): DIScope;
    /**
     * Dispose scope and all child scopes.
     */
    dispose(): Promise<void>;
    /**
     * Check if a service is registered in this scope.
     *
     * @param token
     */
    isRegisteredInScope<T>(token: DIToken<T>): boolean;
    /**
     * Resolve a scoped service with instance caching.
     *
     * @param token
     * @param provider
     */
    private resolveScoped;
}
//# sourceMappingURL=di-scope.d.ts.map