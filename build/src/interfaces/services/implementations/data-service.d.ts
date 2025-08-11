/**
 * Data Service Implementation.
 *
 * Service implementation for data management operations, including.
 * Data processing, validation, caching, and persistence operations.
 * Integrates with existing WebDataService and DocumentService patterns.
 */
/**
 * @file Data service implementation.
 */
import type { IService } from '../core/interfaces.ts';
import type { DataServiceConfig, ServiceOperationOptions } from '../types.ts';
import { BaseService } from './base-service.ts';
/**
 * Data service configuration interface.
 *
 * @example
 */
export interface DataServiceOptions {
    enableCaching?: boolean;
    cacheSize?: number;
    cacheTTL?: number;
    enableValidation?: boolean;
    validationStrict?: boolean;
    enablePersistence?: boolean;
    persistenceInterval?: number;
}
/**
 * Data service implementation.
 *
 * @example
 */
export declare class DataService extends BaseService implements IService {
    private webDataService?;
    private cache;
    private validators;
    private persistenceTimer?;
    constructor(config: DataServiceConfig);
    protected doInitialize(): Promise<void>;
    protected doStart(): Promise<void>;
    protected doStop(): Promise<void>;
    protected doDestroy(): Promise<void>;
    protected doHealthCheck(): Promise<boolean>;
    protected executeOperation<T = any>(operation: string, params?: any, _options?: ServiceOperationOptions): Promise<T>;
    /**
     * Get data with optional caching.
     *
     * @param key
     * @param useCache
     */
    private getData;
    /**
     * Set data with optional caching.
     *
     * @param key
     * @param value
     * @param ttl
     */
    private setData;
    /**
     * Delete data and remove from cache.
     *
     * @param key
     */
    private deleteData;
    /**
     * Validate data using registered validators.
     *
     * @param type
     * @param data
     */
    private validateData;
    /**
     * Process data with different processing types.
     *
     * @param data
     * @param processingType
     */
    private processData;
    /**
     * Get cache statistics.
     */
    private getCacheStats;
    /**
     * Clear all cached data.
     */
    private clearCache;
    private getSystemStatus;
    private getSwarms;
    private createSwarm;
    private getTasks;
    private createTask;
    private getDocuments;
    private executeCommand;
    private initializeValidators;
    private initializePersistence;
    private persistData;
    private cleanExpiredCache;
    private isCacheValid;
    private estimateCacheMemoryUsage;
    private retrieveDataFromSource;
    private storeDataToSource;
    private deleteDataFromSource;
    private transformData;
    private aggregateData;
    private filterData;
}
export default DataService;
//# sourceMappingURL=data-service.d.ts.map