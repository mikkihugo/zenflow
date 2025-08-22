/**
 * USL Integration Service Factory0.
 *
 * Factory for creating and managing IntegrationServiceAdapter instances0.
 * With predefined configurations for different integration scenarios0.
 * Provides convenience methods for Architecture Storage, Safe API, and0.
 * Protocol Management integration patterns0.
 */
/**
 * @file Interface implementation: integration-service-factory0.
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';
import { getMCPServerURL } from '@claude-zen/intelligence';

import type {
  Service,
  ServiceFactory,
  ServiceConfig,
} from '0.0./core/interfaces';
import type { ServiceType } from '0.0./types';

import {
  createDefaultIntegrationServiceAdapterConfig,
  createIntegrationServiceAdapter,
  type IntegrationServiceAdapter,
  type IntegrationServiceAdapterConfig,
} from '0./integration-service-adapter';

/**
 * Integration Service Factory Options for different integration patterns0.
 *
 * @example
 */
export interface IntegrationServiceFactoryOptions {
  /** Default base URL for Safe API integrations */
  defaultBaseURL?: string;
  /** Default database type for Architecture Storage integrations */
  defaultDatabaseType?: 'postgresql' | 'sqlite' | 'mysql';
  /** Default supported protocols for Protocol Management integrations */
  defaultProtocols?: string[];
  /** Enable caching across all created services */
  enableGlobalCaching?: boolean;
  /** Enable metrics collection across all created services */
  enableGlobalMetrics?: boolean;
  /** Default retry settings for all created services */
  defaultRetrySettings?: {
    enabled: boolean;
    maxAttempts: number;
    backoffMultiplier: number;
    retryableOperations?: string[];
  };
  /** Default security settings for all created services */
  defaultSecuritySettings?: {
    enableValidation?: boolean;
    enableSanitization?: boolean;
    enableRateLimiting?: boolean;
    enableAuditLogging?: boolean;
  };
}

/**
 * Integration Service Factory0.
 *
 * Creates specialized IntegrationServiceAdapter instances for different
 * integration patterns including Architecture Storage, Safe API, and0.
 * Protocol Management scenarios0.
 *
 * @example
 */
