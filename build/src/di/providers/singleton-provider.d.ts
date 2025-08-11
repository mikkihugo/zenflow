/**
 * Singleton provider implementation.
 * Ensures only one instance of a service exists throughout the application lifetime.
 */
/**
 * @file Singleton-provider implementation.
 */
import type { Provider } from '../types/di-types.ts';
export declare class SingletonProvider<T> implements Provider<T> {
    private readonly factory;
    private readonly disposeFn?;
    readonly type: "singleton";
    private instance;
    private isCreating;
    constructor(factory: (container: DIContainer) => T, disposeFn?: ((instance: T) => Promise<void>) | undefined);
    create(container: DIContainer): T;
    dispose(instance: T): Promise<void>;
    /**
     * Check if instance has been created.
     */
    get hasInstance(): boolean;
    /**
     * Get the instance without creating it (returns undefined if not created).
     */
    get currentInstance(): T | undefined;
}
//# sourceMappingURL=singleton-provider.d.ts.map