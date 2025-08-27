/**
 * @file Registry Index
 *
 * Simple registry index for the event system.
 */
/**
 * Simple registry for managing indexed items.
 */
export declare class RegistryIndex<T = unknown> {
    private items;
    register(key: string, item: T): void;
    unregister(key: string): boolean;
    get(key: string): T | undefined;
    has(key: string): boolean;
    keys(): IterableIterator<string>;
    values(): IterableIterator<T>;
    clear(): void;
}
//# sourceMappingURL=registry-index.d.ts.map