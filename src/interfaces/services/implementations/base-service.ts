/**
 * Base Service Implementation.
 *
 * Abstract base class that provides common functionality for all service implementations.
 * Follows the same patterns established by the DAL and UACL systems.
 */
/**
 * @file Base service implementation.
 */

import { EventEmitter } from 'node:events';
import type { Logger } from '../../../config/logging-config.ts';
import { getLogger } from '../../../config/logging-config.ts';
import type {
  IService,
  ServiceConfig,
  ServiceDependencyConfig,
  ServiceEvent,
  ServiceEventType,
  ServiceLifecycleStatus,
  ServiceMetrics,
  ServiceOperationOptions,
  ServiceOperationResponse,
  ServiceStatus,
} from '../core/interfaces.ts';
import {
  ServiceConfigurationError,
  ServiceDependencyError,
  ServiceError,
  ServiceInitializationError,
  ServiceOperationError,
  ServiceTimeoutError,
} from '../core/interfaces.ts';

/**
 * Abstract base service class with common functionality.
 *
 * @example
 */
export abstract class BaseService extends EventEmitter implements IService {
  protected logger: Logger;
  protected lifecycleStatus: ServiceLifecycleStatus = 'uninitialized';
  protected startTime: Date | null = null;
  protected operationCount = 0;
  protected successCount = 0;
  protected errorCount = 0;
  protected latencyMetrics: number[] = [];
  protected dependencies = new Map<string, ServiceDependencyConfig>();
  protected capabilities: string[] = [];

  constructor(
    public readonly name: string,
    public readonly type: string,
    public config: ServiceConfig
  ) {
    super();
    this.logger = getLogger(`Service:${name}`);

    // Initialize dependencies
    if (config?.dependencies) {
      config?.dependencies?.forEach((dep) => {
        this.dependencies.set(dep.serviceName, dep);
      });
    }
  }

  // ============================================
  // Core Lifecycle Methods (Abstract)
  // ============================================

  /**
   * Perform service-specific initialization.
   * Must be implemented by concrete service classes.
   */
  protected abstract doInitialize(): Promise<void>;

  /**
   * Perform service-specific startup.
   * Must be implemented by concrete service classes.
   */
  protected abstract doStart(): Promise<void>;

  /**
   * Perform service-specific shutdown.
   * Must be implemented by concrete service classes.
   */
  protected abstract doStop(): Promise<void>;

  /**
   * Perform service-specific cleanup.
   * Must be implemented by concrete service classes.
   */
  protected abstract doDestroy(): Promise<void>;

  /**
   * Perform service-specific health check.
   * Must be implemented by concrete service classes.
   */
  protected abstract doHealthCheck(): Promise<boolean>;

  // ============================================
  // IService Implementation
  // ============================================

  async initialize(config?: Partial<ServiceConfig>): Promise<void> {
    if (this.lifecycleStatus !== 'uninitialized') {
      this.logger.warn(`Service ${this.name} is already initialized`);
      return;
    }

    this.logger.info(`Initializing service: ${this.name}`);
    this.lifecycleStatus = 'initializing';
    this.emit('initializing', this.createEvent('initializing'));

    try {
      // Update configuration if provided
      if (config) {
        await this.updateConfig(config);
      }

      // Validate configuration
      const isValid = await this.validateConfig(this.config);
      if (!isValid) {
        throw new ServiceConfigurationError(
          this.name,
          'Configuration validation failed'
        );
      }

      // Check dependencies
      if (this.config.dependencies && this.config.dependencies.length > 0) {
        const dependenciesOk = await this.checkDependencies();
        if (!dependenciesOk) {
          throw new ServiceDependencyError(
            this.name,
            'Dependencies not available'
          );
        }
      }

      // Perform service-specific initialization
      await this.doInitialize();

      this.lifecycleStatus = 'initialized';
      this.emit('initialized', this.createEvent('initialized'));
      this.logger.info(`Service ${this.name} initialized successfully`);
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', this.createEvent('error', undefined, error as Error));
      this.logger.error(`Service ${this.name} initialization failed:`, error);
      throw new ServiceInitializationError(this.name, error as Error);
    }
  }

