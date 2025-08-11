/**
 * Memory Service Implementation.
 *
 * Service implementation for memory management, caching, and session.
 * Storage operations.
 */
/**
 * @file Memory service implementation.
 */
import type { IService } from '../core/interfaces.ts';
import type { MemoryServiceConfig, ServiceOperationOptions } from '../types.ts';
import { BaseService } from './base-service.ts';
/**
 * Memory service implementation.
 *
 * @example
 */
export declare class MemoryService extends BaseService implements IService {
    private store;
    private metadata;
    private evictionTimer?;
    constructor(config: MemoryServiceConfig);
    protected doInitialize(): Promise<void>;
    protected doStart(): Promise<void>;
    protected doStop(): Promise<void>;
    protected doDestroy(): Promise<void>;
    protected doHealthCheck(): Promise<boolean>;
    protected executeOperation<T = any>(operation: string, params?: any, _options?: ServiceOperationOptions): Promise<T>;
    private get;
    private set;
    private delete;
    private exists;
    private keys;
    private clear;
    private size;
    private getTTL;
    private expire;
    private getStats;
    private serialize;
    private deserialize;
    private estimateValueSize;
    private estimateMemoryUsage;
    private startEvictionProcess;
    private checkEviction;
    private performEviction;
    private removeExpiredItems;
    private getLRUKeys;
    private getLFUKeys;
    private getFIFOKeys;
    private getTTLKeys;
    private countExpiredKeys;
    private loadPersistedData;
    private persistData;
}
export default MemoryService;
//# sourceMappingURL=memory-service.d.ts.map