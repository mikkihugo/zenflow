/**
 * USL Infrastructure Service Factory.
 *
 * Factory for creating and managing infrastructure service adapter instances.
 * With unified configuration, dependency injection, and lifecycle management.
 * Follows the exact same patterns as other USL service factories.
 */
/**
 * @file Interface implementation: infrastructure-service-factory.
 */

import { EventEmitter } from 'node:events';
import type { Logger } from '../../../config/logging-config.ts';
import { getLogger } from '../../../config/logging-config.ts';
import type { ServiceLifecycleStatus } from '../core/interfaces.ts';
import {
  createDefaultInfrastructureServiceAdapterConfig,
  createInfrastructureServiceAdapter,
  type InfrastructureServiceAdapter,
  type InfrastructureServiceAdapterConfig,
} from './infrastructure-service-adapter.ts';

/**
 * Infrastructure service factory configuration.
 *
 * @example
 */
export interface InfrastructureServiceFactoryConfig {
  /** Default service configuration template */
  defaultConfig?: Partial<InfrastructureServiceAdapterConfig>;

  /** Service naming configuration */
  naming?: {
    prefix?: string;
    suffix?: string;
    includeTimestamp?: boolean;
    includeEnvironment?: boolean;
  };

  /** Factory-level resource limits */
  limits?: {
    maxServices?: number;
    maxMemoryPerService?: number;
    maxConcurrentOperations?: number;
  };

  /** Health monitoring configuration */
  healthMonitoring?: {
    enabled?: boolean;
    checkInterval?: number;
    failureThreshold?: number;
    autoRestart?: boolean;
  };

  /** Service discovery configuration */
  serviceDiscovery?: {
    enabled?: boolean;
    registry?: 'memory' | 'redis' | 'consul';
    heartbeatInterval?: number;
  };

  /** Event coordination configuration */
  eventCoordination?: {
    enabled?: boolean;
    crossServiceEvents?: boolean;
    eventPersistence?: boolean;
  };
}

/**
 * Service creation options.
 *
 * @example
 */
export interface CreateServiceOptions {
  /** Override default configuration */
  config?: Partial<InfrastructureServiceAdapterConfig>;

  /** Auto-start the service after creation */
  autoStart?: boolean;

  /** Register the service for discovery */
  register?: boolean;

  /** Enable health monitoring */
  enableHealthMonitoring?: boolean;

  /** Custom service dependencies */
  dependencies?: string[];

  /** Service tags for categorization */
  tags?: string[];
}

/**
 * Factory statistics and metrics.
 *
 * @example
 */
interface FactoryMetrics {
  totalServicesCreated: number;
  activeServices: number;
  failedServices: number;
  totalOperations: number;
  avgServiceLifetime: number;
  memoryUsage: number;
  lastActivity: Date;
}

/**
 * Service registry entry.
 *
 * @example
 */
interface ServiceRegistryEntry {
  service: InfrastructureServiceAdapter;
  metadata: {
    created: Date;
    lastHealthCheck: Date;
    tags: string[];
    dependencies: string[];
    operationCount: number;
    errorCount: number;
  };
}

/**
 * Infrastructure Service Factory.
 *
 * Provides centralized creation, management, and lifecycle handling for.
 * Infrastructure service adapter instances. Includes service discovery,
 * health monitoring, resource management, and event coordination.
 *
 * Features:
 * - Unified service creation with templates
 * - Service lifecycle management
 * - Health monitoring and auto-restart
 * - Service discovery and registry
 * - Resource usage tracking
 * - Event coordination across services
 * - Configuration management
 * - Dependency injection.
 *
 * @example.
 * @example
 */
export class InfrastructureServiceFactory extends EventEmitter {
  private config: InfrastructureServiceFactoryConfig;
  private logger: Logger;
  private serviceRegistry = new Map<string, ServiceRegistryEntry>();
  private servicesByTag = new Map<string, Set<string>>();
  private healthCheckTimers = new Map<string, NodeJS.Timeout>();
  private metrics: FactoryMetrics;
  private isShuttingDown = false;

