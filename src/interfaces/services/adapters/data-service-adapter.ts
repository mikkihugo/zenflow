/**
 * @file USL Data Service Adapter.
 *
 * Unified Service Layer adapter for data-related services, providing
 * a consistent interface to WebDataService and DocumentService while.
 * maintaining full backward compatibility and adding enhanced monitoring,
 * caching, retry logic, and performance metrics.
 *
 * This adapter follows the exact same patterns as the UACL client adapters,
 * implementing the IService interface and providing unified configuration.
 * management for data operations across Claude-Zen.
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../../../config/logging-config';
import type { ILogger } from '../../../core/logger';
import type { BaseDocumentEntity } from '../../../database/entities/product-entities';
import type {
  DocumentCreateOptions,
  DocumentQueryOptions,
  DocumentSearchOptions,
} from "../services/document/document-service"
import { DocumentService } from '../../../database/services/document-service-legacy';
import type {
  CommandResult,
  DocumentData,
  SwarmData,
  SystemStatusData,
  TaskData,
} from '../../../interfaces/web/web-data-service';
import { WebDataService } from '../../../interfaces/web/web-data-service';
import type { DocumentType } from '../../../types/workflow-types';
import type {
  IService,
  ServiceConfig,
  ServiceDependencyConfig,
  ServiceError,
  ServiceEvent,
  ServiceEventType,
  ServiceLifecycleStatus,
  ServiceMetrics,
  ServiceOperationOptions,
  ServiceOperationResponse,
  ServiceStatus,
} from '../../core/interfaces';
import type { DataServiceConfig } from '../types';
import { ServiceEnvironment, ServicePriority, ServiceType } from '../types';

/**
 * Data service adapter configuration extending USL DataServiceConfig.
 *
 * @example
 */
export interface DataServiceAdapterConfig {
  // Base service configuration
  name: string;
  type: string;
  enabled?: boolean;
  priority?: ServicePriority;
  environment?: ServiceEnvironment;
  timeout?: number;
  health?: {
    enabled: boolean;
    interval: number;
    timeout: number;
    failureThreshold: number;
    successThreshold: number;
  };
  monitoring?: {
    enabled: boolean;
    metricsInterval: number;
    trackLatency: boolean;
    trackThroughput: boolean;
    trackErrors: boolean;
    trackMemoryUsage: boolean;
  };

  // Data service specific configuration
  /** WebDataService integration settings */
  webData?: {
    enabled: boolean;
    mockData?: boolean;
    cacheResponses?: boolean;
    cacheTTL?: number;
  };

  /** DocumentService integration settings */
  documentData?: {
    enabled: boolean;
    databaseType?: 'postgresql' | 'sqlite' | 'mysql';
    autoInitialize?: boolean;
    searchIndexing?: boolean;
  };

  /** Performance optimization settings */
  performance?: {
    enableRequestDeduplication?: boolean;
    maxConcurrency?: number;
    requestTimeout?: number;
    enableMetricsCollection?: boolean;
  };

  /** Retry configuration for failed operations */
  retry?: {
    enabled: boolean;
    maxAttempts: number;
    backoffMultiplier: number;
    retryableOperations: string[];
  };

  /** Cache configuration for data operations */
  cache?: {
    enabled: boolean;
    strategy: 'memory' | 'redis' | 'hybrid';
    defaultTTL: number;
    maxSize: number;
    keyPrefix: string;
  };
}

/**
 * Data operation metrics for performance monitoring.
 *
 * @example
 */
interface DataOperationMetrics {
  operationName: string;
  executionTime: number;
  success: boolean;
  dataSize?: number;
  cacheHit?: boolean;
  retryCount?: number;
  timestamp: Date;
}

/**
 * Cache entry structure for data caching.
 *
 * @example
 */
interface CacheEntry<T = any> {
  data: T;
  timestamp: Date;
  ttl: number;
  accessed: Date;
  accessCount: number;
}

/**
 * Request deduplication entry.
 *
 * @example
 */
interface PendingRequest<T = any> {
  promise: Promise<T>;
  timestamp: Date;
  requestCount: number;
}

/**
 * Unified Data Service Adapter.
 *
 * Provides a unified interface to WebDataService and DocumentService.
 * While implementing the IService interface for USL compatibility.
 *
 * Features:
 * - Unified configuration management
 * - Performance monitoring and metrics
 * - Request caching and deduplication
 * - Retry logic with backoff
 * - Health monitoring
 * - Event forwarding
 * - Error handling and recovery.
 *
 * @example
 */
export class DataServiceAdapter implements IService {
  // Core service properties
  public readonly name: string;
  public readonly type: string;
  public readonly config: DataServiceAdapterConfig;

  // Service state
  private lifecycleStatus: ServiceLifecycleStatus = 'uninitialized';
  private eventEmitter = new EventEmitter();
  private logger: ILogger;
  private startTime?: Date;
  private operationCount = 0;
  private successCount = 0;
  private errorCount = 0;
  private totalLatency = 0;
  private dependencies = new Map<string, ServiceDependencyConfig>();

