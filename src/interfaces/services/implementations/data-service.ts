/**
 * Data Service Implementation.
 *
 * Service implementation for data management operations, including.
 * Data processing, validation, caching, and persistence operations.
 * Integrates with existing WebDataService and DocumentService patterns.
 */

// Import existing data services for integration
/**
 * @file Data service implementation.
 */

import type { IService } from '../core/interfaces.ts';
import type { DataServiceConfig, ServiceOperationOptions } from '../types.ts';
import { WebDataService } from '../web/web-data-service';
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
export class DataService extends BaseService implements IService {
  private webDataService?: WebDataService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private validators = new Map<string, (data: any) => boolean>();
  private persistenceTimer?: NodeJS.Timeout;

  constructor(config: DataServiceConfig) {
    super(config?.name, config?.type, config);

    // Add data service capabilities
    this.addCapability('data-processing');
    this.addCapability('data-validation');
    this.addCapability('data-caching');
    this.addCapability('data-persistence');
    this.addCapability('web-data-operations');
  }

  // ============================================
  // BaseService Implementation
  // ============================================

  protected async doInitialize(): Promise<void> {
    this.logger.info(`Initializing data service: ${this.name}`);

    const config = this.config as DataServiceConfig;

    // Initialize WebDataService integration
    if (config?.options?.enableWebData !== false) {
      this.webDataService = new WebDataService();
      this.logger.debug('WebDataService integration enabled');
    }

    // Initialize caching if enabled
    if (config?.caching?.enabled) {
      this.logger.debug(`Caching enabled with TTL: ${config?.caching?.ttl || 3600}s`);
    }

    // Initialize validation if enabled
    if (config?.validation?.enabled) {
      this.initializeValidators();
      this.logger.debug('Data validation enabled');
    }

    // Initialize persistence if enabled
    if (config?.options?.enablePersistence) {
      this.initializePersistence();
      this.logger.debug('Data persistence enabled');
    }

    this.logger.info(`Data service ${this.name} initialized successfully`);
  }

  protected async doStart(): Promise<void> {
    this.logger.info(`Starting data service: ${this.name}`);

    const config = this.config as DataServiceConfig;

    // Start persistence timer if enabled
    if (config?.options?.enablePersistence && config?.options?.persistenceInterval) {
      this.persistenceTimer = setInterval(
        () => this.persistData(),
        config?.options?.persistenceInterval
      );
      this.logger.debug('Persistence timer started');
    }

    this.logger.info(`Data service ${this.name} started successfully`);
  }

  protected async doStop(): Promise<void> {
    this.logger.info(`Stopping data service: ${this.name}`);

    // Stop persistence timer
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
      this.persistenceTimer = undefined;
      this.logger.debug('Persistence timer stopped');
    }

    // Persist any remaining data
    await this.persistData();