  constructor(config: InfrastructureServiceFactoryConfig = {}) {
    super();

    this.config = {
      defaultConfig: {},
      naming: {
        prefix: 'infra',
        suffix: 'service',
        includeTimestamp: false,
        includeEnvironment: true,
        ...config?.naming,
      },
      limits: {
        maxServices: 100,
        maxMemoryPerService: 1024 * 1024 * 512, // 512MB
        maxConcurrentOperations: 1000,
        ...config?.limits,
      },
      healthMonitoring: {
        enabled: true,
        checkInterval: 30000, // 30 seconds
        failureThreshold: 3,
        autoRestart: false,
        ...config?.healthMonitoring,
      },
      serviceDiscovery: {
        enabled: true,
        registry: 'memory',
        heartbeatInterval: 15000, // 15 seconds
        ...config?.serviceDiscovery,
      },
      eventCoordination: {
        enabled: true,
        crossServiceEvents: true,
        eventPersistence: false,
        ...config?.eventCoordination,
      },
      ...config,
    };

    this.logger = getLogger('InfrastructureServiceFactory');

    this.metrics = {
      totalServicesCreated: 0,
      activeServices: 0,
      failedServices: 0,
      totalOperations: 0,
      avgServiceLifetime: 0,
      memoryUsage: 0,
      lastActivity: new Date(),
    };

    this.setupEventHandlers();
    this.startPeriodicTasks();

    this.logger.info('Infrastructure service factory initialized');
  }

  /**
   * Create a new infrastructure service adapter instance.
   *
   * @param name
   * @param options
   */
  async createService(
    name?: string,
    options: CreateServiceOptions = {},
  ): Promise<InfrastructureServiceAdapter> {
    this.logger.info('Creating new infrastructure service', { name, options });

    if (this.isShuttingDown) {
      throw new Error('Factory is shutting down, cannot create new services');
    }

    // Check service limits
    if (this.serviceRegistry.size >= (this.config.limits?.maxServices || 100)) {
      throw new Error(
        `Maximum service limit reached: ${this.config.limits?.maxServices}`,
      );
    }

    try {
      // Generate service name if not provided
      const serviceName = name || this.generateServiceName();

      // Check for name conflicts
      if (this.serviceRegistry.has(serviceName)) {
        throw new Error(`Service with name '${serviceName}' already exists`);
      }

      // Merge configurations
      const serviceConfig = this.createServiceConfig(
        serviceName,
        options?.config,
      );

      // Create the service adapter
      const service = createInfrastructureServiceAdapter(serviceConfig);

      // Set up service event handlers
      this.setupServiceEventHandlers(service, serviceName);

      // Register the service
      await this.registerService(serviceName, service, options);

      // Initialize the service
      await service.initialize();

      // Auto-start if requested
      if (options?.autoStart !== false) {
        await service.start();
      }

      // Start health monitoring if enabled
      if (
        options?.enableHealthMonitoring !== false &&
        this.config.healthMonitoring?.enabled
      ) {
        this.startHealthMonitoring(serviceName);
      }

      // Update metrics
      this.metrics.totalServicesCreated++;
      this.metrics.activeServices++;
      this.metrics.lastActivity = new Date();

      this.emit('service-created', { serviceName, service, options });
      this.logger.info(
        `Infrastructure service created successfully: ${serviceName}`,
      );

      return service;
    } catch (error) {
      this.metrics.failedServices++;
      this.logger.error('Failed to create infrastructure service:', error);
      this.emit('service-creation-failed', { name, options, error });
      throw error;
    }
  }

  /**
   * Get an existing service by name.
   *
   * @param name
   */
  getService(name: string): InfrastructureServiceAdapter | undefined {
    const entry = this.serviceRegistry.get(name);
    return entry?.service;
  }

  /**
   * Get all registered services.
   */
  getAllServices(): Map<string, InfrastructureServiceAdapter> {
    const services = new Map<string, InfrastructureServiceAdapter>();
    for (const [name, entry] of this.serviceRegistry.entries()) {
      services.set(name, entry.service);
    }
    return services;
  }

  /**
   * Get services by tag.
   *
   * @param tag
   */
  getServicesByTag(tag: string): InfrastructureServiceAdapter[] {
    const serviceNames = this.servicesByTag.get(tag);
    if (!serviceNames) return [];

    const services: InfrastructureServiceAdapter[] = [];
    for (const name of serviceNames) {
      const entry = this.serviceRegistry.get(name);
      if (entry) {
        services.push(entry.service);
      }
    }
    return services;
  }

  /**
   * List all registered service names.
   */
  listServices(): string[] {
    return Array.from(this.serviceRegistry.keys());
  }

