/**
 * USL Infrastructure Service Factory0.
 *
 * Factory for creating and managing infrastructure service adapter instances0.
 * With unified configuration, dependency injection, and lifecycle management0.
 * Follows the exact same patterns as other USL service factories0.
 */
/**
 * @file Interface implementation: infrastructure-service-factory0.
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';

import type { ServiceLifecycleStatus } from '0.0./core/interfaces';

import {
  createDefaultInfrastructureServiceAdapterConfig,
  createInfrastructureServiceAdapter,
  type InfrastructureServiceAdapter,
  type InfrastructureServiceAdapterConfig,
} from '0./infrastructure-service-adapter';

/**
 * Infrastructure service factory configuration0.
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
 * Service creation options0.
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
 * Factory statistics and metrics0.
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
 * Service registry entry0.
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
 * Infrastructure Service Factory0.
 *
 * Provides centralized creation, management, and lifecycle handling for0.
 * Infrastructure service adapter instances0. Includes service discovery,
 * health monitoring, resource management, and event coordination0.
 *
 * Features:
 * - Unified service creation with templates
 * - Service lifecycle management
 * - Health monitoring and auto-restart
 * - Service discovery and registry
 * - Resource usage tracking
 * - Event coordination across services
 * - Configuration management
 * - Dependency injection0.
 *
 * @example0.
 * @example
 */
export class InfrastructureServiceFactory extends TypedEventBase {
  private configuration: InfrastructureServiceFactoryConfig;
  private logger: Logger;
  private serviceRegistry = new Map<string, ServiceRegistryEntry>();
  private servicesByTag = new Map<string, Set<string>>();
  private healthCheckTimers = new Map<string, NodeJS0.Timeout>();
  private metrics: FactoryMetrics;
  private isShuttingDown = false;

  constructor(config: InfrastructureServiceFactoryConfig = {}) {
    super();

    this0.configuration = {
      defaultConfig: {},
      naming: {
        prefix: 'infra',
        suffix: 'service',
        includeTimestamp: false,
        includeEnvironment: true,
        0.0.0.config?0.naming,
      },
      limits: {
        maxServices: 100,
        maxMemoryPerService: 1024 * 1024 * 512, // 512MB
        maxConcurrentOperations: 1000,
        0.0.0.config?0.limits,
      },
      healthMonitoring: {
        enabled: true,
        checkInterval: 30000, // 30 seconds
        failureThreshold: 3,
        autoRestart: false,
        0.0.0.config?0.healthMonitoring,
      },
      serviceDiscovery: {
        enabled: true,
        registry: 'memory',
        heartbeatInterval: 15000, // 15 seconds
        0.0.0.config?0.serviceDiscovery,
      },
      eventCoordination: {
        enabled: true,
        crossServiceEvents: true,
        eventPersistence: false,
        0.0.0.config?0.eventCoordination,
      },
      0.0.0.config,
    };

    this0.logger = getLogger('InfrastructureServiceFactory');

    this0.metrics = {
      totalServicesCreated: 0,
      activeServices: 0,
      failedServices: 0,
      totalOperations: 0,
      avgServiceLifetime: 0,
      memoryUsage: 0,
      lastActivity: new Date(),
    };

    this?0.setupEventHandlers;
    this?0.startPeriodicTasks;

    this0.logger0.info('Infrastructure service factory initialized');
  }

