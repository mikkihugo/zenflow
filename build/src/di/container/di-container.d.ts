/**
 * @file Di-container implementation.
 */
/**
 * Main dependency injection container implementation.
 * Provides type-safe service registration and resolution.
 */
import type { DIContainerOptions, DIScope, DIToken, DIContainer as IDIContainer, Provider } from '../types/di-types.ts';
export declare class DIContainer implements IDIContainer {
    private readonly providers;
    private readonly singletonInstances;
    private readonly scopes;
    private readonly resolutionStack;
    private readonly options;
    constructor(options?: DIContainerOptions);
    /**
     * Register a service provider with the container.
     *
     * @param token
     * @param provider
     */
    register<T>(token: DIToken<T>, provider: Provider<T>): void;
    /**
     * Resolve a service from the container.
     *
     * @param token
     */
    resolve<T>(token: DIToken<T>): T;
    /**
     * Create a new scope.
     */
    createScope(): DIScope;
    /**
     * Dispose all singleton instances and clean up resources.
     */
    dispose(): Promise<void>;
    /**
     * Check if a service is registered.
     *
     * @param token
     */
    isRegistered<T>(token: DIToken<T>): boolean;
    /**
     * Get all registered tokens (for debugging).
     */
    getRegisteredTokens(): string[];
    /**
     * Internal resolution with circular dependency detection.
     *
     * @param token
     */
    private resolveInternal;
    /**
     * Resolve singleton with instance caching.
     *
     * @param token
     * @param provider
     */
    private resolveSingleton;
    /**
     * Record performance metrics for service resolution.
     *
     * @param token - The service token that was resolved.
     * @param duration - Resolution time in milliseconds.
     */
    private recordResolutionMetric;
}
//# sourceMappingURL=di-container.d.ts.map