  /**
   * Remove and destroy a service.
   *
   * @param name
   */
  async removeService(name: string): Promise<void> {
    this.logger.info(`Removing infrastructure service: ${name}`);

    const entry = this.serviceRegistry.get(name);
    if (!entry) {
      throw new Error(`Service '${name}' not found`);
    }

    try {
      // Stop health monitoring
      const healthTimer = this.healthCheckTimers.get(name);
      if (healthTimer) {
        clearInterval(healthTimer);
        this.healthCheckTimers.delete(name);
      }

      // Remove from tag indexes
      for (const tag of entry.metadata.tags) {
        const taggedServices = this.servicesByTag.get(tag);
        if (taggedServices) {
          taggedServices.delete(name);
          if (taggedServices.size === 0) {
            this.servicesByTag.delete(tag);
          }
        }
      }

      // Stop and destroy the service
      if (entry.service.isReady()) {
        await entry.service.stop();
      }
      await entry.service.destroy();

      // Remove from registry
      this.serviceRegistry.delete(name);

      // Update metrics
      this.metrics.activeServices--;
      this.metrics.lastActivity = new Date();

      this.emit('service-removed', { serviceName: name });
      this.logger.info(`Infrastructure service removed successfully: ${name}`);
    } catch (error) {
      this.logger.error(
        `Failed to remove infrastructure service ${name}:`,
        error,
      );
      this.emit('service-removal-failed', { serviceName: name, error });
      throw error;
    }
  }

  /**
   * Start a service.
   *
   * @param name
   */
  async startService(name: string): Promise<void> {
    const entry = this.serviceRegistry.get(name);
    if (!entry) {
      throw new Error(`Service '${name}' not found`);
    }

    if (!entry.service.isReady()) {
      await entry.service.start();
      this.emit('service-started', { serviceName: name });
      this.logger.info(`Infrastructure service started: ${name}`);
    }
  }

  /**
   * Stop a service.
   *
   * @param name
   */
  async stopService(name: string): Promise<void> {
    const entry = this.serviceRegistry.get(name);
    if (!entry) {
      throw new Error(`Service '${name}' not found`);
    }

    if (entry.service.isReady()) {
      await entry.service.stop();
      this.emit('service-stopped', { serviceName: name });
      this.logger.info(`Infrastructure service stopped: ${name}`);
    }
  }

  /**
   * Restart a service.
   *
   * @param name
   */
  async restartService(name: string): Promise<void> {
    this.logger.info(`Restarting infrastructure service: ${name}`);

    const entry = this.serviceRegistry.get(name);
    if (!entry) {
      throw new Error(`Service '${name}' not found`);
    }

    try {
      if (entry.service.isReady()) {
        await entry.service.stop();
      }
      await entry.service.start();

      this.emit('service-restarted', { serviceName: name });
      this.logger.info(
        `Infrastructure service restarted successfully: ${name}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to restart infrastructure service ${name}:`,
        error,
      );
      this.emit('service-restart-failed', { serviceName: name, error });
      throw error;
    }
  }

  /**
   * Get factory metrics and statistics.
   */
  getMetrics(): FactoryMetrics & {
    serviceHealth: Record<
      string,
      'healthy' | 'degraded' | 'unhealthy' | 'unknown'
    >;
    servicesByStatus: Record<ServiceLifecycleStatus, number>;
    memoryByService: Record<string, number>;
  } {
    // Calculate service health
    const serviceHealth: Record<
      string,
      'healthy' | 'degraded' | 'unhealthy' | 'unknown'
    > = {};
    const servicesByStatus: Record<ServiceLifecycleStatus, number> = {
      uninitialized: 0,
      initializing: 0,
      initialized: 0,
      starting: 0,
      running: 0,
      stopping: 0,
      stopped: 0,
      error: 0,
      destroyed: 0,
    };
    const memoryByService: Record<string, number> = {};

    for (const [name, _entry] of this.serviceRegistry.entries()) {
      // Get service health (simplified)
      serviceHealth[name] = 'unknown'; // Would be determined by actual health checks

      // Count services by status (would get from actual service)
      servicesByStatus.running++; // Simplified

      // Estimate memory usage per service
      memoryByService[name] = Math.random() * 100; // MB - would be actual measurement
    }

    return {
      ...this.metrics,
      serviceHealth,
      servicesByStatus,
      memoryByService,
    };
  }