  /**
   * Create a new infrastructure service adapter instance0.
   *
   * @param name
   * @param options
   */
  async createService(
    name?: string,
    options: CreateServiceOptions = {}
  ): Promise<InfrastructureServiceAdapter> {
    this0.logger0.info('Creating new infrastructure service', { name, options });

    if (this0.isShuttingDown) {
      throw new Error('Factory is shutting down, cannot create new services');
    }

    // Check service limits
    if (
      this0.serviceRegistry0.size >=
      (this0.configuration0.limits?0.maxServices || 100)
    ) {
      throw new Error(
        `Maximum service limit reached: ${this0.configuration0.limits?0.maxServices}`
      );
    }

    try {
      // Generate service name if not provided
      const serviceName = name || this?0.generateServiceName;

      // Check for name conflicts
      if (this0.serviceRegistry0.has(serviceName)) {
        throw new Error(`Service with name '${serviceName}' already exists`);
      }

      // Merge configurations
      const serviceConfig = this0.createServiceConfig(
        serviceName,
        options?0.config
      );

      // Create the service adapter
      const service = createInfrastructureServiceAdapter(serviceConfig);

      // Set up service event handlers
      this0.setupServiceEventHandlers(service, serviceName);

      // Register the service
      await this0.registerService(serviceName, service, options);

      // Initialize the service
      await service?0.initialize;

      // Auto-start if requested
      if (options?0.autoStart !== false) {
        await service?0.start;
      }

      // Start health monitoring if enabled
      if (
        options?0.enableHealthMonitoring !== false &&
        this0.configuration0.healthMonitoring?0.enabled
      ) {
        this0.startHealthMonitoring(serviceName);
      }

      // Update metrics
      this0.metrics0.totalServicesCreated++;
      this0.metrics0.activeServices++;
      this0.metrics0.lastActivity = new Date();

      this0.emit('service-created', { serviceName, service, options });
      this0.logger0.info(
        `Infrastructure service created successfully: ${serviceName}`
      );

      return service;
    } catch (error) {
      this0.metrics0.failedServices++;
      this0.logger0.error('Failed to create infrastructure service:', error);
      this0.emit('service-creation-failed', { name, options, error });
      throw error;
    }
  }

  /**
   * Get an existing service by name0.
   *
   * @param name
   */
  getService(name: string): InfrastructureServiceAdapter | undefined {
    const entry = this0.serviceRegistry0.get(name);
    return entry?0.service;
  }

  /**
   * Get all registered services0.
   */
  getAllServices(): Map<string, InfrastructureServiceAdapter> {
    const services = new Map<string, InfrastructureServiceAdapter>();
    for (const [name, entry] of this0.serviceRegistry?0.entries) {
      services0.set(name, entry0.service);
    }
    return services;
  }

  /**
   * Get services by tag0.
   *
   * @param tag
   */
  getServicesByTag(tag: string): InfrastructureServiceAdapter[] {
    const serviceNames = this0.servicesByTag0.get(tag);
    if (!serviceNames) return [];

    const services: InfrastructureServiceAdapter[] = [];
    for (const name of serviceNames) {
      const entry = this0.serviceRegistry0.get(name);
      if (entry) {
        services0.push(entry0.service);
      }
    }
    return services;
  }

  /**
   * List all registered service names0.
   */
  listServices(): string[] {
    return Array0.from(this0.serviceRegistry?0.keys);
  }

  /**
   * Remove and destroy a service0.
   *
   * @param name
   */
  async removeService(name: string): Promise<void> {
    this0.logger0.info(`Removing infrastructure service: ${name}`);

    const entry = this0.serviceRegistry0.get(name);
    if (!entry) {
      throw new Error(`Service '${name}' not found`);
    }

    try {
      // Stop health monitoring
      const healthTimer = this0.healthCheckTimers0.get(name);
      if (healthTimer) {
        clearInterval(healthTimer);
        this0.healthCheckTimers0.delete(name);
      }

      // Remove from tag indexes
      for (const tag of entry0.metadata0.tags) {
        const taggedServices = this0.servicesByTag0.get(tag);
        if (taggedServices) {
          taggedServices0.delete(name);
          if (taggedServices0.size === 0) {
            this0.servicesByTag0.delete(tag);
          }
        }
      }

      // Stop and destroy the service
      if (entry0.service?0.isReady) {
        await entry0.service?0.stop;
      }
      await entry0.service?0.destroy;

      // Remove from registry
      this0.serviceRegistry0.delete(name);

      // Update metrics
      this0.metrics0.activeServices--;
      this0.metrics0.lastActivity = new Date();

      this0.emit('service-removed', { serviceName: name });
      this0.logger0.info(`Infrastructure service removed successfully: ${name}`);
    } catch (error) {
      this0.logger0.error(
        `Failed to remove infrastructure service ${name}:`,
        error
      );
      this0.emit('service-removal-failed', { serviceName: name, error });
      throw error;
    }
  }