    this.logger.info(`Data service ${this.name} stopped successfully`);
  }

  protected async doDestroy(): Promise<void> {
    this.logger.info(`Destroying data service: ${this.name}`);

    // Clear cache
    this.cache.clear();

    // Clear validators
    this.validators.clear();

    // Clear web data service
    this.webDataService = undefined;

    this.logger.info(`Data service ${this.name} destroyed successfully`);
  }

  protected async doHealthCheck(): Promise<boolean> {
    try {
      // Check if service is running
      if (this.lifecycleStatus !== 'running') {
        return false;
      }

      // Check cache health (if enabled)
      const config = this.config as DataServiceConfig;
      if (config?.caching?.enabled) {
        // Clean expired cache entries
        this.cleanExpiredCache();

        // Check cache size limits
        const maxSize = config?.caching?.maxSize || 1000;
        if (this.cache.size > maxSize * 1.1) {
          // Allow 10% overage
          this.logger.warn(`Cache size (${this.cache.size}) exceeds limit (${maxSize})`);
          return false;
        }
      }

      // Check web data service health
      if (this.webDataService) {
        try {
          const stats = this.webDataService.getServiceStats();
          if (stats.averageResponseTime > 5000) {
            // 5 second threshold
            this.logger.warn(
              `Web data service response time too high: ${stats.averageResponseTime}ms`
            );
            return false;
          }
        } catch (error) {
          this.logger.warn('Web data service health check failed:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Health check failed for data service ${this.name}:`, error);
      return false;
    }
  }

  protected async executeOperation<T = any>(
    operation: string,
    params?: any,
    _options?: ServiceOperationOptions
  ): Promise<T> {
    this.logger.debug(`Executing data operation: ${operation}`);

    switch (operation) {
      case 'get':
        return (await this.getData(params?.key, params?.useCache)) as T;

      case 'set':
        return (await this.setData(params?.key, params?.value, params?.ttl)) as T;

      case 'delete':
        return (await this.deleteData(params?.key)) as T;

      case 'validate':
        return (await this.validateData(params?.type, params?.data)) as T;

      case 'process':
        return (await this.processData(params?.data, params?.processingType)) as T;

      case 'cache-stats':
        return this.getCacheStats() as T;

      case 'clear-cache':
        return (await this.clearCache()) as T;

      // Web data service operations
      case 'system-status':
        return (await this.getSystemStatus()) as T;

      case 'swarms':
        return (await this.getSwarms()) as T;

      case 'create-swarm':
        return (await this.createSwarm(params)) as T;

      case 'tasks':
        return (await this.getTasks()) as T;

      case 'create-task':
        return (await this.createTask(params)) as T;

      case 'documents':
        return (await this.getDocuments()) as T;

      case 'execute-command':
        return (await this.executeCommand(params?.command, params?.args)) as T;

      default:
        throw new Error(`Unknown data operation: ${operation}`);
    }
  }

  // ============================================
  // Data Service Specific Methods
  // ============================================

  /**
   * Get data with optional caching.
   *
   * @param key
   * @param useCache
   */
  private async getData(key: string, useCache: boolean = true): Promise<any> {
    if (!key) {
      throw new Error('Data key is required');
    }

    const config = this.config as DataServiceConfig;

    // Check cache first if enabled and requested
    if (useCache && config?.caching?.enabled) {
      const cached = this.cache.get(key);
      if (cached && this.isCacheValid(cached)) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return cached.data;
      }
    }

    // Simulate data retrieval (in real implementation, this would query a database)
    this.logger.debug(`Retrieving data for key: ${key}`);
    const data = await this.retrieveDataFromSource(key);

    // Cache the result if caching is enabled
    if (config?.caching?.enabled) {
      const ttl = config?.caching?.ttl || 3600;
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttl * 1000, // Convert to milliseconds
      });
      this.logger.debug(`Cached data for key: ${key}`);
    }

    return data;
  }

  /**
   * Set data with optional caching.
   *
   * @param key
   * @param value
   * @param ttl
   */
  private async setData(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!key) {
      throw new Error('Data key is required');
    }

    const config = this.config as DataServiceConfig;

    // Validate data if validation is enabled
    if (config?.validation?.enabled) {
      const isValid = await this.validateData('generic', value);
      if (!isValid && config?.validation?.strict) {
        throw new Error(`Data validation failed for key: ${key}`);
      }
    }

    // Store data (simulate data storage)
    this.logger.debug(`Storing data for key: ${key}`);
    await this.storeDataToSource(key, value);

    // Update cache if enabled
    if (config?.caching?.enabled) {
      const cacheTTL = ttl || config?.caching?.ttl || 3600;
      this.cache.set(key, {
        data: value,
        timestamp: Date.now(),
        ttl: cacheTTL * 1000, // Convert to milliseconds
      });
      this.logger.debug(`Updated cache for key: ${key}`);
    }

    return true;
  }

  /**
   * Delete data and remove from cache.
   *
   * @param key
   */
  private async deleteData(key: string): Promise<boolean> {
    if (!key) {
      throw new Error('Data key is required');
    }

    this.logger.debug(`Deleting data for key: ${key}`);

    // Remove from cache
    this.cache.delete(key);

    // Remove from data source (simulate)
    await this.deleteDataFromSource(key);

    return true;
  }

  /**
   * Validate data using registered validators.
   *
   * @param type
   * @param data
   */
  private async validateData(type: string, data: any): Promise<boolean> {
    const validator = this.validators.get(type);
    if (!validator) {
      this.logger.warn(`No validator found for type: ${type}`);
      return true; // Allow if no validator
    }

    try {
      return validator(data);
    } catch (error) {
      this.logger.error(`Validation error for type ${type}:`, error);
      return false;
    }
  }

  /**
   * Process data with different processing types.
   *
   * @param data
   * @param processingType
   */
  private async processData(
    data: any,
    processingType: 'transform' | 'aggregate' | 'filter' = 'transform'
  ): Promise<any> {
    this.logger.debug(`Processing data with type: ${processingType}`);

    switch (processingType) {
      case 'transform':
        return this.transformData(data);

      case 'aggregate':
        return this.aggregateData(data);

      case 'filter':
        return this.filterData(data);

      default:
        throw new Error(`Unknown processing type: ${processingType}`);
    }
  }

  /**
   * Get cache statistics.
   */
  private getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const config = this.config as DataServiceConfig;
    const maxSize = config?.caching?.maxSize || 1000;

    return {
      size: this.cache.size,
      maxSize,
      hitRate: 0.85, // Simulate hit rate
      memoryUsage: this.estimateCacheMemoryUsage(),
    };
  }

  /**
   * Clear all cached data.
   */
  private async clearCache(): Promise<{ cleared: number }> {
    const cleared = this.cache.size;
    this.cache.clear();
    this.logger.info(`Cleared ${cleared} items from cache`);
    return { cleared };
  }

  // ============================================
  // Web Data Service Integration
  // ============================================

  private async getSystemStatus(): Promise<any> {
    if (!this.webDataService) {
      throw new Error('Web data service not available');
    }
    return await this.webDataService.getSystemStatus();
  }

  private async getSwarms(): Promise<any> {
    if (!this.webDataService) {
      throw new Error('Web data service not available');
    }
    return await this.webDataService.getSwarms();
  }

  private async createSwarm(config: any): Promise<any> {
    if (!this.webDataService) {
      throw new Error('Web data service not available');
    }
    return await this.webDataService.createSwarm(config);
  }

  private async getTasks(): Promise<any> {
    if (!this.webDataService) {
      throw new Error('Web data service not available');
    }
    return await this.webDataService.getTasks();
  }

  private async createTask(config: any): Promise<any> {
    if (!this.webDataService) {
      throw new Error('Web data service not available');
    }
    return await this.webDataService.createTask(config);
  }

  private async getDocuments(): Promise<any> {
    if (!this.webDataService) {
      throw new Error('Web data service not available');
    }
    return await this.webDataService.getDocuments();
  }

  private async executeCommand(command: string, args: any[]): Promise<any> {
    if (!this.webDataService) {
      throw new Error('Web data service not available');
    }
    return await this.webDataService.executeCommand(command, args);
  }

  // ============================================
  // Helper Methods
  // ============================================

  private initializeValidators(): void {
    // Register default validators
    this.validators.set('generic', (data: any) => data !== null && data !== undefined);
    this.validators.set('string', (data: any) => typeof data === 'string');
    this.validators.set('number', (data: any) => typeof data === 'number' && !Number.isNaN(data));
    this.validators.set('object', (data: any) => typeof data === 'object' && data !== null);
    this.validators.set('array', (data: any) => Array.isArray(data));
  }

  private initializePersistence(): void {
    // Initialize persistence mechanism (would be implemented based on storage type)
    this.logger.debug('Persistence mechanism initialized');
  }

  private async persistData(): Promise<void> {
    try {
      // Persist cache data to storage (simulate)
      const dataSize = this.cache.size;
      if (dataSize > 0) {
        this.logger.debug(`Persisting ${dataSize} cached items`);
        // In real implementation, would save to database/file
      }
    } catch (error) {
      this.logger.error('Data persistence failed:', error);
    }
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    const expired: string[] = [];

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        expired.push(key);
      }
    }

    expired.forEach((key) => this.cache.delete(key));

    if (expired.length > 0) {
      this.logger.debug(`Cleaned ${expired.length} expired cache entries`);
    }
  }

  private isCacheValid(cached: { data: any; timestamp: number; ttl: number }): boolean {
    return Date.now() - cached.timestamp < cached.ttl;
  }

  private estimateCacheMemoryUsage(): number {
    // Rough estimation of memory usage
    return this.cache.size * 1024; // Assume 1KB per cached item
  }

  private async retrieveDataFromSource(key: string): Promise<any> {
    // Simulate data retrieval from database/API
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

    // Return mock data
    return {
      key,
      value: `data-for-${key}`,
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'data-service',
        version: '1.0.0',
      },
    };
  }

  private async storeDataToSource(key: string, _value: any): Promise<void> {
    // Simulate data storage to database
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 50));
    this.logger.debug(`Stored data for key ${key} to data source`);
  }

  private async deleteDataFromSource(key: string): Promise<void> {
    // Simulate data deletion from database
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 50));
    this.logger.debug(`Deleted data for key ${key} from data source`);
  }

  private transformData(data: any): any {
    // Simple data transformation
    if (Array.isArray(data)) {
      return data?.map((item) => ({
        ...item,
        transformed: true,
        transformedAt: new Date().toISOString(),
      }));
    } else if (typeof data === 'object' && data !== null) {
      return {
        ...data,
        transformed: true,
        transformedAt: new Date().toISOString(),
      };
    }
    return data;
  }

  private aggregateData(data: any): any {
    if (Array.isArray(data)) {
      return {
        count: data.length,
        types: [...new Set(data?.map((item) => typeof item))],
        aggregatedAt: new Date().toISOString(),
      };
    }
    return { count: 1, type: typeof data, aggregatedAt: new Date().toISOString() };
  }

  private filterData(data: any): any {
    if (Array.isArray(data)) {
      return data?.filter((item) => item !== null && item !== undefined);
    }
    return data !== null && data !== undefined ? data : null;
  }
}

export default DataService;