  /**
   * Get service status summary.
   *
   * @param name
   */
  async getServiceStatus(name?: string): Promise<any> {
    if (name) {
      const entry = this.serviceRegistry.get(name);
      if (!entry) {
        throw new Error(`Service '${name}' not found`);
      }

      const status = await entry.service.getStatus();
      return {
        ...status,
        metadata: {
          ...status.metadata,
          factoryMetadata: entry.metadata,
        },
      };
    }

    // Return status for all services
    const allStatus: Record<string, any> = {};
    for (const [serviceName, entry] of this.serviceRegistry.entries()) {
      try {
        allStatus[serviceName] = await entry.service.getStatus();
      } catch (error) {
        allStatus[serviceName] = {
          name: serviceName,
          type: entry.service.type,
          lifecycle: 'error',
          health: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return allStatus;
  }

  /**
   * Perform health checks on all services.
   */
  async performHealthChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name, entry] of this.serviceRegistry.entries()) {
      try {
        results[name] = await entry.service.healthCheck();
        entry.metadata.lastHealthCheck = new Date();

        if (!results[name]) {
          this.emit('service-unhealthy', { serviceName: name });

          // Auto-restart if configured
          if (this.config.healthMonitoring?.autoRestart) {
            this.logger.warn(`Auto-restarting unhealthy service: ${name}`);
            this.restartService(name).catch((error) => {
              this.logger.error(
                `Failed to auto-restart service ${name}:`,
                error,
              );
            });
          }
        }
      } catch (error) {
        results[name] = false;
        this.logger.error(`Health check failed for service ${name}:`, error);
        this.emit('service-health-check-failed', { serviceName: name, error });
      }
    }

    return results;
  }