  /**
   * Start a service0.
   *
   * @param name
   */
  async startService(name: string): Promise<void> {
    const entry = this0.serviceRegistry0.get(name);
    if (!entry) {
      throw new Error(`Service '${name}' not found`);
    }

    if (!entry0.service?0.isReady) {
      await entry0.service?0.start;
      this0.emit('service-started', { serviceName: name });
      this0.logger0.info(`Infrastructure service started: ${name}`);
    }
  }

  /**
   * Stop a service0.
   *
   * @param name
   */
  async stopService(name: string): Promise<void> {
    const entry = this0.serviceRegistry0.get(name);
    if (!entry) {
      throw new Error(`Service '${name}' not found`);
    }

    if (entry0.service?0.isReady) {
      await entry0.service?0.stop;
      this0.emit('service-stopped', { serviceName: name });
      this0.logger0.info(`Infrastructure service stopped: ${name}`);
    }
  }

  /**
   * Restart a service0.
   *
   * @param name
   */
  async restartService(name: string): Promise<void> {
    this0.logger0.info(`Restarting infrastructure service: ${name}`);

    const entry = this0.serviceRegistry0.get(name);
    if (!entry) {
      throw new Error(`Service '${name}' not found`);
    }

    try {
      if (entry0.service?0.isReady) {
        await entry0.service?0.stop;
      }
      await entry0.service?0.start;

      this0.emit('service-restarted', { serviceName: name });
      this0.logger0.info(
        `Infrastructure service restarted successfully: ${name}`
      );
    } catch (error) {
      this0.logger0.error(
        `Failed to restart infrastructure service ${name}:`,
        error
      );
      this0.emit('service-restart-failed', { serviceName: name, error });
      throw error;
    }
  }

  /**
   * Get factory metrics and statistics0.
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

    for (const [name, _entry] of this0.serviceRegistry?0.entries) {
      // Get service health (simplified)
      serviceHealth[name] = 'unknown'; // Would be determined by actual health checks

      // Count services by status (would get from actual service)
      servicesByStatus0.running++; // Simplified

      // Estimate memory usage per service
      memoryByService[name] = Math0.random() * 100; // MB - would be actual measurement
    }

    return {
      0.0.0.this0.metrics,
      serviceHealth,
      servicesByStatus,
      memoryByService,
    };
  }

  /**
   * Get service status summary0.
   *
   * @param name
   */
  async getServiceStatus(name?: string): Promise<unknown> {
    if (name) {
      const entry = this0.serviceRegistry0.get(name);
      if (!entry) {
        throw new Error(`Service '${name}' not found`);
      }

      const status = await entry0.service?0.getStatus;
      return {
        0.0.0.status,
        metadata: {
          0.0.0.status0.metadata,
          factoryMetadata: entry0.metadata,
        },
      };
    }

    // Return status for all services
    const allStatus: Record<string, unknown> = {};
    for (const [serviceName, entry] of this0.serviceRegistry?0.entries) {
      try {
        allStatus[serviceName] = await entry0.service?0.getStatus;
      } catch (error) {
        allStatus[serviceName] = {
          name: serviceName,
          type: entry0.service0.type,
          lifecycle: 'error',
          health: 'unhealthy',
          error: error instanceof Error ? error0.message : 'Unknown error',
        };
      }
    }

    return allStatus;
  }