  // Integrated services
  private webDataService?: WebDataService;
  private documentService?: DocumentService;

  // Performance optimization.
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, PendingRequest>();
  private metrics: DataOperationMetrics[] = [];
  private healthStats = {
    lastHealthCheck: new Date(),
    consecutiveFailures: 0,
    totalHealthChecks: 0,
    healthCheckFailures: 0,
  };

  constructor(config: DataServiceAdapterConfig) {
    this.name = config?.name;
    this.type = config?.type;
    this.config = {
      // Default configuration values
      webData: {
        enabled: true,
        mockData: true,
        cacheResponses: true,
        cacheTTL: 300000, // 5 minutes
        ...config?.webData,
      },
      documentData: {
        enabled: true,
        databaseType: 'postgresql',
        autoInitialize: true,
        searchIndexing: true,
        ...config?.documentData,
      },
      performance: {
        enableRequestDeduplication: true,
        maxConcurrency: 10,
        requestTimeout: 30000,
        enableMetricsCollection: true,
        ...config?.performance,
      },
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 2,
        retryableOperations: [
          'system-status',
          'swarms',
          'tasks',
          'documents',
          'document-query',
          'document-search',
          'document-create',
        ],
        ...config?.retry,
      },
      cache: {
        enabled: true,
        strategy: 'memory',
        defaultTTL: 300000, // 5 minutes
        maxSize: 1000,
        keyPrefix: 'data-adapter:',
        ...config?.cache,
      },
      ...config,
    };