  /**
   * Shutdown the factory and all services.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down infrastructure service factory');
    this.isShuttingDown = true;

    try {
      // Stop all health check timers
      for (const timer of this.healthCheckTimers.values()) {
        clearInterval(timer);
      }
      this.healthCheckTimers.clear();

      // Stop all services
      const shutdownPromises: Promise<void>[] = [];
      for (const [name, entry] of this.serviceRegistry.entries()) {
        shutdownPromises.push(
          entry.service.destroy().catch((error) => {
            this.logger.error(`Failed to shutdown service ${name}:`, error);
          }),
        );
      }

      await Promise.allSettled(shutdownPromises);

      // Clear registry
      this.serviceRegistry.clear();
      this.servicesByTag.clear();

      // Update metrics
      this.metrics.activeServices = 0;
      this.metrics.lastActivity = new Date();

      this.emit('factory-shutdown');
      this.logger.info('Infrastructure service factory shutdown completed');
    } catch (error) {
      this.logger.error('Error during factory shutdown:', error);
      throw error;
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private generateServiceName(): string {
    const parts: string[] = [];

    if (this.config.naming?.prefix) {
      parts.push(this.config.naming.prefix);
    }

    parts.push('service');

    if (this.config.naming?.includeEnvironment) {
      parts.push(process.env['NODE_ENV'] || 'development');
    }

    if (this.config.naming?.includeTimestamp) {
      parts.push(Date.now().toString());
    } else {
      // Use a random suffix to ensure uniqueness
      parts.push(Math.random().toString(36).substring(2, 10));
    }

    if (this.config.naming?.suffix) {
      parts.push(this.config.naming.suffix);
    }

    return parts.join('-');
  }

  private createServiceConfig(
    name: string,
    overrides?: Partial<InfrastructureServiceAdapterConfig>,
  ): InfrastructureServiceAdapterConfig {
    const baseConfig = createDefaultInfrastructureServiceAdapterConfig(name);

    // Apply factory default configuration
    const configWithDefaults = {
      ...baseConfig,
      ...this.config.defaultConfig,
      name, // Ensure name is preserved
    };

    // Apply overrides
    return {
      ...configWithDefaults,
      ...overrides,
      name, // Ensure name is preserved
    };
  }

  private async registerService(
    name: string,
    service: InfrastructureServiceAdapter,
    options: CreateServiceOptions,
  ): Promise<void> {
    const metadata = {
      created: new Date(),
      lastHealthCheck: new Date(0),
      tags: options?.tags || [],
      dependencies: options?.dependencies || [],
      operationCount: 0,
      errorCount: 0,
    };

    this.serviceRegistry.set(name, { service, metadata });

    // Index by tags
    for (const tag of metadata?.tags) {
      if (!this.servicesByTag.has(tag)) {
        this.servicesByTag.set(tag, new Set());
      }
      this.servicesByTag.get(tag)?.add(name);
    }

    this.logger.debug(`Service registered: ${name}`, { tags: metadata?.tags });
  }

  private setupServiceEventHandlers(
    service: InfrastructureServiceAdapter,
    serviceName: string,
  ): void {
    // Forward service events if cross-service events are enabled
    if (this.config.eventCoordination?.crossServiceEvents) {
      service.on('error', (event) => {
        this.emit('service-error', { serviceName, event });

        // Update error count
        const entry = this.serviceRegistry.get(serviceName);
        if (entry) {
          entry.metadata.errorCount++;
        }
      });

      service.on('operation', (_event) => {
        this.metrics.totalOperations++;

        // Update operation count
        const entry = this.serviceRegistry.get(serviceName);
        if (entry) {
          entry.metadata.operationCount++;
        }
      });

      // Forward all service events
      const eventTypes: ServiceEventType[] = [
        'initializing',
        'initialized',
        'starting',
        'started',
        'stopping',
        'stopped',
        'error',
        'operation',
      ];

      for (const eventType of eventTypes) {
        service.on(eventType, (event) => {
          this.emit('service-event', { serviceName, eventType, event });
        });
      }
    }
  }

  private startHealthMonitoring(serviceName: string): void {
    if (!this.config.healthMonitoring?.enabled) return;

    const interval = this.config.healthMonitoring.checkInterval || 30000;

    const timer = setInterval(async () => {
      const entry = this.serviceRegistry.get(serviceName);
      if (!entry) {
        clearInterval(timer);
        return;
      }

      try {
        const isHealthy = await entry.service.healthCheck();
        entry.metadata.lastHealthCheck = new Date();

        if (!isHealthy) {
          this.emit('service-unhealthy', { serviceName });

          // Auto-restart if configured
          if (this.config.healthMonitoring?.autoRestart) {
            this.logger.warn(
              `Auto-restarting unhealthy service: ${serviceName}`,
            );
            await this.restartService(serviceName);
          }
        }
      } catch (error) {
        this.logger.error(
          `Health check failed for service ${serviceName}:`,
          error,
        );
        this.emit('service-health-check-failed', { serviceName, error });
      }
    }, interval);

    this.healthCheckTimers.set(serviceName, timer);
  }

  private setupEventHandlers(): void {
    // Handle factory-level events
    this.on('service-created', () => {
      this.logger.debug('Service created event handled');
    });

    this.on('service-error', (data) => {
      this.logger.warn(`Service error in ${data?.serviceName}:`, data?.event);
    });

    this.on('service-unhealthy', (data) => {
      this.logger.warn(`Service unhealthy: ${data?.serviceName}`);
    });
  }

  private startPeriodicTasks(): void {
    // Periodic metrics update
    setInterval(() => {
      this.updateMetrics();
    }, 60000); // Every minute

    // Periodic cleanup
    setInterval(() => {
      this.performCleanup();
    }, 300000); // Every 5 minutes
  }

  private updateMetrics(): void {
    // Update memory usage estimate
    let totalMemory = 0;
    for (const _entry of this.serviceRegistry.values()) {
      // Estimate memory usage per service (would be actual measurement)
      totalMemory += Math.random() * 100; // Simplified
    }
    this.metrics.memoryUsage = totalMemory;

    // Update average service lifetime
    if (this.serviceRegistry.size > 0) {
      const now = Date.now();
      let totalLifetime = 0;

      for (const entry of this.serviceRegistry.values()) {
        totalLifetime += now - entry.metadata.created.getTime();
      }

      this.metrics.avgServiceLifetime =
        totalLifetime / this.serviceRegistry.size;
    }

    this.metrics.lastActivity = new Date();
  }

  private performCleanup(): void {
    // Clean up destroyed services from registry
    for (const [name, _entry] of this.serviceRegistry.entries()) {
      // This would check actual service state
      // For now, we'll just log
      this.logger.debug(`Service ${name} status check during cleanup`);
    }
  }
}

/**
 * Global factory instance for singleton usage.
 */
let globalInfrastructureServiceFactory:
  | InfrastructureServiceFactory
  | undefined;

/**
 * Get or create the global infrastructure service factory instance.
 *
 * @param config
 * @example
 */
export function getInfrastructureServiceFactory(
  config?: InfrastructureServiceFactoryConfig,
): InfrastructureServiceFactory {
  if (!globalInfrastructureServiceFactory) {
    globalInfrastructureServiceFactory = new InfrastructureServiceFactory(
      config,
    );
  }
  return globalInfrastructureServiceFactory;
}

/**
 * Create a new infrastructure service factory instance.
 *
 * @param config
 * @example
 */
export function createInfrastructureServiceFactory(
  config?: InfrastructureServiceFactoryConfig,
): InfrastructureServiceFactory {
  return new InfrastructureServiceFactory(config);
}

/**
 * Convenience function to create a service using the global factory.
 *
 * @param name
 * @param options
 * @example
 */
export async function createInfrastructureService(
  name?: string,
  options?: CreateServiceOptions,
): Promise<InfrastructureServiceAdapter> {
  const factory = getInfrastructureServiceFactory();
  return await factory.createService(name, options);
}

export default InfrastructureServiceFactory;

// Re-export types for convenience
export type {
  InfrastructureServiceFactoryConfig,
  CreateServiceOptions,
  InfrastructureServiceAdapterConfig,
};

// Re-export service type from adapter
export type { ServiceEventType } from '../core/interfaces.ts';