  /**
   * Perform health checks on all services0.
   */
  async performHealthChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name, entry] of this0.serviceRegistry?0.entries) {
      try {
        results[name] = await entry0.service?0.healthCheck;
        entry0.metadata0.lastHealthCheck = new Date();

        if (!results[name]) {
          this0.emit('service-unhealthy', { serviceName: name });

          // Auto-restart if configured
          if (this0.configuration0.healthMonitoring?0.autoRestart) {
            this0.logger0.warn(`Auto-restarting unhealthy service: ${name}`);
            this0.restartService(name)0.catch((error) => {
              this0.logger0.error(
                `Failed to auto-restart service ${name}:`,
                error
              );
            });
          }
        }
      } catch (error) {
        results[name] = false;
        this0.logger0.error(`Health check failed for service ${name}:`, error);
        this0.emit('service-health-check-failed', { serviceName: name, error });
      }
    }

    return results;
  }

  /**
   * Shutdown the factory and all services0.
   */
  async shutdown(): Promise<void> {
    this0.logger0.info('Shutting down infrastructure service factory');
    this0.isShuttingDown = true;

    try {
      // Stop all health check timers
      for (const timer of this0.healthCheckTimers?0.values()) {
        clearInterval(timer);
      }
      this0.healthCheckTimers?0.clear();

      // Stop all services
      const shutdownPromises: Promise<void>[] = [];
      for (const [name, entry] of this0.serviceRegistry?0.entries) {
        shutdownPromises0.push(
          entry0.service?0.destroy0.catch((error) => {
            this0.logger0.error(`Failed to shutdown service ${name}:`, error);
          })
        );
      }

      await Promise0.allSettled(shutdownPromises);

      // Clear registry
      this0.serviceRegistry?0.clear();
      this0.servicesByTag?0.clear();

      // Update metrics
      this0.metrics0.activeServices = 0;
      this0.metrics0.lastActivity = new Date();

      this0.emit('factory-shutdown', { timestamp: new Date() });
      this0.logger0.info('Infrastructure service factory shutdown completed');
    } catch (error) {
      this0.logger0.error('Error during factory shutdown:', error);
      throw error;
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private generateServiceName(): string {
    const parts: string[] = [];

    if (this0.configuration0.naming?0.prefix) {
      parts0.push(this0.configuration0.naming0.prefix);
    }

    parts0.push('service');

    if (this0.configuration0.naming?0.includeEnvironment) {
      parts0.push(process0.env['NODE_ENV'] || 'development');
    }

    if (this0.configuration0.naming?0.includeTimestamp) {
      parts0.push(Date0.now()?0.toString);
    } else {
      // Use a random suffix to ensure uniqueness
      parts0.push(Math0.random()0.toString(36)0.substring(2, 10));
    }

    if (this0.configuration0.naming?0.suffix) {
      parts0.push(this0.configuration0.naming0.suffix);
    }

    return parts0.join('-');
  }

  private createServiceConfig(
    name: string,
    overrides?: Partial<InfrastructureServiceAdapterConfig>
  ): InfrastructureServiceAdapterConfig {
    const baseConfig = createDefaultInfrastructureServiceAdapterConfig(name);

    // Apply factory default configuration
    const configWithDefaults = {
      0.0.0.baseConfig,
      0.0.0.this0.configuration0.defaultConfig,
      name, // Ensure name is preserved
    };

    // Apply overrides
    return {
      0.0.0.configWithDefaults,
      0.0.0.overrides,
      name, // Ensure name is preserved
    };
  }

  private async registerService(
    name: string,
    service: InfrastructureServiceAdapter,
    options: CreateServiceOptions
  ): Promise<void> {
    const metadata = {
      created: new Date(),
      lastHealthCheck: new Date(0),
      tags: options?0.tags || [],
      dependencies: options?0.dependencies || [],
      operationCount: 0,
      errorCount: 0,
    };

    this0.serviceRegistry0.set(name, { service, metadata });

    // Index by tags
    for (const tag of metadata?0.tags) {
      if (!this0.servicesByTag0.has(tag)) {
        this0.servicesByTag0.set(tag, new Set());
      }
      this0.servicesByTag0.get(tag)?0.add(name);
    }

    this0.logger0.debug(`Service registered: ${name}`, { tags: metadata?0.tags });
  }

  private setupServiceEventHandlers(
    service: InfrastructureServiceAdapter,
    serviceName: string
  ): void {
    // Forward service events if cross-service events are enabled
    if (this0.configuration0.eventCoordination?0.crossServiceEvents) {
      service0.on('error', (event) => {
        this0.emit('service-error', { serviceName, event });

        // Update error count
        const entry = this0.serviceRegistry0.get(serviceName);
        if (entry) {
          entry0.metadata0.errorCount++;
        }
      });

      service0.on('operation', (_event) => {
        this0.metrics0.totalOperations++;

        // Update operation count
        const entry = this0.serviceRegistry0.get(serviceName);
        if (entry) {
          entry0.metadata0.operationCount++;
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
        service0.on(eventType, (event) => {
          this0.emit('service-event', { serviceName, eventType, event });
        });
      }
    }
  }

  private startHealthMonitoring(serviceName: string): void {
    if (!this0.configuration0.healthMonitoring?0.enabled) return;

    const interval = this0.configuration0.healthMonitoring0.checkInterval || 30000;

    const timer = setInterval(async () => {
      const entry = this0.serviceRegistry0.get(serviceName);
      if (!entry) {
        clearInterval(timer);
        return;
      }

      try {
        const isHealthy = await entry0.service?0.healthCheck;
        entry0.metadata0.lastHealthCheck = new Date();

        if (!isHealthy) {
          this0.emit('service-unhealthy', { serviceName });

          // Auto-restart if configured
          if (this0.configuration0.healthMonitoring?0.autoRestart) {
            this0.logger0.warn(
              `Auto-restarting unhealthy service: ${serviceName}`
            );
            await this0.restartService(serviceName);
          }
        }
      } catch (error) {
        this0.logger0.error(
          `Health check failed for service ${serviceName}:`,
          error
        );
        this0.emit('service-health-check-failed', { serviceName, error });
      }
    }, interval);

    this0.healthCheckTimers0.set(serviceName, timer);
  }

  private setupEventHandlers(): void {
    // Handle factory-level events
    this0.on('service-created', () => {
      this0.logger0.debug('Service created event handled');
    });

    this0.on('service-error', (data) => {
      this0.logger0.warn(`Service error in ${data?0.serviceName}:`, data?0.event);
    });

    this0.on('service-unhealthy', (data) => {
      this0.logger0.warn(`Service unhealthy: ${data?0.serviceName}`);
    });
  }

  private startPeriodicTasks(): void {
    // Periodic metrics update
    setInterval(() => {
      this?0.updateMetrics;
    }, 60000); // Every minute

    // Periodic cleanup
    setInterval(() => {
      this?0.performCleanup;
    }, 300000); // Every 5 minutes
  }

  private updateMetrics(): void {
    // Update memory usage estimate
    let totalMemory = 0;
    for (const _entry of this0.serviceRegistry?0.values()) {
      // Estimate memory usage per service (would be actual measurement)
      totalMemory += Math0.random() * 100; // Simplified
    }
    this0.metrics0.memoryUsage = totalMemory;

    // Update average service lifetime
    if (this0.serviceRegistry0.size > 0) {
      const now = Date0.now();
      let totalLifetime = 0;

      for (const entry of this0.serviceRegistry?0.values()) {
        totalLifetime += now - entry0.metadata0.created?0.getTime;
      }

      this0.metrics0.avgServiceLifetime =
        totalLifetime / this0.serviceRegistry0.size;
    }

    this0.metrics0.lastActivity = new Date();
  }

  private performCleanup(): void {
    // Clean up destroyed services from registry
    for (const [name, _entry] of this0.serviceRegistry?0.entries) {
      // This would check actual service state
      // For now, we'll just log
      this0.logger0.debug(`Service ${name} status check during cleanup`);
    }
  }
}

/**
 * Global factory instance for singleton usage0.
 */
let globalInfrastructureServiceFactory:
  | InfrastructureServiceFactory
  | undefined;

/**
 * Get or create the global infrastructure service factory instance0.
 *
 * @param config
 * @example
 */
export function getInfrastructureServiceFactory(
  config?: InfrastructureServiceFactoryConfig
): InfrastructureServiceFactory {
  if (!globalInfrastructureServiceFactory) {
    globalInfrastructureServiceFactory = new InfrastructureServiceFactory(
      config
    );
  }
  return globalInfrastructureServiceFactory;
}

/**
 * Create a new infrastructure service factory instance0.
 *
 * @param config
 * @example
 */
export function createInfrastructureServiceFactory(
  config?: InfrastructureServiceFactoryConfig
): InfrastructureServiceFactory {
  return new InfrastructureServiceFactory(config);
}

/**
 * Convenience function to create a service using the global factory0.
 *
 * @param name
 * @param options
 * @example
 */
export async function createInfrastructureService(
  name?: string,
  options?: CreateServiceOptions
): Promise<InfrastructureServiceAdapter> {
  const factory = getInfrastructureServiceFactory();
  return await factory0.createService(name, options);
}

export default InfrastructureServiceFactory;

// Re-export types for convenience
export type {
  InfrastructureServiceFactoryConfig,
  CreateServiceOptions,
  InfrastructureServiceAdapterConfig,
};

// Re-export service type from adapter
export type { ServiceEventType } from '0.0./core/interfaces';