    this.logger = getLogger(`DataServiceAdapter:${this.name}`);
    this.logger.info(`Creating data service adapter: ${this.name}`);
  }

  // ============================================
  // IService Interface Implementation
  // ============================================

  /**
   * Initialize the data service adapter and its dependencies.
   *
   * @param config
   */
  async initialize(config?: Partial<ServiceConfig>): Promise<void> {
    this.logger.info(`Initializing data service adapter: ${this.name}`);
    this.lifecycleStatus = 'initializing';
    this.emit('initializing');

    try {
      // Apply configuration updates if provided
      if (config) {
        Object.assign(this.config, config);
      }

      // Validate configuration
      const isValidConfig = await this.validateConfig(
        this.config as ServiceConfig
      );
      if (!isValidConfig) {
        throw new Error('Invalid data service adapter configuration');
      }

      // Initialize WebDataService if enabled
      if (this.config.webData?.enabled) {
        this.logger.debug('Initializing WebDataService integration');
        this.webDataService = new WebDataService();
        await this.addDependency({
          serviceName: 'web-data-service',
          required: true,
          healthCheck: true,
          timeout: 5000,
          retries: 2,
        });
      }

      // Initialize DocumentService if enabled
      if (this.config.documentData?.enabled) {
        this.logger.debug('Initializing DocumentService integration');
        this.documentService = new DocumentService(
          this.config.documentData.databaseType || 'postgresql'
        );

        if (this.config.documentData.autoInitialize) {
          await this.documentService.initialize();
        }

        await this.addDependency({
          serviceName: 'document-service',
          required: true,
          healthCheck: true,
          timeout: 10000,
          retries: 3,
        });
      }

      // Initialize cache if enabled
      if (this.config.cache?.enabled) {
        this.logger.debug('Cache system initialized');
        this.startCacheCleanupTimer();
      }

      // Initialize metrics collection if enabled
      if (this.config.performance?.enableMetricsCollection) {
        this.logger.debug('Metrics collection initialized');
        this.startMetricsCleanupTimer();
      }

      this.lifecycleStatus = 'initialized';
      this.emit('initialized');
      this.logger.info(
        `Data service adapter initialized successfully: ${this.name}`
      );
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', error);
      this.logger.error(
        `Failed to initialize data service adapter ${this.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Start the data service adapter.
   */
  async start(): Promise<void> {
    this.logger.info(`Starting data service adapter: ${this.name}`);

    if (this.lifecycleStatus !== 'initialized') {
      throw new Error(`Cannot start service in ${this.lifecycleStatus} state`);
    }

    this.lifecycleStatus = 'starting';
    this.emit('starting');

    try {
      // Check dependencies before starting
      const dependenciesOk = await this.checkDependencies();
      if (!dependenciesOk) {
        throw new Error(
          `ServiceDependencyError: ${this.name} - One or more dependencies failed`
        );
      }

      this.startTime = new Date();
      this.lifecycleStatus = 'running';
      this.emit('started');
      this.logger.info(
        `Data service adapter started successfully: ${this.name}`
      );
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', error);
      this.logger.error(
        `Failed to start data service adapter ${this.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Stop the data service adapter.
   */
  async stop(): Promise<void> {
    this.logger.info(`Stopping data service adapter: ${this.name}`);
    this.lifecycleStatus = 'stopping';
    this.emit('stopping');

    try {
      // Clear any pending requests
      this.pendingRequests.clear();

      // Clear cache if needed
      if (this.config.cache?.enabled) {
        this.cache.clear();
      }

      this.lifecycleStatus = 'stopped';
      this.emit('stopped');
      this.logger.info(
        `Data service adapter stopped successfully: ${this.name}`
      );
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', error);
      this.logger.error(
        `Failed to stop data service adapter ${this.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Destroy the data service adapter and clean up resources.
   */
  async destroy(): Promise<void> {
    this.logger.info(`Destroying data service adapter: ${this.name}`);

    try {
      // Stop the service if still running
      if (this.lifecycleStatus === 'running') {
        await this.stop();
      }

      // Clear all data structures
      this.cache.clear();
      this.pendingRequests.clear();
      this.metrics.length = 0;
      this.dependencies.clear();

      // Clear services
      this.webDataService = undefined;
      this.documentService = undefined;

      // Remove all event listeners
      this.eventEmitter.removeAllListeners();

      this.lifecycleStatus = 'destroyed';
      this.logger.info(
        `Data service adapter destroyed successfully: ${this.name}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to destroy data service adapter ${this.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get service status information.
   */
  async getStatus(): Promise<ServiceStatus> {
    const now = new Date();
    const uptime = this.startTime
      ? now.getTime() - this.startTime.getTime()
      : 0;
    const errorRate =
      this.operationCount > 0
        ? (this.errorCount / this.operationCount) * 100
        : 0;

    // Check dependency statuses
    const dependencyStatuses: {
      [serviceName: string]: {
        status: 'healthy' | 'unhealthy' | 'unknown';
        lastCheck: Date;
      };
    } = {};

    if (this.webDataService && this.config.webData?.enabled) {
      try {
        const stats = this.webDataService.getServiceStats();
        dependencyStatuses['web-data-service'] = {
          status: stats.averageResponseTime < 5000 ? 'healthy' : 'unhealthy',
          lastCheck: now,
        };
      } catch {
        dependencyStatuses['web-data-service'] = {
          status: 'unhealthy',
          lastCheck: now,
        };
      }
    }

    if (this.documentService && this.config.documentData?.enabled) {
      dependencyStatuses['document-service'] = {
        status: 'healthy', // DocumentService doesn't have health check method
        lastCheck: now,
      };
    }

    return {
      name: this.name,
      type: this.type,
      lifecycle: this.lifecycleStatus,
      health: this.determineHealthStatus(errorRate),
      lastCheck: now,
      uptime,
      errorCount: this.errorCount,
      errorRate,
      dependencies: dependencyStatuses,
      metadata: {
        operationCount: this.operationCount,
        successCount: this.successCount,
        cacheSize: this.cache.size,
        pendingRequests: this.pendingRequests.size,
        webDataEnabled: this.config.webData?.enabled,
        documentDataEnabled: this.config.documentData?.enabled,
      },
    };
  }

  /**
   * Get service performance metrics.
   */
  async getMetrics(): Promise<ServiceMetrics> {
    const now = new Date();
    const recentMetrics = this.metrics.filter(
      (m) => now.getTime() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    const avgLatency =
      this.operationCount > 0 ? this.totalLatency / this.operationCount : 0;
    const throughput =
      recentMetrics.length > 0 ? recentMetrics.length / 300 : 0; // ops per second

    // Calculate percentile latencies from recent metrics
    const latencies = recentMetrics
      .map((m) => m.executionTime)
      .sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    return {
      name: this.name,
      type: this.type,
      operationCount: this.operationCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      averageLatency: avgLatency,
      p95Latency: latencies[p95Index] || 0,
      p99Latency: latencies[p99Index] || 0,
      throughput,
      memoryUsage: {
        used: this.estimateMemoryUsage(),
        total: this.config.cache?.maxSize || 1000,
        percentage:
          (this.cache.size / (this.config.cache?.maxSize || 1000)) * 100,
      },
      customMetrics: {
        cacheHitRate: this.calculateCacheHitRate(),
        pendingRequestsCount: this.pendingRequests.size,
        avgRequestDeduplicationRate: this.calculateDeduplicationRate(),
      },
      timestamp: now,
    };
  }

  /**
   * Perform health check on the service.
   */
  async healthCheck(): Promise<boolean> {
    this.healthStats.totalHealthChecks++;
    this.healthStats.lastHealthCheck = new Date();

    try {
      // Check service state
      if (this.lifecycleStatus !== 'running') {
        this.healthStats.consecutiveFailures++;
        this.healthStats.healthCheckFailures++;
        return false;
      }

      // Check dependencies
      const dependenciesHealthy = await this.checkDependencies();
      if (!dependenciesHealthy) {
        this.healthStats.consecutiveFailures++;
        this.healthStats.healthCheckFailures++;
        return false;
      }

      // Check WebDataService if enabled
      if (this.webDataService && this.config.webData?.enabled) {
        try {
          const stats = this.webDataService.getServiceStats();
          if (stats.averageResponseTime > 10000) {
            // 10 second threshold
            this.healthStats.consecutiveFailures++;
            this.healthStats.healthCheckFailures++;
            return false;
          }
        } catch (error) {
          this.logger.warn('WebDataService health check failed:', error);
          this.healthStats.consecutiveFailures++;
          this.healthStats.healthCheckFailures++;
          return false;
        }
      }

      // Check cache health
      if (this.config.cache?.enabled) {
        const maxSize = this.config.cache.maxSize || 1000;
        if (this.cache.size > maxSize * 1.2) {
          // 20% overage threshold
          this.logger.warn(
            `Cache size (${this.cache.size}) significantly exceeds limit (${maxSize})`
          );
          this.healthStats.consecutiveFailures++;
          this.healthStats.healthCheckFailures++;
          return false;
        }
      }

      // Reset consecutive failures on success
      this.healthStats.consecutiveFailures = 0;
      return true;
    } catch (error) {
      this.logger.error(`Health check failed for ${this.name}:`, error);
      this.healthStats.consecutiveFailures++;
      this.healthStats.healthCheckFailures++;
      return false;
    }
  }

  /**
   * Update service configuration.
   *
   * @param config
   */
  async updateConfig(config: Partial<ServiceConfig>): Promise<void> {
    this.logger.info(
      `Updating configuration for data service adapter: ${this.name}`
    );

    try {
      // Validate the updated configuration
      const newConfig = { ...this.config, ...config };
      const isValid = await this.validateConfig(newConfig as ServiceConfig);
      if (!isValid) {
        throw new Error('Invalid configuration update');
      }

      // Apply the configuration
      Object.assign(this.config, config);

      this.logger.info(`Configuration updated successfully for: ${this.name}`);
    } catch (error) {
      this.logger.error(
        `Failed to update configuration for ${this.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Validate service configuration.
   *
   * @param config
   */
  async validateConfig(config: ServiceConfig): Promise<boolean> {
    try {
      // Basic validation
      if (!(config?.name && config?.type)) {
        this.logger.error(
          'Configuration missing required fields: name or type'
        );
        return false;
      }

      // Cast to DataServiceAdapterConfig for specific validations
      const dataConfig = config as DataServiceAdapterConfig;

      // Validate web data configuration
      if (
        dataConfig?.webData?.enabled &&
        dataConfig?.webData?.cacheTTL &&
        dataConfig?.webData?.cacheTTL < 1000
      ) {
        this.logger.error('WebData cache TTL must be at least 1000ms');
        return false;
      }

      // Validate document data configuration
      if (dataConfig?.documentData?.enabled) {
        const validDbTypes = ['postgresql', 'sqlite', 'mysql'];
        if (
          dataConfig?.documentData?.databaseType &&
          !validDbTypes.includes(dataConfig?.documentData?.databaseType)
        ) {
          this.logger.error(
            `Invalid database type: ${dataConfig?.documentData?.databaseType}`
          );
          return false;
        }
      }

      // Validate performance configuration
      if (
        dataConfig?.performance?.maxConcurrency &&
        dataConfig?.performance?.maxConcurrency < 1
      ) {
        this.logger.error('Max concurrency must be at least 1');
        return false;
      }

      // Validate retry configuration
      if (
        dataConfig?.retry?.enabled &&
        dataConfig?.retry?.maxAttempts &&
        dataConfig?.retry?.maxAttempts < 1
      ) {
        this.logger.error('Retry max attempts must be at least 1');
        return false;
      }

      // Validate cache configuration
      if (
        dataConfig?.cache?.enabled &&
        dataConfig?.cache?.maxSize &&
        dataConfig?.cache?.maxSize < 1
      ) {
        this.logger.error('Cache max size must be at least 1');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Configuration validation error: ${error}`);
      return false;
    }
  }

  /**
   * Check if service is ready to handle operations.
   */
  isReady(): boolean {
    return this.lifecycleStatus === 'running';
  }

  /**
   * Get service capabilities.
   */
  getCapabilities(): string[] {
    const capabilities = ['data-operations'];

    if (this.config.webData?.enabled) {
      capabilities.push(
        'system-status',
        'swarm-management',
        'task-management',
        'document-listing',
        'command-execution'
      );
    }

    if (this.config.documentData?.enabled) {
      capabilities.push(
        'document-crud',
        'document-search',
        'document-querying',
        'project-management',
        'workflow-management'
      );
    }

    if (this.config.cache?.enabled) {
      capabilities.push('caching', 'performance-optimization');
    }

    if (this.config.retry?.enabled) {
      capabilities.push('retry-logic', 'fault-tolerance');
    }

    return capabilities;
  }

  /**
   * Execute service operations with unified interface.
   *
   * @param operation
   * @param params
   * @param options
   */
  async execute<T = any>(
    operation: string,
    params?: unknown,
    options?: ServiceOperationOptions
  ): Promise<ServiceOperationResponse<T>> {
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const startTime = Date.now();

    this.logger.debug(`Executing operation: ${operation}`, {
      operationId,
      params,
    });

    try {
      // Check if service is ready
      if (!this.isReady()) {
        throw new Error(
          `ServiceOperationError: ${this.name} - Operation ${operation} failed: Service not ready`
        );
      }

      // Apply timeout if specified
      const timeout =
        options?.timeout || this.config.performance?.requestTimeout || 30000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                `ServiceTimeoutError: ${this.name} - Operation ${operation} timed out after ${timeout}ms`
              )
            ),
          timeout
        );
      });

      // Execute operation with timeout
      const operationPromise = this.executeOperationInternal<T>(
        operation,
        params,
        options
      );
      const result = await Promise.race([operationPromise, timeoutPromise]);

      const duration = Date.now() - startTime;

      // Record success metrics
      this.recordOperationMetrics({
        operationName: operation,
        executionTime: duration,
        success: true,
        dataSize: this.estimateDataSize(result),
        timestamp: new Date(),
      });

      this.operationCount++;
      this.successCount++;
      this.totalLatency += duration;

      this.emit('operation', {
        operationId,
        operation,
        success: true,
        duration,
      });

      return {
        success: true,
        data: result,
        metadata: {
          duration,
          timestamp: new Date(),
          operationId,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record error metrics
      this.recordOperationMetrics({
        operationName: operation,
        executionTime: duration,
        success: false,
        timestamp: new Date(),
      });

      this.operationCount++;
      this.errorCount++;
      this.totalLatency += duration;

      this.emit('operation', {
        operationId,
        operation,
        success: false,
        duration,
        error,
      });
      this.emit('error', error);

      this.logger.error(`Operation ${operation} failed:`, error);

      return {
        success: false,
        error: {
          code: (error as any)?.code || 'OPERATION_ERROR',
          message: error.message,
          details: params,
          stack: error.stack,
        },
        metadata: {
          duration,
          timestamp: new Date(),
          operationId,
        },
      };
    }
  }

  // ============================================
  // Event Management
  // ============================================

  on(event: ServiceEventType, handler: (event: ServiceEvent) => void): void {
    this.eventEmitter.on(event, handler);
  }

  off(event: ServiceEventType, handler?: (event: ServiceEvent) => void): void {
    if (handler) {
      this.eventEmitter.off(event, handler);
    } else {
      this.eventEmitter.removeAllListeners(event);
    }
  }

  emit(event: ServiceEventType, data?: unknown, error?: Error): void {
    const serviceEvent: ServiceEvent = {
      type: event,
      serviceName: this.name,
      timestamp: new Date(),
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
    };
    this.eventEmitter.emit(event, serviceEvent);
  }

  // ============================================
  // Dependency Management
  // ============================================

  async addDependency(dependency: ServiceDependencyConfig): Promise<void> {
    this.logger.debug(
      `Adding dependency ${dependency.serviceName} for ${this.name}`
    );
    this.dependencies.set(dependency.serviceName, dependency);
  }

  async removeDependency(serviceName: string): Promise<void> {
    this.logger.debug(`Removing dependency ${serviceName} for ${this.name}`);
    this.dependencies.delete(serviceName);
  }

  async checkDependencies(): Promise<boolean> {
    if (this.dependencies.size === 0) {
      return true;
    }

    try {
      const dependencyChecks = Array.from(this.dependencies.entries()).map(
        async ([name, config]) => {
          if (!config?.healthCheck) {
            return true; // Skip health check if not required
          }

          try {
            // Simulate dependency health check
            // In a real implementation, this would check the actual dependency
            return true;
          } catch (error) {
            this.logger.warn(`Dependency ${name} health check failed:`, error);
            return !config?.required; // Return false only if dependency is required
          }
        }
      );

      const results = await Promise.all(dependencyChecks);
      return results?.every((result) => result === true);
    } catch (error) {
      this.logger.error(`Error checking dependencies for ${this.name}:`, error);
      return false;
    }
  }

  // ============================================
  // Internal Operation Execution
  // ============================================

  /**
   * Internal operation execution with caching, deduplication, and retry logic.
   *
   * @param operation
   * @param params
   * @param options
   */
  private async executeOperationInternal<T = any>(
    operation: string,
    params?: unknown,
    options?: ServiceOperationOptions
  ): Promise<T> {
    // Generate cache key
    const cacheKey = this.generateCacheKey(operation, params);

    // Check cache first if enabled
    if (this.config.cache?.enabled && this.isCacheableOperation(operation)) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for operation: ${operation}`);
        this.recordOperationMetrics({
          operationName: operation,
          executionTime: 0,
          success: true,
          cacheHit: true,
          timestamp: new Date(),
        });
        return cached;
      }
    }

    // Check for request deduplication
    if (this.config.performance?.enableRequestDeduplication) {
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        this.logger.debug(`Request deduplication for operation: ${operation}`);
        pending.requestCount++;
        return await pending.promise;
      }
    }

    // Execute operation with retry logic
    const executionPromise = this.executeWithRetry<T>(
      operation,
      params,
      options
    );

    // Store pending request for deduplication
    if (this.config.performance?.enableRequestDeduplication) {
      this.pendingRequests.set(cacheKey, {
        promise: executionPromise,
        timestamp: new Date(),
        requestCount: 1,
      });
    }

    try {
      const result = await executionPromise;

      // Cache the result if enabled
      if (this.config.cache?.enabled && this.isCacheableOperation(operation)) {
        this.setInCache(cacheKey, result);
      }

      return result;
    } finally {
      // Clean up pending request
      if (this.config.performance?.enableRequestDeduplication) {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  /**
   * Execute operation with retry logic.
   *
   * @param operation
   * @param params
   * @param options
   * @param attempt
   */
  private async executeWithRetry<T = any>(
    operation: string,
    params?: unknown,
    options?: ServiceOperationOptions,
    attempt = 1
  ): Promise<T> {
    try {
      return await this.performOperation<T>(operation, params, options);
    } catch (error) {
      const shouldRetry = this.shouldRetryOperation(operation, error, attempt);

      if (shouldRetry && attempt < (this.config.retry?.maxAttempts || 3)) {
        const delay =
          (this.config.retry?.backoffMultiplier || 2) ** (attempt - 1) * 1000;
        this.logger.warn(
          `Operation ${operation} failed (attempt ${attempt}), retrying in ${delay}ms:`,
          error
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        this.recordOperationMetrics({
          operationName: operation,
          executionTime: 0,
          success: false,
          retryCount: attempt,
          timestamp: new Date(),
        });

        return await this.executeWithRetry<T>(
          operation,
          params,
          options,
          attempt + 1
        );
      }

      throw error;
    }
  }

  /**
   * Perform the actual operation based on operation type.
   *
   * @param operation
   * @param params
   * @param options
   * @param _options
   */
  private async performOperation<T = any>(
    operation: string,
    params?: unknown,
    _options?: ServiceOperationOptions
  ): Promise<T> {
    switch (operation) {
      // WebDataService operations
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

      // DocumentService operations
      case 'document-create':
        return (await this.createDocument(
          params?.document,
          params?.options
        )) as T;

      case 'document-get':
        return (await this.getDocument(params?.id, params?.options)) as T;

      case 'document-update':
        return (await this.updateDocument(
          params?.id,
          params?.updates,
          params?.options
        )) as T;

      case 'document-delete':
        return (await this.deleteDocument(params?.id)) as T;

      case 'document-query':
        return (await this.queryDocuments(
          params?.filters,
          params?.options
        )) as T;

      case 'document-search':
        return (await this.searchDocuments(params?.searchOptions)) as T;

      case 'project-create':
        return (await this.createProject(params?.project)) as T;

      case 'project-get':
        return (await this.getProjectWithDocuments(params?.projectId)) as T;

      // Utility operations
      case 'cache-stats':
        return this.getCacheStats() as T;

      case 'clear-cache':
        return (await this.clearCache()) as T;

      case 'service-stats':
        return (await this.getServiceStats()) as T;

      default:
        throw new Error(
          `ServiceOperationError: ${this.name} - Operation ${operation} failed: Unknown operation`
        );
    }
  }

  // ============================================
  // WebDataService Integration Methods
  // ============================================

  private async getSystemStatus(): Promise<SystemStatusData> {
    if (!this.webDataService) {
      throw new Error('WebDataService not available');
    }
    return await this.webDataService.getSystemStatus();
  }

  private async getSwarms(): Promise<SwarmData[]> {
    if (!this.webDataService) {
      throw new Error('WebDataService not available');
    }
    return await this.webDataService.getSwarms();
  }

  private async createSwarm(config: unknown): Promise<SwarmData> {
    if (!this.webDataService) {
      throw new Error('WebDataService not available');
    }
    return await this.webDataService.createSwarm(config);
  }

  private async getTasks(): Promise<TaskData[]> {
    if (!this.webDataService) {
      throw new Error('WebDataService not available');
    }
    return await this.webDataService.getTasks();
  }

  private async createTask(config: unknown): Promise<TaskData> {
    if (!this.webDataService) {
      throw new Error('WebDataService not available');
    }
    return await this.webDataService.createTask(config);
  }

  private async getDocuments(): Promise<DocumentData[]> {
    if (!this.webDataService) {
      throw new Error('WebDataService not available');
    }
    return await this.webDataService.getDocuments();
  }

  private async executeCommand(
    command: string,
    args: unknown[]
  ): Promise<CommandResult> {
    if (!this.webDataService) {
      throw new Error('WebDataService not available');
    }
    return await this.webDataService.executeCommand(command, args);
  }

  // ============================================
  // DocumentService Integration Methods
  // ============================================

  private async createDocument<T extends BaseDocumentEntity>(
    document: Omit<T, 'id' | 'created_at' | 'updated_at' | 'checksum'>,
    options?: DocumentCreateOptions
  ): Promise<T> {
    if (!this.documentService) {
      throw new Error('DocumentService not available');
    }
    return await this.documentService.createDocument<T>(document, options);
  }

  private async getDocument<T extends BaseDocumentEntity>(
    id: string,
    options?: DocumentQueryOptions
  ): Promise<T | null> {
    if (!this.documentService) {
      throw new Error('DocumentService not available');
    }
    return await this.documentService.getDocument<T>(id, options);
  }

  private async updateDocument<T extends BaseDocumentEntity>(
    id: string,
    updates: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'checksum'>>,
    options?: DocumentCreateOptions
  ): Promise<T> {
    if (!this.documentService) {
      throw new Error('DocumentService not available');
    }
    return await this.documentService.updateDocument<T>(id, updates, options);
  }

  private async deleteDocument(id: string): Promise<void> {
    if (!this.documentService) {
      throw new Error('DocumentService not available');
    }
    return await this.documentService.deleteDocument(id);
  }

  private async queryDocuments<T extends BaseDocumentEntity>(
    filters: {
      type?: DocumentType | DocumentType[];
      projectId?: string;
      status?: string | string[];
      priority?: string | string[];
      author?: string;
      tags?: string[];
      parentDocumentId?: string;
      workflowStage?: string;
    },
    options?: DocumentQueryOptions
  ): Promise<{
    documents: T[];
    total: number;
    hasMore: boolean;
  }> {
    if (!this.documentService) {
      throw new Error('DocumentService not available');
    }
    return await this.documentService.queryDocuments<T>(filters, options);
  }

  private async searchDocuments<T extends BaseDocumentEntity>(
    searchOptions: DocumentSearchOptions
  ): Promise<{
    documents: T[];
    total: number;
    hasMore: boolean;
    searchMetadata: {
      searchType: string;
      query: string;
      processingTime: number;
      relevanceScores?: number[];
    };
  }> {
    if (!this.documentService) {
      throw new Error('DocumentService not available');
    }
    return await this.documentService.searchDocuments<T>(searchOptions);
  }

  private async createProject(project: unknown): Promise<unknown> {
    if (!this.documentService) {
      throw new Error('DocumentService not available');
    }
    return await this.documentService.createProject(project);
  }

  private async getProjectWithDocuments(projectId: string): Promise<unknown> {
    if (!this.documentService) {
      throw new Error('DocumentService not available');
    }
    return await this.documentService.getProjectWithDocuments(projectId);
  }

  // ============================================
  // Utility and Stats Methods
  // ============================================

  private getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.cache?.maxSize || 1000,
      hitRate: this.calculateCacheHitRate(),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private async clearCache(): Promise<{ cleared: number }> {
    const cleared = this.cache.size;
    this.cache.clear();
    this.logger.info(`Cleared ${cleared} items from cache`);
    return { cleared };
  }

  private async getServiceStats(): Promise<{
    operationCount: number;
    successCount: number;
    errorCount: number;
    avgLatency: number;
    cacheHitRate: number;
    pendingRequests: number;
    healthStats: {
      lastHealthCheck: Date;
      consecutiveFailures: number;
      totalHealthChecks: number;
      healthCheckFailures: number;
    };
  }> {
    return {
      operationCount: this.operationCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      avgLatency:
        this.operationCount > 0 ? this.totalLatency / this.operationCount : 0,
      cacheHitRate: this.calculateCacheHitRate(),
      pendingRequests: this.pendingRequests.size,
      healthStats: { ...this.healthStats },
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private generateCacheKey(operation: string, params?: unknown): string {
    const prefix = this.config.cache?.keyPrefix || 'data-adapter:';
    const paramsHash = params ? JSON.stringify(params) : '';
    return `${prefix}${operation}:${Buffer.from(paramsHash).toString('base64')}`;
  }

  private isCacheableOperation(operation: string): boolean {
    const cacheableOps = [
      'system-status',
      'swarms',
      'tasks',
      'documents',
      'document-get',
      'document-query',
      'document-search',
      'project-get',
    ];
    return cacheableOps.includes(operation);
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = new Date();
    if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.accessed = now;
    entry.accessCount++;
    return entry.data;
  }

  private setInCache<T>(key: string, data: T): void {
    const now = new Date();
    const ttl = this.config.cache?.defaultTTL || 300000;

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessed: now,
      accessCount: 1,
    });

    // Cleanup cache if it exceeds max size
    if (this.cache.size > (this.config.cache?.maxSize || 1000)) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    const maxSize = this.config.cache?.maxSize || 1000;
    const targetSize = Math.floor(maxSize * 0.8); // Clean to 80% of max size

    if (this.cache.size <= targetSize) {
      return;
    }

    // Sort by least recently used and lowest access count
    const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => {
      const aScore = a.accessed.getTime() + a.accessCount * 1000;
      const bScore = b.accessed.getTime() + b.accessCount * 1000;
      return aScore - bScore;
    });

    const toRemove = this.cache.size - targetSize;
    for (let i = 0; i < toRemove; i++) {
      const entryKey = entries[i]?.[0];
      if (entryKey !== undefined) {
        this.cache.delete(entryKey);
      }
    }

    this.logger.debug(`Cache cleanup: removed ${toRemove} entries`);
  }

  private shouldRetryOperation(
    operation: string,
    error: unknown,
    attempt: number
  ): boolean {
    if (!this.config.retry?.enabled) {
      return false;
    }

    if (!this.config.retry.retryableOperations.includes(operation)) {
      return false;
    }

    if (attempt >= (this.config.retry.maxAttempts || 3)) {
      return false;
    }

    // Don't retry certain types of errors
    if (
      error?.message?.includes('ServiceTimeoutError') &&
      error.message.includes('timeout')
    ) {
      // Extract timeout value from error message if possible
      const timeoutMatch = error.message.match(/after (\d+)ms/);
      const timeout = timeoutMatch ? Number.parseInt(timeoutMatch[1]) : 5000;
      if (timeout < 5000) {
        return false; // Don't retry short timeouts
      }
    }

    return true;
  }

  private recordOperationMetrics(metrics: DataOperationMetrics): void {
    if (!this.config.performance?.enableMetricsCollection) {
      return;
    }

    this.metrics.push(metrics);

    // Keep only recent metrics
    const cutoff = new Date(Date.now() - 3600000); // 1 hour
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
  }

  private calculateCacheHitRate(): number {
    const recentMetrics = this.metrics.filter(
      (m) => Date.now() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    if (recentMetrics.length === 0) {
      return 0;
    }

    const cacheHits = recentMetrics.filter((m) => m.cacheHit).length;
    return (cacheHits / recentMetrics.length) * 100;
  }

  private calculateDeduplicationRate(): number {
    const deduplicatedRequests = Array.from(
      this.pendingRequests.values()
    ).reduce((sum, req) => sum + (req.requestCount - 1), 0);

    const totalRequests = this.operationCount + deduplicatedRequests;
    return totalRequests > 0 ? (deduplicatedRequests / totalRequests) * 100 : 0;
  }

  private estimateMemoryUsage(): number {
    let size = 0;

    // Estimate cache memory usage
    for (const entry of this.cache.values()) {
      size += this.estimateDataSize(entry.data) + 200; // 200 bytes for metadata
    }

    // Estimate pending requests memory usage
    size += this.pendingRequests.size * 100;

    // Estimate metrics memory usage
    size += this.metrics.length * 150;

    return size;
  }

  private estimateDataSize(data: unknown): number {
    if (!data) return 0;

    try {
      return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 1000; // Default estimate for non-serializable data
    }
  }

  private determineHealthStatus(
    errorRate: number
  ): 'healthy' | 'degraded' | 'unhealthy' | 'unknown' {
    if (this.healthStats.consecutiveFailures > 5) {
      return 'unhealthy';
    }
    if (errorRate > 10 || this.healthStats.consecutiveFailures > 2) {
      return 'degraded';
    }
    if (this.operationCount > 0) {
      return 'healthy';
    }
    return 'unknown';
  }

  private startCacheCleanupTimer(): void {
    setInterval(() => {
      this.cleanupCache();

      // Clean expired entries
      const now = new Date();
      for (const [key, entry] of this.cache.entries()) {
        if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Run every minute
  }

  private startMetricsCleanupTimer(): void {
    setInterval(() => {
      const cutoff = new Date(Date.now() - 3600000); // 1 hour
      this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
    }, 300000); // Run every 5 minutes
  }
}

/**
 * Factory function for creating DataServiceAdapter instances.
 *
 * @param config
 * @example
 */
export function createDataServiceAdapter(
  config: DataServiceAdapterConfig
): DataServiceAdapter {
  return new DataServiceAdapter(config);
}

/**
 * Helper function for creating default configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export function createDefaultDataServiceAdapterConfig(
  name: string,
  overrides?: Partial<DataServiceAdapterConfig>
): DataServiceAdapterConfig {
  return {
    name,
    type: ServiceType.DATA,
    enabled: true,
    priority: ServicePriority.NORMAL,
    environment: ServiceEnvironment.DEVELOPMENT,
    timeout: 30000,
    health: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
      failureThreshold: 3,
      successThreshold: 1,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 10000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      trackMemoryUsage: true,
    },
    webData: {
      enabled: true,
      mockData: true,
      cacheResponses: true,
      cacheTTL: 300000,
    },
    documentData: {
      enabled: true,
      databaseType: 'postgresql',
      autoInitialize: true,
      searchIndexing: true,
    },
    performance: {
      enableRequestDeduplication: true,
      maxConcurrency: 10,
      requestTimeout: 30000,
      enableMetricsCollection: true,
    },
    retry: {
      enabled: true,
      maxAttempts: 3,
      backoffMultiplier: 2,
      retryableOperations: [
        'system-status',
        'swarms',
        'tasks',
        'documents',
        'document-query',
        'document-search',
        'document-create',
      ],
    },
    cache: {
      enabled: true,
      strategy: 'memory',
      defaultTTL: 300000,
      maxSize: 1000,
      keyPrefix: 'data-adapter:',
    },
    ...overrides,
  };
}

export default DataServiceAdapter;