  async start(): Promise<void> {
    if (this.lifecycleStatus === 'running') {
      this.logger.warn(`Service ${this.name} is already running`);
      return;
    }

    if (
      this.lifecycleStatus !== 'initialized' &&
      this.lifecycleStatus !== 'stopped'
    ) {
      throw new ServiceError(
        'Cannot start service that is not initialized',
        'INVALID_STATE',
        this.name
      );
    }

    this.logger.info(`Starting service: ${this.name}`);
    this.lifecycleStatus = 'starting';
    this.emit('starting', this.createEvent('starting'));

    try {
      // Check dependencies before starting
      if (this.dependencies.size > 0) {
        const dependenciesOk = await this.checkDependencies();
        if (!dependenciesOk) {
          throw new ServiceDependencyError(
            this.name,
            'Dependencies not available for startup'
          );
        }
      }

      // Perform service-specific startup
      await this.doStart();

      this.lifecycleStatus = 'running';
      this.startTime = new Date();
      this.emit('started', this.createEvent('started'));
      this.logger.info(`Service ${this.name} started successfully`);
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', this.createEvent('error', undefined, error as Error));
      this.logger.error(`Service ${this.name} startup failed:`, error);
      throw new ServiceOperationError(this.name, 'start', error as Error);
    }
  }

  async stop(): Promise<void> {
    if (
      this.lifecycleStatus === 'stopped' ||
      this.lifecycleStatus === 'uninitialized'
    ) {
      this.logger.warn(
        `Service ${this.name} is already stopped or not initialized`
      );
      return;
    }

    this.logger.info(`Stopping service: ${this.name}`);
    this.lifecycleStatus = 'stopping';
    this.emit('stopping', this.createEvent('stopping'));

    try {
      // Perform service-specific shutdown
      await this.doStop();

      this.lifecycleStatus = 'stopped';
      this.emit('stopped', this.createEvent('stopped'));
      this.logger.info(`Service ${this.name} stopped successfully`);
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', this.createEvent('error', undefined, error as Error));
      this.logger.error(`Service ${this.name} shutdown failed:`, error);
      throw new ServiceOperationError(this.name, 'stop', error as Error);
    }
  }

