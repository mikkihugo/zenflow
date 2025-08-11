/**
 * Generic Service Implementation.
 *
 * A basic service implementation that can be used for simple services.
 * Or as a fallback when no specific service implementation is available.
 */
/**
 * @file Generic service implementation.
 */
import type { ServiceConfig, ServiceOperationOptions } from '../core/interfaces.ts';
import { BaseService } from './base-service.ts';
/**
 * Generic service that provides basic functionality.
 *
 * @example
 */
export declare class GenericService extends BaseService {
    private operations;
    private healthCheckFn?;
    constructor(config: ServiceConfig);
    protected doInitialize(): Promise<void>;
    protected doStart(): Promise<void>;
    protected doStop(): Promise<void>;
    protected doDestroy(): Promise<void>;
    protected doHealthCheck(): Promise<boolean>;
    protected executeOperation<T = any>(operation: string, params?: any, options?: ServiceOperationOptions): Promise<T>;
    /**
     * Register an operation handler.
     *
     * @param name
     * @param handler
     */
    registerOperation(name: string, handler: (params?: any, options?: ServiceOperationOptions) => Promise<any>): void;
    /**
     * Unregister an operation handler.
     *
     * @param name
     */
    unregisterOperation(name: string): void;
    /**
     * Get list of registered operations.
     */
    getRegisteredOperations(): string[];
    /**
     * Check if operation is registered.
     *
     * @param name
     */
    hasOperation(name: string): boolean;
    /**
     * Set custom health check function.
     *
     * @param healthCheckFn
     */
    setHealthCheck(healthCheckFn: () => Promise<boolean>): void;
    /**
     * Execute multiple operations in sequence.
     *
     * @param operations
     */
    executeSequence(operations: Array<{
        name: string;
        params?: any;
    }>): Promise<any[]>;
    /**
     * Execute multiple operations in parallel.
     *
     * @param operations
     */
    executeParallel(operations: Array<{
        name: string;
        params?: any;
    }>): Promise<any[]>;
    /**
     * Execute operations with specific strategy.
     *
     * @param operations
     * @param strategy
     */
    executeBatch(operations: Array<{
        name: string;
        params?: any;
    }>, strategy?: 'sequence' | 'parallel'): Promise<any[]>;
}
export default GenericService;
//# sourceMappingURL=generic-service.d.ts.map