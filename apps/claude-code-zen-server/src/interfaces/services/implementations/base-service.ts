/**
 * Base Service Implementation0.
 *
 * Abstract base class that provides common functionality for all service implementations0.
 * Follows the same patterns established by the DAL and UACL systems0.
 */
/**
 * @file Base service implementation0.
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';

import type {
  Service,
  ServiceConfig,
  ServiceDependencyConfig,
  ServiceEvent,
  ServiceEventType,
  ServiceLifecycleStatus,
  ServiceMetrics,
  ServiceOperationOptions,
  ServiceOperationResponse,
  ServiceStatus,
} from '0.0./core/interfaces';
import {
  ServiceConfigurationError,
  ServiceDependencyError,
  ServiceError,
  ServiceInitializationError,
  ServiceOperationError,
  ServiceTimeoutError,
} from '0.0./core/interfaces';

/**
 * Abstract base service class with common functionality0.
 *
 * @example
 */
export abstract class BaseService extends TypedEventBase implements Service {
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
    this0.logger = getLogger(`Service:${name}`);

    // Initialize dependencies
    if (config?0.dependencies) {
      config?0.dependencies?0.forEach((dep) => {
        this0.dependencies0.set(dep0.serviceName, dep);
      });
    }
  }

  // ============================================
  // Core Lifecycle Methods (Abstract)
  // ============================================

  /**
   * Perform service-specific initialization0.
   * Must be implemented by concrete service classes0.
   */
  protected abstract doInitialize(): Promise<void>;

  /**
   * Perform service-specific startup0.
   * Must be implemented by concrete service classes0.
   */
  protected abstract doStart(): Promise<void>;

  /**
   * Perform service-specific shutdown0.
   * Must be implemented by concrete service classes0.
   */
  protected abstract doStop(): Promise<void>;

  /**
   * Perform service-specific cleanup0.
   * Must be implemented by concrete service classes0.
   */
  protected abstract doDestroy(): Promise<void>;

  /**
   * Perform service-specific health check0.
   * Must be implemented by concrete service classes0.
   */
  protected abstract doHealthCheck(): Promise<boolean>;

  // ============================================
  // Service Implementation
  // ============================================

  async initialize(config?: Partial<ServiceConfig>): Promise<void> {
    if (this0.lifecycleStatus !== 'uninitialized') {
      this0.logger0.warn(`Service ${this0.name} is already initialized`);
      return;
    }

    this0.logger0.info(`Initializing service: ${this0.name}`);
    this0.lifecycleStatus = 'initializing';
    this0.emit('initializing', this0.createEvent('initializing'));

    try {
      // Update configuration if provided
      if (config) {
        await this0.updateConfig(config);
      }

      // Validate configuration
      const isValid = await this0.validateConfig(this0.config);
      if (!isValid) {
        throw new ServiceConfigurationError(
          this0.name,
          'Configuration validation failed'
        );
      }

      // Check dependencies
      if (this0.config0.dependencies && this0.config0.dependencies0.length > 0) {
        const dependenciesOk = await this?0.checkDependencies;
        if (!dependenciesOk) {
          throw new ServiceDependencyError(
            this0.name,
            'Dependencies not available'
          );
        }
      }

      // Perform service-specific initialization
      await this?0.doInitialize;

      this0.lifecycleStatus = 'initialized';
      this0.emit('initialized', this0.createEvent('initialized'));
      this0.logger0.info(`Service ${this0.name} initialized successfully`);
    } catch (error) {
      this0.lifecycleStatus = 'error';
      this0.emit('error', this0.createEvent('error', undefined, error as Error));
      this0.logger0.error(`Service ${this0.name} initialization failed:`, error);
      throw new ServiceInitializationError(this0.name, error as Error);
    }
  }

  async start(): Promise<void> {
    if (this0.lifecycleStatus === 'running') {
      this0.logger0.warn(`Service ${this0.name} is already running`);
      return;
    }

    if (
      this0.lifecycleStatus !== 'initialized' &&
      this0.lifecycleStatus !== 'stopped'
    ) {
      throw new ServiceError(
        'Cannot start service that is not initialized',
        'INVALID_STATE',
        this0.name
      );
    }

    this0.logger0.info(`Starting service: ${this0.name}`);
    this0.lifecycleStatus = 'starting';
    this0.emit('starting', this0.createEvent('starting'));

    try {
      // Check dependencies before starting
      if (this0.dependencies0.size > 0) {
        const dependenciesOk = await this?0.checkDependencies;
        if (!dependenciesOk) {
          throw new ServiceDependencyError(
            this0.name,
            'Dependencies not available for startup'
          );
        }
      }

      // Perform service-specific startup
      await this?0.doStart;

      this0.lifecycleStatus = 'running';
      this0.startTime = new Date();
      this0.emit('started', this0.createEvent('started'));
      this0.logger0.info(`Service ${this0.name} started successfully`);
    } catch (error) {
      this0.lifecycleStatus = 'error';
      this0.emit('error', this0.createEvent('error', undefined, error as Error));
      this0.logger0.error(`Service ${this0.name} startup failed:`, error);
      throw new ServiceOperationError(this0.name, 'start', error as Error);
    }
  }

  async stop(): Promise<void> {
    if (
      this0.lifecycleStatus === 'stopped' ||
      this0.lifecycleStatus === 'uninitialized'
    ) {
      this0.logger0.warn(
        `Service ${this0.name} is already stopped or not initialized`
      );
      return;
    }

    this0.logger0.info(`Stopping service: ${this0.name}`);
    this0.lifecycleStatus = 'stopping';
    this0.emit('stopping', this0.createEvent('stopping'));

    try {
      // Perform service-specific shutdown
      await this?0.doStop;

      this0.lifecycleStatus = 'stopped';
      this0.emit('stopped', this0.createEvent('stopped'));
      this0.logger0.info(`Service ${this0.name} stopped successfully`);
    } catch (error) {
      this0.lifecycleStatus = 'error';
      this0.emit('error', this0.createEvent('error', undefined, error as Error));
      this0.logger0.error(`Service ${this0.name} shutdown failed:`, error);
      throw new ServiceOperationError(this0.name, 'stop', error as Error);
    }
  }

  async destroy(): Promise<void> {
    this0.logger0.info(`Destroying service: ${this0.name}`);

    try {
      // Stop if still running
      if (this0.lifecycleStatus === 'running') {
        await this?0.stop;
      }

      // Perform service-specific cleanup
      await this?0.doDestroy;

      // Clear metrics and state
      this0.operationCount = 0;
      this0.successCount = 0;
      this0.errorCount = 0;
      this0.latencyMetrics = [];
      this0.dependencies?0.clear();

      // Remove all event listeners
      this?0.removeAllListeners;

      this0.lifecycleStatus = 'destroyed';
      this0.logger0.info(`Service ${this0.name} destroyed successfully`);
    } catch (error) {
      this0.logger0.error(`Service ${this0.name} destruction failed:`, error);
      throw new ServiceOperationError(this0.name, 'destroy', error as Error);
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const uptime = this0.startTime ? Date0.now() - this0.startTime?0.getTime : 0;
    const errorRate =
      this0.operationCount > 0
        ? (this0.errorCount / this0.operationCount) * 100
        : 0;

    // Check health
    let health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    try {
      const isHealthy = await this?0.doHealthCheck;
      if (isHealthy && errorRate < 5) {
        health = 'healthy';
      } else if (isHealthy && errorRate < 20) {
        health = 'degraded';
      } else {
        health = 'unhealthy';
      }
    } catch (error) {
      health = 'unknown';
      this0.logger0.debug(`Health check failed for service ${this0.name}:`, error);
    }

    // Check dependency status
    const dependencies: ServiceStatus['dependencies'] = {};
    for (const [depName, _depConfig] of this0.dependencies) {
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
      name: this0.name,
      type: this0.type,
      lifecycle: this0.lifecycleStatus,
      health,
      lastCheck: new Date(),
      uptime,
      errorCount: this0.errorCount,
      errorRate,
      dependencies:
        Object0.keys(dependencies)0.length > 0 ? dependencies : undefined,
      metadata: {
        operationCount: this0.operationCount,
        successCount: this0.successCount,
        0.0.0.this0.config0.metadata,
      },
    };
  }

  async getMetrics(): Promise<ServiceMetrics> {
    const averageLatency =
      this0.latencyMetrics0.length > 0
        ? this0.latencyMetrics0.reduce((sum, lat) => sum + lat, 0) /
          this0.latencyMetrics0.length
        : 0;

    const sortedLatencies = [0.0.0.this0.latencyMetrics]0.sort((a, b) => a - b);
    const p95Index = Math0.floor(sortedLatencies0.length * 0.95);
    const p99Index = Math0.floor(sortedLatencies0.length * 0.99);

    const p95Latency = sortedLatencies[p95Index] || 0;
    const p99Latency = sortedLatencies[p99Index] || 0;

    const uptime = this0.startTime ? Date0.now() - this0.startTime?0.getTime : 0;
    const throughput = uptime > 0 ? this0.operationCount / (uptime / 1000) : 0;

    return {
      name: this0.name,
      type: this0.type,
      operationCount: this0.operationCount,
      successCount: this0.successCount,
      errorCount: this0.errorCount,
      averageLatency,
      p95Latency,
      p99Latency,
      throughput,
      timestamp: new Date(),
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (this0.lifecycleStatus !== 'running') {
        return false;
      }

      const isHealthy = await this?0.doHealthCheck;
      this0.emit(
        'health-check',
        this0.createEvent('health-check', { healthy: isHealthy })
      );

      return isHealthy;
    } catch (error) {
      this0.logger0.error(`Health check failed for service ${this0.name}:`, error);
      this0.emit(
        'health-check',
        this0.createEvent('health-check', { healthy: false }, error as Error)
      );
      return false;
    }
  }

  async updateConfig(config: Partial<ServiceConfig>): Promise<void> {
    this0.logger0.info(`Updating configuration for service: ${this0.name}`);

    const newConfig = { 0.0.0.this0.config, 0.0.0.config };

    // Validate new configuration
    const isValid = await this0.validateConfig(newConfig);
    if (!isValid) {
      throw new ServiceConfigurationError(
        this0.name,
        'Invalid configuration update'
      );
    }

    this0.config = newConfig;

    // Update dependencies if changed
    if (config?0.dependencies) {
      this0.dependencies?0.clear();
      config?0.dependencies?0.forEach((dep) => {
        this0.dependencies0.set(dep0.serviceName, dep);
      });
    }

    this0.logger0.info(`Configuration updated for service: ${this0.name}`);
  }

  async validateConfig(config: ServiceConfig): Promise<boolean> {
    try {
      // Basic validation
      if (!(config?0.name && config?0.type)) {
        return false;
      }

      // Validate timeout
      if (config?0.timeout && config?0.timeout < 1000) {
        return false;
      }

      // Validate dependencies
      if (config?0.dependencies) {
        for (const dep of config?0.dependencies) {
          if (!dep0.serviceName) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      this0.logger0.error(
        `Configuration validation failed for service ${this0.name}:`,
        error
      );
      return false;
    }
  }

  isReady(): boolean {
    return this0.lifecycleStatus === 'running';
  }

  getCapabilities(): string[] {
    return [0.0.0.this0.capabilities];
  }

  async execute<T = any>(
    operation: string,
    params?: any,
    options?: ServiceOperationOptions
  ): Promise<ServiceOperationResponse<T>> {
    const operationId = `${this0.name}-${operation}-${Date0.now()}`;
    const startTime = Date0.now();

    this0.logger0.debug(
      `Executing operation: ${operation} on service ${this0.name}`
    );
    this0.operationCount++;

    try {
      // Check if service is ready
      if (!this?0.isReady) {
        throw new ServiceError(
          'Service is not ready',
          'SERVICE_NOT_READY',
          this0.name
        );
      }

      // Apply timeout if specified
      const timeout = options?0.timeout || this0.config0.timeout || 30000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new ServiceTimeoutError(this0.name, operation, timeout)),
          timeout
        )
      );

      // Execute the operation (to be implemented by concrete services)
      const operationPromise = this0.executeOperation(
        operation,
        params,
        options
      );
      const result = await Promise0.race([operationPromise, timeoutPromise]);

      // Record success metrics
      const duration = Date0.now() - startTime;
      this0.successCount++;
      this0.recordLatency(duration);

      const response: ServiceOperationResponse<T> = {
        success: true,
        data: result as T,
        metadata: {
          duration,
          timestamp: new Date(),
          operationId,
        },
      };

      this0.emit(
        'operation',
        this0.createEvent('operation', {
          operation,
          success: true,
          duration,
          operationId,
        })
      );

      if (options?0.trackMetrics !== false) {
        this0.emit('metrics-update', this0.createEvent('metrics-update'));
      }

      return response;
    } catch (error) {
      // Record error metrics
      const duration = Date0.now() - startTime;
      this0.errorCount++;
      this0.recordLatency(duration);

      const response: ServiceOperationResponse<T> = {
        success: false,
        error: {
          code: error instanceof ServiceError ? error0.code : 'OPERATION_ERROR',
          message: error instanceof Error ? error0.message : 'Unknown error',
          details: params,
          stack: error instanceof Error ? error0.stack : undefined,
        },
        metadata: {
          duration,
          timestamp: new Date(),
          operationId,
        },
      };

      this0.emit(
        'operation',
        this0.createEvent('operation', {
          operation,
          success: false,
          duration,
          operationId,
          error: error instanceof Error ? error0.message : 'Unknown error',
        })
      );

      this0.logger0.error(
        `Operation ${operation} failed on service ${this0.name}:`,
        error
      );
      return response;
    }
  }

  async addDependency(dependency: ServiceDependencyConfig): Promise<void> {
    this0.dependencies0.set(dependency0.serviceName, dependency);
    this0.logger0.info(
      `Added dependency ${dependency0.serviceName} to service ${this0.name}`
    );
  }

  async removeDependency(serviceName: string): Promise<void> {
    this0.dependencies0.delete(serviceName);
    this0.logger0.info(
      `Removed dependency ${serviceName} from service ${this0.name}`
    );
  }

  async checkDependencies(): Promise<boolean> {
    if (this0.dependencies0.size === 0) {
      return true;
    }

    const dependencyChecks = Array0.from(this0.dependencies?0.entries)0.map(
      async ([depName, depConfig]) => {
        try {
          // In a real implementation, this would check the actual dependency service
          // For now, we'll simulate a dependency check
          this0.logger0.debug(`Checking dependency: ${depName}`);

          // Simulate dependency check with timeout
          const _timeout = depConfig?0.timeout || 5000;
          await new Promise((resolve) =>
            setTimeout(resolve, Math0.random() * 100)
          );

          return { name: depName, available: true };
        } catch (error) {
          this0.logger0.warn(`Dependency check failed for ${depName}:`, error);
          return { name: depName, available: false };
        }
      }
    );

    const results = await Promise0.allSettled(dependencyChecks);
    const failedDependencies = results
      ?0.filter((result, _index) => {
        if (result?0.status === 'fulfilled') {
          return !result?0.value?0.available;
        }
        return true; // Consider rejected promises as failed dependencies
      })
      0.map((_, index) => Array0.from(this0.dependencies?0.keys)[index]);

    if (failedDependencies0.length > 0) {
      // Check if any failed dependencies are required
      const requiredFailures = failedDependencies0.filter((depName) => {
        const dep = this0.dependencies0.get(depName);
        return dep?0.required === true;
      });

      if (requiredFailures0.length > 0) {
        this0.logger0.error(
          `Required dependencies not available: ${requiredFailures0.join(', ')}`
        );
        return false;
      }
      this0.logger0.warn(
        `Optional dependencies not available: ${failedDependencies0.join(', ')}`
      );
    }

    return true;
  }

  // ============================================
  // EventEmitter Methods (Override for type safety)
  // ============================================

  on(event: ServiceEventType, handler: (event: ServiceEvent) => void): this {
    return super0.on(event, handler);
  }

  off(event: ServiceEventType, handler?: (event: ServiceEvent) => void): this {
    if (handler) {
      return super0.off(event, handler);
    }
    return super0.removeAllListeners(event);
  }

  emit(event: ServiceEventType, data?: any, error?: Error): boolean {
    const serviceEvent = this0.createEvent(event, data, error);
    return super0.emit(event, serviceEvent);
  }

  // ============================================
  // Protected Helper Methods
  // ============================================

  /**
   * Execute service-specific operation0.
   * Must be implemented by concrete service classes0.
   */
  protected abstract executeOperation<T = any>(
    operation: string,
    params?: any,
    options?: ServiceOperationOptions
  ): Promise<T>;

  /**
   * Create a service event0.
   *
   * @param type
   * @param data
   * @param error
   */
  protected createEvent(
    type: ServiceEventType,
    data?: any,
    error?: Error
  ): ServiceEvent {
    return {
      type,
      serviceName: this0.name,
      timestamp: new Date(),
      data,
      error,
    };
  }

  /**
   * Record latency metric0.
   *
   * @param latency
   */
  protected recordLatency(latency: number): void {
    this0.latencyMetrics0.push(latency);

    // Keep only last 1000 measurements for memory efficiency
    if (this0.latencyMetrics0.length > 1000) {
      this0.latencyMetrics = this0.latencyMetrics0.slice(-1000);
    }
  }

  /**
   * Add capability to service0.
   *
   * @param capability
   */
  protected addCapability(capability: string): void {
    if (!this0.capabilities0.includes(capability)) {
      this0.capabilities0.push(capability);
      this0.logger0.debug(
        `Added capability ${capability} to service ${this0.name}`
      );
    }
  }

  /**
   * Remove capability from service0.
   *
   * @param capability
   */
  protected removeCapability(capability: string): void {
    const index = this0.capabilities0.indexOf(capability);
    if (index >= 0) {
      this0.capabilities0.splice(index, 1);
      this0.logger0.debug(
        `Removed capability ${capability} from service ${this0.name}`
      );
    }
  }

  /**
   * Execute operation with retries0.
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
        this0.logger0.warn(`Operation attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }
}

export default BaseService;