  async destroy(): Promise<void> {
    this.logger.info(`Destroying service: ${this.name}`);

    try {
      // Stop if still running
      if (this.lifecycleStatus === 'running') {
        await this.stop();
      }

      // Perform service-specific cleanup
      await this.doDestroy();

      // Clear metrics and state
      this.operationCount = 0;
      this.successCount = 0;
      this.errorCount = 0;
      this.latencyMetrics = [];
      this.dependencies.clear();

      // Remove all event listeners
      this.removeAllListeners();

      this.lifecycleStatus = 'destroyed';
      this.logger.info(`Service ${this.name} destroyed successfully`);
    } catch (error) {
      this.logger.error(`Service ${this.name} destruction failed:`, error);
      throw new ServiceOperationError(this.name, 'destroy', error as Error);
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    const errorRate =
      this.operationCount > 0
        ? (this.errorCount / this.operationCount) * 100
        : 0;

    // Check health
    let health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    try {
      const isHealthy = await this.doHealthCheck();
      if (isHealthy && errorRate < 5) {
        health = 'healthy';
      } else if (isHealthy && errorRate < 20) {
        health = 'degraded';
      } else {
        health = 'unhealthy';
      }
    } catch (error) {
      health = 'unknown';
      this.logger.debug(`Health check failed for service ${this.name}:`, error);
    }

    // Check dependency status
    const dependencies: ServiceStatus['dependencies'] = {};
    for (const [depName, _depConfig] of this.dependencies) {
      try {
        // In a real implementation, this would check the actual dependency service
        // For now, we'll simulate it
        dependencies[depName] = {
          status: 'healthy',
          lastCheck: new Date(),
        };
      } catch (_error) {
        dependencies[depName] = {
          status: 'unhealthy',
          lastCheck: new Date(),
        };
      }
    }

    return {
      name: this.name,
      type: this.type,
      lifecycle: this.lifecycleStatus,
      health,
      lastCheck: new Date(),
      uptime,
      errorCount: this.errorCount,
      errorRate,
      dependencies:
        Object.keys(dependencies).length > 0 ? dependencies : undefined,
      metadata: {
        operationCount: this.operationCount,
        successCount: this.successCount,
        ...this.config.metadata,
      },
    };
  }

  async getMetrics(): Promise<ServiceMetrics> {
    const averageLatency =
      this.latencyMetrics.length > 0
        ? this.latencyMetrics.reduce((sum, lat) => sum + lat, 0) /
          this.latencyMetrics.length
        : 0;

    const sortedLatencies = [...this.latencyMetrics].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p99Index = Math.floor(sortedLatencies.length * 0.99);

    const p95Latency = sortedLatencies[p95Index] || 0;
    const p99Latency = sortedLatencies[p99Index] || 0;

    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    const throughput = uptime > 0 ? this.operationCount / (uptime / 1000) : 0;

    return {
      name: this.name,
      type: this.type,
      operationCount: this.operationCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      averageLatency,
      p95Latency,
      p99Latency,
      throughput,
      timestamp: new Date(),
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (this.lifecycleStatus !== 'running') {
        return false;
      }

      const isHealthy = await this.doHealthCheck();
      this.emit(
        'health-check',
        this.createEvent('health-check', { healthy: isHealthy })
      );

      return isHealthy;
    } catch (error) {
      this.logger.error(`Health check failed for service ${this.name}:`, error);
      this.emit(
        'health-check',
        this.createEvent('health-check', { healthy: false }, error as Error)
      );
      return false;
    }
  }

  async updateConfig(config: Partial<ServiceConfig>): Promise<void> {
    this.logger.info(`Updating configuration for service: ${this.name}`);

    const newConfig = { ...this.config, ...config };

    // Validate new configuration
    const isValid = await this.validateConfig(newConfig);
    if (!isValid) {
      throw new ServiceConfigurationError(
        this.name,
        'Invalid configuration update'
      );
    }

    this.config = newConfig;

    // Update dependencies if changed
    if (config?.dependencies) {
      this.dependencies.clear();
      config?.dependencies?.forEach((dep) => {
        this.dependencies.set(dep.serviceName, dep);
      });
    }

    this.logger.info(`Configuration updated for service: ${this.name}`);
  }

  async validateConfig(config: ServiceConfig): Promise<boolean> {
    try {
      // Basic validation
      if (!(config?.name && config?.type)) {
        return false;
      }

      // Validate timeout
      if (config?.timeout && config?.timeout < 1000) {
        return false;
      }

      // Validate dependencies
      if (config?.dependencies) {
        for (const dep of config?.dependencies) {
          if (!dep.serviceName) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Configuration validation failed for service ${this.name}:`,
        error
      );
      return false;
    }
  }

  isReady(): boolean {
    return this.lifecycleStatus === 'running';
  }

  getCapabilities(): string[] {
    return [...this.capabilities];
  }

  async execute<T = any>(
    operation: string,
    params?: unknown,
    options?: ServiceOperationOptions
  ): Promise<ServiceOperationResponse<T>> {
    const operationId = `${this.name}-${operation}-${Date.now()}`;
    const startTime = Date.now();

    this.logger.debug(
      `Executing operation: ${operation} on service ${this.name}`
    );
    this.operationCount++;

    try {
      // Check if service is ready
      if (!this.isReady()) {
        throw new ServiceError(
          'Service is not ready',
          'SERVICE_NOT_READY',
          this.name
        );
      }

      // Apply timeout if specified
      const timeout = options?.timeout || this.config.timeout || 30000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new ServiceTimeoutError(this.name, operation, timeout)),
          timeout
        )
      );

      // Execute the operation (to be implemented by concrete services)
      const operationPromise = this.executeOperation(
        operation,
        params,
        options
      );
      const result = await Promise.race([operationPromise, timeoutPromise]);

      // Record success metrics
      const duration = Date.now() - startTime;
      this.successCount++;
      this.recordLatency(duration);

      const response: ServiceOperationResponse<T> = {
        success: true,
        data: result as T,
        metadata: {
          duration,
          timestamp: new Date(),
          operationId,
        },
      };

      this.emit(
        'operation',
        this.createEvent('operation', {
          operation,
          success: true,
          duration,
          operationId,
        })
      );

      if (options?.trackMetrics !== false) {
        this.emit('metrics-update', this.createEvent('metrics-update'));
      }

      return response;
    } catch (error) {
      // Record error metrics
      const duration = Date.now() - startTime;
      this.errorCount++;
      this.recordLatency(duration);

      const response: ServiceOperationResponse<T> = {
        success: false,
        error: {
          code: error instanceof ServiceError ? error.code : 'OPERATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: params,
          stack: error instanceof Error ? error.stack : undefined,
        },
        metadata: {
          duration,
          timestamp: new Date(),
          operationId,
        },
      };

      this.emit(
        'operation',
        this.createEvent('operation', {
          operation,
          success: false,
          duration,
          operationId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      );

      this.logger.error(
        `Operation ${operation} failed on service ${this.name}:`,
        error
      );
      return response;
    }
  }

  async addDependency(dependency: ServiceDependencyConfig): Promise<void> {
    this.dependencies.set(dependency.serviceName, dependency);
    this.logger.info(
      `Added dependency ${dependency.serviceName} to service ${this.name}`
    );
  }

  async removeDependency(serviceName: string): Promise<void> {
    this.dependencies.delete(serviceName);
    this.logger.info(
      `Removed dependency ${serviceName} from service ${this.name}`
    );
  }

  async checkDependencies(): Promise<boolean> {
    if (this.dependencies.size === 0) {
      return true;
    }

    const dependencyChecks = Array.from(this.dependencies.entries()).map(
      async ([depName, depConfig]) => {
        try {
          // In a real implementation, this would check the actual dependency service
          // For now, we'll simulate a dependency check
          this.logger.debug(`Checking dependency: ${depName}`);

          // Simulate dependency check with timeout
          const _timeout = depConfig?.timeout || 5000;
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 100)
          );

          return { name: depName, available: true };
        } catch (error) {
          this.logger.warn(`Dependency check failed for ${depName}:`, error);
          return { name: depName, available: false };
        }
      }
    );

    const results = await Promise.allSettled(dependencyChecks);
    const failedDependencies = results
      ?.filter((result, _index) => {
        if (result?.status === 'fulfilled') {
          return !result?.value?.available;
        }
        return true; // Consider rejected promises as failed dependencies
      })
      .map((_, index) => Array.from(this.dependencies.keys())[index]);

    if (failedDependencies.length > 0) {
      // Check if any failed dependencies are required
      const requiredFailures = failedDependencies.filter((depName) => {
        const dep = this.dependencies.get(depName);
        return dep?.required === true;
      });

      if (requiredFailures.length > 0) {
        this.logger.error(
          `Required dependencies not available: ${requiredFailures.join(', ')}`
        );
        return false;
      }
      this.logger.warn(
        `Optional dependencies not available: ${failedDependencies.join(', ')}`
      );
    }

    return true;
  }

  // ============================================
  // EventEmitter Methods (Override for type safety)
  // ============================================

  on(event: ServiceEventType, handler: (event: ServiceEvent) => void): this {
    return super.on(event, handler);
  }

  off(event: ServiceEventType, handler?: (event: ServiceEvent) => void): this {
    if (handler) {
      return super.off(event, handler);
    }
    return super.removeAllListeners(event);
  }

  emit(event: ServiceEventType, data?: unknown, error?: Error): boolean {
    const serviceEvent = this.createEvent(event, data, error);
    return super.emit(event, serviceEvent);
  }

  // ============================================
  // Protected Helper Methods
  // ============================================

  /**
   * Execute service-specific operation.
   * Must be implemented by concrete service classes.
   */
  protected abstract executeOperation<T = any>(
    operation: string,
    params?: unknown,
    options?: ServiceOperationOptions
  ): Promise<T>;

  /**
   * Create a service event.
   *
   * @param type
   * @param data
   * @param error
   */
  protected createEvent(
    type: ServiceEventType,
    data?: unknown,
    error?: Error
  ): ServiceEvent {
    return {
      type,
      serviceName: this.name,
      timestamp: new Date(),
      data,
      error,
    };
  }

  /**
   * Record latency metric.
   *
   * @param latency
   */
  protected recordLatency(latency: number): void {
    this.latencyMetrics.push(latency);

    // Keep only last 1000 measurements for memory efficiency
    if (this.latencyMetrics.length > 1000) {
      this.latencyMetrics = this.latencyMetrics.slice(-1000);
    }
  }

  /**
   * Add capability to service.
   *
   * @param capability
   */
  protected addCapability(capability: string): void {
    if (!this.capabilities.includes(capability)) {
      this.capabilities.push(capability);
      this.logger.debug(
        `Added capability ${capability} to service ${this.name}`
      );
    }
  }

  /**
   * Remove capability from service.
   *
   * @param capability
   */
  protected removeCapability(capability: string): void {
    const index = this.capabilities.indexOf(capability);
    if (index >= 0) {
      this.capabilities.splice(index, 1);
      this.logger.debug(
        `Removed capability ${capability} from service ${this.name}`
      );
    }
  }

  /**
   * Execute operation with retries.
   *
   * @param operation
   * @param maxRetries
   * @param delay
   */
  protected async executeWithRetries<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Operation attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }
}

export default BaseService;
