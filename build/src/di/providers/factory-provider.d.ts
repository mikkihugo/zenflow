/**
 * Factory provider implementation.
 * Uses a factory function to create instances.
 */
/**
 * @file Factory-provider implementation.
 */
import type { FactoryProvider as IFactoryProvider } from '../types/di-types.ts';
export declare class FactoryProvider<T> implements IFactoryProvider<T> {
    readonly factory: (container: DIContainer) => T;
    private readonly disposeFn?;
    readonly type: "transient";
    constructor(factory: (container: DIContainer) => T, disposeFn?: ((instance: T) => Promise<void>) | undefined);
    create(container: DIContainer): T;
    dispose(instance: T): Promise<void>;
}
//# sourceMappingURL=factory-provider.d.ts.map