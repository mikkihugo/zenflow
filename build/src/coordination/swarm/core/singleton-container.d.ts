/**
 * @file Coordination system: singleton-container.
 */
/**
 * Registration options for singleton container.
 *
 * @example
 */
interface RegistrationOptions {
    lazy?: boolean;
    singleton?: boolean;
    dependencies?: string[];
}
/**
 * Singleton Container - Dependency Injection Pattern.
 * Replaces global state management with proper IoC container.
 *
 * @example
 */
declare class SingletonContainer {
    instances: Map<string, any>;
    factories: Map<string, any>;
    isDestroying: boolean;
    constructor();
    /**
     * Register a singleton factory.
     *
     * @param {string} key - Service identifier.
     * @param {Function} factory - Factory function to create instance.
     * @param {Object} options - Configuration options.
     */
    register(key: string, factory: (...args: any[]) => any, options?: RegistrationOptions): void;
    /**
     * Get or create singleton instance.
     *
     * @param {string} key - Service identifier.
     * @returns {*} Singleton instance.
     */
    get<T = any>(key: string): T;
    /**
     * Check if service is registered.
     *
     * @param {string} key - Service identifier.
     * @returns {boolean} True if registered.
     */
    has(key: string): boolean;
    /**
     * Clear specific instance (force recreation).
     *
     * @param {string} key - Service identifier.
     */
    clear(key: string): void;
    /**
     * Destroy all instances and clear container.
     */
    destroy(): void;
    /**
     * Reset container state (for testing).
     */
    reset(): void;
    /**
     * Get container statistics.
     *
     * @returns {Object} Container stats.
     */
    getStats(): any;
}
/**
 * Get or create global container.
 *
 * @returns {SingletonContainer} Global container instance.
 * @example
 */
export declare function getContainer(): SingletonContainer;
/**
 * Reset global container (for testing).
 *
 * @example
 */
export declare function resetContainer(): void;
export { SingletonContainer };
//# sourceMappingURL=singleton-container.d.ts.map