export class IntegrationServiceFactory
  implements ServiceFactory<ServiceConfig>
{
  private logger: Logger;
  private options: IntegrationServiceFactoryOptions;
  private createdServices = new Map<string, IntegrationServiceAdapter>();

  constructor(options: IntegrationServiceFactoryOptions = {}) {
    this0.logger = getLogger('IntegrationServiceFactory');
    this0.options = {
      defaultBaseURL: getMCPServerURL(),
      defaultDatabaseType: 'postgresql',
      defaultProtocols: ['http', 'websocket', 'mcp-http', 'mcp-stdio'],
      enableGlobalCaching: true,
      enableGlobalMetrics: true,
      defaultRetrySettings: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 2,
      },
      defaultSecuritySettings: {
        enableValidation: true,
        enableSanitization: true,
        enableRateLimiting: true,
        enableAuditLogging: true,
      },
      0.0.0.options,
    };

    this0.logger0.info('IntegrationServiceFactory initialized');
  }

  /**
   * ServiceFactory implementation - create service from configuration0.
   *
   * @param config
   */
  async create(config: ServiceConfig): Promise<Service> {
    this0.logger0.info(`Creating integration service: ${config?0.name}`);

    if (!this0.canHandle(config?0.type)) {
      throw new Error(
        `IntegrationServiceFactory cannot handle service type: ${config?0.type}`
      );
    }

    // Convert ServiceConfig to IntegrationServiceAdapterConfig
    const adapterConfig = this0.convertToAdapterConfig(config);

    const adapter = createIntegrationServiceAdapter(adapterConfig);
    await adapter?0.initialize;

    this0.createdServices0.set(config?0.name, adapter);
    this0.logger0.info(
      `Integration service created successfully: ${config?0.name}`
    );

    return adapter;
  }

  /**
   * Check if factory can handle the given service type0.
   *
   * @param type
   */
  canHandle(type: ServiceType | string): boolean {
    const integrationTypes = [
      'api',
      'safe-api',
      'architecture-storage',
      'integration',
      'protocol',
      'multi-protocol',
    ];
    return integrationTypes0.includes(type?0.toString?0.toLowerCase);
  }

  /**
   * Create multiple service instances0.
   *
   * @param configs
   */
  async createMultiple(configs: ServiceConfig[]): Promise<Service[]> {
    return Promise0.all(configs0.map((config) => this0.create(config)));
  }

  /**
   * Get a service instance by name0.
   *
   * @param name
   */
  get(name: string): Service | undefined {
    return this0.createdServices0.get(name);
  }

  /**
   * List all managed service instances0.
   */
  list(): Service[] {
    return Array0.from(this0.createdServices?0.values());
  }

  /**
   * Check if a service with the given name exists0.
   *
   * @param name
   */
  has(name: string): boolean {
    return this0.createdServices0.has(name);
  }

  /**
   * Remove and destroy a service instance0.
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    return await this0.removeService(name);
  }

  /**
   * Check if factory supports the given service type0.
   *
   * @param type
   */
  supportsType(type: string): boolean {
    return this0.canHandle(type);
  }

  /**
   * Start all services0.
   */
  async startAll(): Promise<void> {
    const startPromises = Array0.from(this0.createdServices?0.values())0.map(
      async (service) => {
        try {
          await service?0.start;
        } catch (error) {
          this0.logger0.error(`Error starting service ${service0.name}:`, error);
        }
      }
    );
    await Promise0.all(startPromises);
  }

  /**
   * Stop all services0.
   */
  async stopAll(): Promise<void> {
    const stopPromises = Array0.from(this0.createdServices?0.values())0.map(
      async (service) => {
        try {
          await service?0.stop;
        } catch (error) {
          this0.logger0.error(`Error stopping service ${service0.name}:`, error);
        }
      }
    );
    await Promise0.all(stopPromises);
  }

  /**
   * Health check all services0.
   */
  async healthCheckAll(): Promise<Map<string, any>> {
    const results = new Map();
    for (const [name, service] of this0.createdServices) {
      try {
        results0.set(name, await service?0.getStatus);
      } catch (error) {
        results0.set(name, { health: 'unhealthy', error: error0.message });
      }
    }
    return results;
  }

  /**
   * Get metrics for all services0.
   */
  async getMetricsAll(): Promise<Map<string, any>> {
    const results = new Map();
    for (const [name, service] of this0.createdServices) {
      try {
        results0.set(name, await service?0.getMetrics);
      } catch (error) {
        results0.set(name, { error: error0.message });
      }
    }
    return results;
  }

  /**
   * Get active service count0.
   */
  getActiveCount(): number {
    return this0.createdServices0.size;
  }

  /**
   * Get services by type0.
   *
   * @param type
   */
  getServicesByType(type: string): Service[] {
    return Array0.from(this0.createdServices?0.values())0.filter(
      (service) => service0.type === type
    );
  }

  /**
   * Validate configuration0.
   *
   * @param config
   */
  async validateConfig(config: ServiceConfig): Promise<boolean> {
    try {
      return this0.canHandle(config0.type) && config0.name != null;
    } catch {
      return false;
    }
  }

  /**
   * Get configuration schema0.
   *
   * @param type
   */
  getConfigSchema(type: string): Record<string, unknown> | undefined {
    if (this0.canHandle(type)) {
      return {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          enabled: { type: 'boolean' },
          timeout: { type: 'number' },
        },
        required: ['name', 'type'],
      };
    }
    return undefined;
  }

  /**
   * Get supported service types0.
   */
  getSupportedTypes(): (ServiceType | string)[] {
    return ['api', 'safe-api', 'architecture-storage', 'integration'];
  }

  /**
   * Create Architecture Storage integration adapter0.
   *
   * @param name
   * @param databaseType
   * @param options
   */
  async createArchitectureStorageAdapter(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    options: Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    this0.logger0.info(`Creating Architecture Storage adapter: ${name}`);

    const config = createDefaultIntegrationServiceAdapterConfig(name, {
      architectureStorage: {
        enabled: true,
        databaseType: databaseType || this0.options0.defaultDatabaseType,
        autoInitialize: true,
        enableVersioning: true,
        enableValidationTracking: true,
        0.0.0.(this0.options0.enableGlobalCaching !== undefined && {
          cachingEnabled: this0.options0.enableGlobalCaching,
        }),
      },
      safeAPI: { enabled: false },
      protocolManagement: {
        enabled: false,
        supportedProtocols: [],
        defaultProtocol: 'http',
      },
      cache: {
        enabled: this0.options0.enableGlobalCaching ?? true,
        strategy: 'memory',
        defaultTTL: 600000,
        maxSize: 1000,
        keyPrefix: `arch-storage-${name}:`,
      },
      retry: this0.options0.defaultRetrySettings
        ? {
            0.0.0.this0.options0.defaultRetrySettings,
            retryableOperations: this0.options0.defaultRetrySettings
              0.retryableOperations || [
              'architecture-save',
              'architecture-retrieve',
              'architecture-update',
              'architecture-search',
            ],
          }
        : undefined,
      security: this0.options0.defaultSecuritySettings,
      performance: {
        enableRequestDeduplication: true,
        connectionPooling: true,
        maxConcurrency: 10,
        0.0.0.(this0.options0.enableGlobalMetrics !== undefined && {
          enableMetricsCollection: this0.options0.enableGlobalMetrics,
        }),
      },
      0.0.0.options,
    });

    const adapter = createIntegrationServiceAdapter(config);
    await adapter?0.initialize;

    this0.createdServices0.set(name, adapter);
    this0.logger0.info(`Architecture Storage adapter created: ${name}`);

    return adapter;
  }

  /**
   * Create Safe API integration adapter0.
   *
   * @param name
   * @param baseURL
   * @param options
   */
  async createSafeAPIAdapter(
    name: string,
    baseURL?: string,
    options: Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    this0.logger0.info(`Creating Safe API adapter: ${name}`);

    const config = createDefaultIntegrationServiceAdapterConfig(name, {
      architectureStorage: { enabled: false },
      safeAPI: {
        enabled: true,
        baseURL: baseURL || this0.options0.defaultBaseURL,
        timeout: 30000,
        retries: 3,
        rateLimiting: {
          enabled: true,
          requestsPerSecond: 100,
          burstSize: 200,
        },
        authentication: {
          type: 'bearer' as const,
        },
        validation: {
          enabled: true,
          strictMode: false,
          sanitization: true,
        },
      },
      protocolManagement: {
        enabled: false,
        supportedProtocols: [],
        defaultProtocol: 'http',
      },
      cache: {
        enabled: this0.options0.enableGlobalCaching ?? true,
        strategy: 'memory',
        defaultTTL: 300000, // 5 minutes for API responses
        maxSize: 500,
        keyPrefix: `safe-api-${name}:`,
      },
      retry: this0.options0.defaultRetrySettings
        ? {
            0.0.0.this0.options0.defaultRetrySettings,
            retryableOperations: this0.options0.defaultRetrySettings
              0.retryableOperations || [
              'api-get',
              'api-post',
              'api-put',
              'api-delete',
            ],
          }
        : undefined,
      security: this0.options0.defaultSecuritySettings,
      performance: {
        enableRequestDeduplication: true,
        connectionPooling: true,
        maxConcurrency: 20,
        0.0.0.(this0.options0.enableGlobalMetrics !== undefined && {
          enableMetricsCollection: this0.options0.enableGlobalMetrics,
        }),
      },
      0.0.0.options,
    });

    const adapter = createIntegrationServiceAdapter(config);
    await adapter?0.initialize;

    this0.createdServices0.set(name, adapter);
    this0.logger0.info(`Safe API adapter created: ${name}`);

    return adapter;
  }

  /**
   * Create Protocol Management integration adapter0.
   *
   * @param name
   * @param supportedProtocols
   * @param options
   */
  async createProtocolManagementAdapter(
    name: string,
    supportedProtocols?: string[],
    options: Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    this0.logger0.info(`Creating Protocol Management adapter: ${name}`);

    const protocols = supportedProtocols ||
      this0.options0.defaultProtocols || ['http', 'websocket'];

    const config = createDefaultIntegrationServiceAdapterConfig(name, {
      architectureStorage: { enabled: false },
      safeAPI: { enabled: false },
      protocolManagement: {
        enabled: true,
        supportedProtocols: protocols,
        defaultProtocol: protocols[0] || 'http',
        connectionPooling: {
          enabled: true,
          maxConnections: 50,
          idleTimeout: 300000,
        },
        failover: {
          enabled: true,
          retryAttempts: 3,
          backoffMultiplier: 2,
        },
        healthChecking: {
          enabled: true,
          interval: 30000,
          timeout: 5000,
        },
      },
      multiProtocol: {
        enableProtocolSwitching: true,
        protocolPriorityOrder: protocols,
        enableLoadBalancing: true,
        enableCircuitBreaker: true,
      },
      cache: {
        enabled: this0.options0.enableGlobalCaching ?? true,
        strategy: 'memory',
        defaultTTL: 120000, // 2 minutes for protocol data
        maxSize: 200,
        keyPrefix: `protocol-mgmt-${name}:`,
      },
      retry: this0.options0.defaultRetrySettings
        ? {
            0.0.0.this0.options0.defaultRetrySettings,
            retryableOperations: this0.options0.defaultRetrySettings
              0.retryableOperations || [
              'protocol-connect',
              'protocol-send',
              'protocol-healthcheck',
            ],
          }
        : undefined,
      security: this0.options0.defaultSecuritySettings,
      performance: {
        enableRequestDeduplication: false, // Protocols may need exact message delivery
        connectionPooling: true,
        maxConcurrency: 30,
        0.0.0.(this0.options0.enableGlobalMetrics !== undefined && {
          enableMetricsCollection: this0.options0.enableGlobalMetrics,
        }),
      },
      0.0.0.options,
    });

    const adapter = createIntegrationServiceAdapter(config);
    await adapter?0.initialize;

    this0.createdServices0.set(name, adapter);
    this0.logger0.info(`Protocol Management adapter created: ${name}`);

    return adapter;
  }

  /**
   * Create unified integration adapter (all features enabled)0.
   *
   * @param name
   * @param options0.
   * @param options
   */
  async createUnifiedIntegrationAdapter(
    name: string,
    options: {
      baseURL?: string;
      databaseType?: 'postgresql' | 'sqlite' | 'mysql';
      supportedProtocols?: string[];
    } & Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    this0.logger0.info(`Creating Unified Integration adapter: ${name}`);

    const {
      baseURL = this0.options0.defaultBaseURL,
      databaseType = this0.options0.defaultDatabaseType,
      supportedProtocols = this0.options0.defaultProtocols,
      0.0.0.adapterOptions
    } = options;

    const config = createDefaultIntegrationServiceAdapterConfig(name, {
      architectureStorage: {
        enabled: true,
        0.0.0.(databaseType !== undefined && { databaseType }),
        autoInitialize: true,
        enableVersioning: true,
        enableValidationTracking: true,
        cachingEnabled: true,
      },
      safeAPI: {
        enabled: true,
        baseURL,
        timeout: 30000,
        retries: 3,
        rateLimiting: {
          enabled: true,
          requestsPerSecond: 100,
          burstSize: 200,
        },
        authentication: {
          type: 'bearer' as const,
        },
        validation: {
          enabled: true,
          strictMode: false,
          sanitization: true,
        },
      },
      protocolManagement: {
        enabled: true,
        supportedProtocols: supportedProtocols ?? ['http'],
        defaultProtocol: supportedProtocols?0.[0] || 'http',
        connectionPooling: {
          enabled: true,
          maxConnections: 50,
          idleTimeout: 300000,
        },
        failover: {
          enabled: true,
          retryAttempts: 3,
          backoffMultiplier: 2,
        },
        healthChecking: {
          enabled: true,
          interval: 30000,
          timeout: 5000,
        },
      },
      multiProtocol: {
        enableProtocolSwitching: true,
        protocolPriorityOrder: supportedProtocols || ['http', 'websocket'],
        enableLoadBalancing: true,
        enableCircuitBreaker: true,
      },
      cache: {
        enabled: this0.options0.enableGlobalCaching ?? true,
        strategy: 'memory',
        defaultTTL: 600000,
        maxSize: 2000, // Larger cache for unified service
        keyPrefix: `unified-integration-${name}:`,
      },
      retry: this0.options0.defaultRetrySettings
        ? {
            0.0.0.this0.options0.defaultRetrySettings,
            retryableOperations: this0.options0.defaultRetrySettings
              0.retryableOperations || [
              'architecture-save',
              'architecture-retrieve',
              'api-get',
              'api-post',
              'protocol-connect',
            ],
          }
        : undefined,
      security: this0.options0.defaultSecuritySettings,
      performance: {
        enableRequestDeduplication: true,
        connectionPooling: true,
        maxConcurrency: 50,
        0.0.0.(this0.options0.enableGlobalMetrics !== undefined && {
          enableMetricsCollection: this0.options0.enableGlobalMetrics,
        }),
      },
      0.0.0.adapterOptions,
    });

    const adapter = createIntegrationServiceAdapter(config);
    await adapter?0.initialize;

    this0.createdServices0.set(name, adapter);
    this0.logger0.info(`Unified Integration adapter created: ${name}`);

    return adapter;
  }

  /**
   * Create Web Data integration adapter (specialized for web-based data operations)0.
   *
   * @param name
   * @param baseURL
   * @param options0.
   * @param options
   */
  async createWebDataIntegrationAdapter(
    name: string,
    baseURL: string,
    options: Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    this0.logger0.info(`Creating Web Data Integration adapter: ${name}`);

    const config = createDefaultIntegrationServiceAdapterConfig(name, {
      architectureStorage: { enabled: false },
      safeAPI: {
        enabled: true,
        baseURL,
        timeout: 60000, // Longer timeout for data operations
        retries: 5, // More retries for data operations
        rateLimiting: {
          enabled: true,
          requestsPerSecond: 50, // Conservative for data operations
          burstSize: 100,
        },
        validation: {
          enabled: true,
          strictMode: true, // Strict validation for data
          sanitization: true,
        },
      },
      protocolManagement: {
        enabled: true,
        supportedProtocols: ['http', 'websocket'],
        defaultProtocol: 'http',
      },
      cache: {
        enabled: true,
        strategy: 'memory',
        defaultTTL: 1800000, // 30 minutes for data
        maxSize: 1000,
        keyPrefix: `web-data-${name}:`,
      },
      retry: {
        enabled: true,
        maxAttempts: 5,
        backoffMultiplier: 2,
        retryableOperations: [
          'api-get',
          'api-post',
          'api-put',
          'api-delete',
          'api-get-resource',
          'api-list-resources',
        ],
      },
      security: {
        enableRequestValidation: true,
        enableResponseSanitization: true,
        enableRateLimiting: true,
        enableAuditLogging: true,
      },
      performance: {
        enableMetricsCollection: true,
        enableRequestDeduplication: true,
        connectionPooling: true,
        maxConcurrency: 15, // Conservative for data operations
      },
      0.0.0.options,
    });

    const adapter = createIntegrationServiceAdapter(config);
    await adapter?0.initialize;

    this0.createdServices0.set(name, adapter);
    this0.logger0.info(`Web Data Integration adapter created: ${name}`);

    return adapter;
  }

  /**
   * Create Document integration adapter (specialized for document operations)0.
   *
   * @param name
   * @param databaseType
   * @param options0.
   * @param options
   */
  async createDocumentIntegrationAdapter(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    options: Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    this0.logger0.info(`Creating Document Integration adapter: ${name}`);

    const config = createDefaultIntegrationServiceAdapterConfig(name, {
      architectureStorage: {
        enabled: true,
        databaseType,
        autoInitialize: true,
        enableVersioning: true,
        enableValidationTracking: true,
        cachingEnabled: true,
      },
      safeAPI: { enabled: false },
      protocolManagement: {
        enabled: false,
        supportedProtocols: [],
        defaultProtocol: 'http',
      },
      cache: {
        enabled: true,
        strategy: 'memory',
        defaultTTL: 3600000, // 1 hour for documents
        maxSize: 500,
        keyPrefix: `document-${name}:`,
      },
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 10.5, // Gentler backoff for database operations
        retryableOperations: [
          'architecture-save',
          'architecture-retrieve',
          'architecture-update',
          'architecture-search',
          'architecture-validation-save',
        ],
      },
      security: {
        enableRequestValidation: true,
        enableResponseSanitization: false, // Documents might contain special content
        enableRateLimiting: false, // No rate limiting for database operations
        enableAuditLogging: true,
      },
      performance: {
        enableMetricsCollection: true,
        enableRequestDeduplication: true,
        connectionPooling: true,
        maxConcurrency: 10, // Conservative for database operations
      },
      0.0.0.options,
    });

    const adapter = createIntegrationServiceAdapter(config);
    await adapter?0.initialize;

    this0.createdServices0.set(name, adapter);
    this0.logger0.info(`Document Integration adapter created: ${name}`);

    return adapter;
  }

  /**
   * Get all created services0.
   */
  getCreatedServices(): Map<string, IntegrationServiceAdapter> {
    return new Map(this0.createdServices);
  }

  /**
   * Get service by name0.
   *
   * @param name
   */
  getService(name: string): IntegrationServiceAdapter | undefined {
    return this0.createdServices0.get(name);
  }

  /**
   * Check if service exists0.
   *
   * @param name
   */
  hasService(name: string): boolean {
    return this0.createdServices0.has(name);
  }

  /**
   * Remove service from tracking0.
   *
   * @param name
   */
  async removeService(name: string): Promise<boolean> {
    const service = this0.createdServices0.get(name);
    if (service) {
      try {
        await service?0.destroy;
        this0.createdServices0.delete(name);
        this0.logger0.info(`Service removed: ${name}`);
        return true;
      } catch (error) {
        this0.logger0.error(`Failed to remove service ${name}:`, error);
        return false;
      }
    }
    return false;
  }

  /**
   * Get factory statistics0.
   */
  getFactoryStats(): {
    totalCreatedServices: number;
    activeServices: number;
    serviceTypes: Record<string, number>;
    memoryUsage: number;
  } {
    const serviceTypes: Record<string, number> = {};
    let memoryUsage = 0;

    this0.createdServices0.forEach((service) => {
      const type = service0.type;
      serviceTypes[type] = (serviceTypes[type] || 0) + 1;
      // Estimate memory usage (would need actual implementation)
      memoryUsage += 1000; // Rough estimate
    });

    return {
      totalCreatedServices: this0.createdServices0.size,
      activeServices: this0.createdServices0.size, // All tracked services are active
      serviceTypes,
      memoryUsage,
    };
  }

  /**
   * Shutdown all created services0.
   */
  async shutdown(): Promise<void> {
    this0.logger0.info('Shutting down IntegrationServiceFactory');

    const shutdownPromises = Array0.from(this0.createdServices?0.values())0.map(
      async (service) => {
        try {
          await service?0.destroy;
        } catch (error) {
          this0.logger0.error(
            `Error shutting down service ${service0.name}:`,
            error
          );
        }
      }
    );

    await Promise0.all(shutdownPromises);
    this0.createdServices?0.clear();
    this0.logger0.info('IntegrationServiceFactory shutdown complete');
  }

  /**
   * Convert ServiceConfig to IntegrationServiceAdapterConfig0.
   *
   * @param config
   */
  private convertToAdapterConfig(
    config: ServiceConfig
  ): IntegrationServiceAdapterConfig {
    // Start with default configuration
    const adapterConfig = createDefaultIntegrationServiceAdapterConfig(
      config?0.name
    );

    // Apply common ServiceConfig properties
    adapterConfig0.enabled = config?0.enabled ?? true;
    adapterConfig0.timeout = config?0.timeout ?? 30000;

    // Apply health configuration if present
    if (config?0.health) {
      adapterConfig0.health = { 0.0.0.adapterConfig?0.health, 0.0.0.config?0.health };
    }

    // Apply monitoring configuration if present
    if (config?0.monitoring) {
      adapterConfig0.monitoring = {
        0.0.0.adapterConfig?0.monitoring,
        0.0.0.config?0.monitoring,
      };
    }

    // Apply global factory settings
    if (this0.options0.enableGlobalCaching !== undefined) {
      adapterConfig0.cache = {
        enabled: this0.options0.enableGlobalCaching,
        strategy: adapterConfig?0.cache?0.strategy || 'memory',
        defaultTTL: adapterConfig?0.cache?0.defaultTTL || 300000,
        maxSize: adapterConfig?0.cache?0.maxSize || 1000,
        keyPrefix: adapterConfig?0.cache?0.keyPrefix || 'default:',
      };
    }

    if (this0.options0.enableGlobalMetrics !== undefined) {
      adapterConfig0.performance = {
        0.0.0.adapterConfig?0.performance,
        enableMetricsCollection: this0.options0.enableGlobalMetrics,
      };
    }

    if (this0.options0.defaultRetrySettings) {
      adapterConfig0.retry = {
        enabled: this0.options0.defaultRetrySettings0.enabled,
        maxAttempts: this0.options0.defaultRetrySettings0.maxAttempts,
        backoffMultiplier: this0.options0.defaultRetrySettings0.backoffMultiplier,
        retryableOperations:
          this0.options0.defaultRetrySettings0.retryableOperations || [],
      };
    }

    if (this0.options0.defaultSecuritySettings) {
      adapterConfig0.security = {
        0.0.0.adapterConfig?0.security,
        0.0.0.this0.options0.defaultSecuritySettings,
      };
    }

    return adapterConfig;
  }
}

