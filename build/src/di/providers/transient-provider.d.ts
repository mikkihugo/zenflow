/**
 * Transient provider implementation.
 * Creates a new instance every time the service is resolved.
 */
/**
 * @file Transient-provider implementation.
 */
import type { Provider } from '../types/di-types.ts';
export declare class TransientProvider<T> implements Provider<T> {
    private readonly factory;
    private readonly disposeFn?;
    readonly type: "transient";
    constructor(factory: (container: DIContainer) => T, disposeFn?: ((instance: T) => Promise<void>) | undefined);
    create(container: DIContainer): T;
    dispose(instance: T): Promise<void>;
}
//# sourceMappingURL=transient-provider.d.ts.map