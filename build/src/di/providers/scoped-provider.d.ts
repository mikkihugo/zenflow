/**
 * Scoped provider implementation.
 * Creates one instance per scope lifetime.
 */
/**
 * @file Scoped-provider implementation.
 */
import type { DIContainer, Provider } from '../types/di-types.ts';
export declare class ScopedProvider<T> implements Provider<T> {
    private readonly factory;
    private readonly disposeFn?;
    readonly type: "scoped";
    private readonly scopedInstances;
    constructor(factory: (container: DIContainer) => T, disposeFn?: ((instance: T) => Promise<void>) | undefined);
    create(container: DIContainer): T;
    dispose(instance: T): Promise<void>;
    private findScope;
    /**
     * Clear all scoped instances (useful for testing).
     */
    clearInstances(): void;
}
//# sourceMappingURL=scoped-provider.d.ts.map