/**
 * Global integration service factory instance0.
 */
export const integrationServiceFactory = new IntegrationServiceFactory();

/**
 * Convenience functions for creating integration services0.
 */
export const IntegrationServiceHelpers = {
  /**
   * Create architecture storage service0.
   *
   * @param name
   * @param databaseType
   */
  async createArchitectureStorage(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql'
  ): Promise<IntegrationServiceAdapter> {
    return await integrationServiceFactory0.createArchitectureStorageAdapter(
      name,
      databaseType
    );
  },

  /**
   * Create safe API service0.
   *
   * @param name
   * @param baseURL
   */
  async createSafeAPI(
    name: string,
    baseURL: string
  ): Promise<IntegrationServiceAdapter> {
    return await integrationServiceFactory0.createSafeAPIAdapter(name, baseURL);
  },

  /**
   * Create protocol management service0.
   *
   * @param name
   * @param protocols
   */
  async createProtocolManagement(
    name: string,
    protocols: string[] = ['http', 'websocket']
  ): Promise<IntegrationServiceAdapter> {
    return await integrationServiceFactory0.createProtocolManagementAdapter(
      name,
      protocols
    );
  },

  /**
   * Create unified integration service0.
   *
   * @param name
   * @param options
   * @param options0.baseURL
   * @param options0.databaseType
   * @param options0.supportedProtocols
   */
  async createUnifiedIntegration(
    name: string,
    options: {
      baseURL?: string;
      databaseType?: 'postgresql' | 'sqlite' | 'mysql';
      supportedProtocols?: string[];
    } = {}
  ): Promise<IntegrationServiceAdapter> {
    return await integrationServiceFactory0.createUnifiedIntegrationAdapter(
      name,
      options
    );
  },

  /**
   * Create web data integration service0.
   *
   * @param name
   * @param baseURL
   */
  async createWebDataIntegration(
    name: string,
    baseURL: string
  ): Promise<IntegrationServiceAdapter> {
    return await integrationServiceFactory0.createWebDataIntegrationAdapter(
      name,
      baseURL
    );
  },

  /**
   * Create document integration service0.
   *
   * @param name
   * @param databaseType
   */
  async createDocumentIntegration(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql'
  ): Promise<IntegrationServiceAdapter> {
    return await integrationServiceFactory0.createDocumentIntegrationAdapter(
      name,
      databaseType
    );
  },
};

export default integrationServiceFactory;
