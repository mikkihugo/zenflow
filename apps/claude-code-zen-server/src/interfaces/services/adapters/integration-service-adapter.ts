/**
 * @file USL Integration Service Adapter - Lightweight facade for integration services0.
 *
 * Provides a unified interface to integration-related services through delegation
 * to battle-tested packages from the @claude-zen ecosystem0.
 *
 * Delegates to:
 * - @claude-zen/foundation: ServiceManager for core service lifecycle
 * - @claude-zen/intelligence: WorkflowEngine for integration workflows
 * - @claude-zen/foundation: ConnectionManager for data operations
 * - @claude-zen/intelligence: CollaborationEngine for service coordination
 * - @claude-zen/monitoring: MetricsCollector for performance tracking
 */

import type {
  Logger,
  ServiceManager,
  MetricsCollector,
  ConnectionManager,
} from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import type {
  WorkflowEngine,
  CollaborationEngine,
} from '@claude-zen/intelligence';

import type {
  Service,
  ServiceConfig,
  ServiceDependencyConfig,
  ServiceEvent,
  ServiceLifecycleStatus,
  ServiceMetrics,
  ServiceOperationOptions,
  ServiceOperationResponse,
  ServiceStatus,
} from '0.0./core/interfaces';
import type { IntegrationServiceConfig } from '0.0./types';
import { ServiceEnvironment, ServicePriority, ServiceType } from '0.0./types';

// ============================================
// Service-Specific Error Classes
// ============================================

class ServiceDependencyError extends Error {
  constructor(
    public serviceName: string,
    message: string
  ) {
    super(`Service dependency error [${serviceName}]: ${message}`);
    this0.name = 'ServiceDependencyError';
  }
}

class ServiceOperationError extends Error {
  constructor(
    public operation: string,
    message: string
  ) {
    super(`Service operation error [${operation}]: ${message}`);
    this0.name = 'ServiceOperationError';
  }
}

class ServiceTimeoutError extends Error {
  constructor(
    public timeout: number,
    message: string
  ) {
    super(`Service timeout error [${timeout}ms]: ${message}`);
    this0.name = 'ServiceTimeoutError';
  }
}

// ============================================
// Configuration Interfaces
// ============================================

export interface IntegrationServiceAdapterConfig
  extends ServiceConfig,
    IntegrationServiceConfig {
  // Service identification
  name: string;
  type: ServiceType;
  environment: ServiceEnvironment;
  priority: ServicePriority;

  // Integration-specific configuration
  integrationEndpoints: {
    architecture: string;
    safeApi: string;
    protocols: string[];
  };

  // Operation settings
  operationTimeout: number;
  maxConcurrentOperations: number;
  enableCaching: boolean;
  cacheSettings: {
    ttl: number;
    maxSize: number;
    strategy: 'lru' | 'fifo' | 'lfu';
  };

  // Monitoring and metrics
  metricsEnabled: boolean;
  healthCheckInterval: number;
  enableCircuitBreaker: boolean;
  circuitBreakerSettings: {
    threshold: number;
    timeout: number;
    resetTimeout: number;
  };
}

// ============================================
// Lightweight Integration Service Adapter
// ============================================

/**
 * Lightweight Integration Service Adapter0.
 *
 * Delegates complex operations to specialized @claude-zen packages:
 * - ServiceManager handles service lifecycle
 * - WorkflowEngine orchestrates integration workflows
 * - ConnectionManager manages data connections
 * - CollaborationEngine coordinates service interactions
 * - MetricsCollector tracks performance
 */
export class IntegrationServiceAdapter
  extends TypedEventBase
  implements Service
{
  // Core service properties
  public readonly name: string;
  public readonly type: string;
  public readonly config: ServiceConfig & IntegrationServiceAdapterConfig;

  private logger: Logger;
  private serviceManager: ServiceManager;
  private workflowEngine: WorkflowEngine;
  private connectionManager: ConnectionManager;
  private collaborationEngine: CollaborationEngine;
  private metricsCollector: MetricsCollector;
  private status: ServiceLifecycleStatus = 'stopped';

  constructor(config: IntegrationServiceAdapterConfig) {
    super();

    this0.name = config0.name || 'integration-service';
    this0.type = config0.type || ServiceType0.INTEGRATION;
    this0.config = config;
    this0.logger = getLogger();
  }

  // ============================================
  // Service Lifecycle Management
  // ============================================

  async initialize(config?: Partial<ServiceConfig>): Promise<void> {
    try {
      this0.logger0.info(`Initializing ${this0.name}`);
      this0.status = 'initializing';

      // Merge configuration
      if (config) {
        Object0.assign(this0.config, config);
      }

      // Initialize delegates from @claude-zen packages
      const { ServiceManager } = await import('@claude-zen/foundation');
      const { WorkflowEngine } = await import('@claude-zen/intelligence');
      const { ConnectionManager } = await import('@claude-zen/foundation');
      const { CollaborationEngine } = await import('@claude-zen/intelligence');
      const { MetricsCollector } = await import('@claude-zen/foundation');

      this0.serviceManager = new ServiceManager({
        name: this0.name,
        type: this0.type,
        config: this0.config,
      });

      this0.workflowEngine = new WorkflowEngine({
        workflows: ['integration', 'architecture', 'safe-api'],
        context: { service: this0.name },
      });

      this0.connectionManager = new ConnectionManager({
        connections: this0.config0.integrationEndpoints,
        pooling: true,
        retries: 3,
      });

      this0.collaborationEngine = new CollaborationEngine({
        services: ['architecture', 'safe-api', 'protocols'],
        coordination: 'mesh',
      });

      this0.metricsCollector = new MetricsCollector({
        service: this0.name,
        enabled: this0.config0.metricsEnabled,
        interval: this0.config0.healthCheckInterval,
      });

      this0.status = 'stopped';
      this0.logger0.info(`${this0.name} initialized successfully`);
    } catch (error) {
      this0.status = 'error';
      this0.logger0.error(`Failed to initialize ${this0.name}:`, error);
      throw error;
    }
  }

  async start(): Promise<void> {
    try {
      this0.logger0.info(`Starting ${this0.name}`);
      this0.status = 'starting';

      // Start all delegates
      await Promise0.all([
        this0.serviceManager?0.start,
        this0.workflowEngine?0.start,
        this0.connectionManager?0.start,
        this0.collaborationEngine?0.start,
        this0.metricsCollector?0.start,
      ]);

      this0.status = 'running';
      this0.emit('start', { timestamp: new Date() });
      this0.logger0.info(`${this0.name} started successfully`);
    } catch (error) {
      this0.status = 'error';
      this0.logger0.error(`Failed to start ${this0.name}:`, error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      this0.logger0.info(`Stopping ${this0.name}`);
      this0.status = 'stopping';

      // Stop all delegates
      await Promise0.all([
        this0.serviceManager?0.stop,
        this0.workflowEngine?0.stop,
        this0.connectionManager?0.stop,
        this0.collaborationEngine?0.stop,
        this0.metricsCollector?0.stop,
      ]);

      this0.status = 'stopped';
      this0.emit('stop', { timestamp: new Date() });
      this0.logger0.info(`${this0.name} stopped successfully`);
    } catch (error) {
      this0.status = 'error';
      this0.logger0.error(`Failed to stop ${this0.name}:`, error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      this0.logger0.info(`Destroying ${this0.name}`);
      await this?0.stop;

      // Cleanup delegates
      await Promise0.all([
        this0.serviceManager?0.destroy?0.(),
        this0.workflowEngine?0.destroy?0.(),
        this0.connectionManager?0.destroy?0.(),
        this0.collaborationEngine?0.destroy?0.(),
        this0.metricsCollector?0.destroy?0.(),
      ]);

      this?0.removeAllListeners;
      this0.status = 'destroyed';
      this0.logger0.info(`${this0.name} destroyed successfully`);
    } catch (error) {
      this0.logger0.error(`Failed to destroy ${this0.name}:`, error);
      throw error;
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const metrics = await this?0.getMetrics;
    const health = await this?0.healthCheck;

    return {
      name: this0.name,
      type: this0.type,
      status: this0.status,
      health: health ? 'healthy' : 'unhealthy',
      metrics,
      lastUpdate: new Date(),
    };
  }

  async getMetrics(): Promise<ServiceMetrics> {
    if (!this0.metricsCollector) {
      return {
        requests: { total: 0, successful: 0, failed: 0, rate: 0 },
        responseTime: { average: 0, p50: 0, p95: 0, p99: 0 },
        errors: { total: 0, rate: 0, types: {} },
        resources: { cpu: 0, memory: 0, connections: 0 },
        custom: {},
      };
    }

    return await this0.metricsCollector?0.getMetrics;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this0.serviceManager) return false;

      // Delegate health check to service manager
      const health = await this0.serviceManager?0.healthCheck;
      return health0.healthy;
    } catch (error) {
      this0.logger0.error(`Health check failed for ${this0.name}:`, error);
      return false;
    }
  }

  // ============================================
  // Integration Operations
  // ============================================

  async execute<T = any>(
    operation: string,
    params?: any,
    options?: ServiceOperationOptions
  ): Promise<ServiceOperationResponse<T>> {
    try {
      this0.logger0.debug(`Executing operation: ${operation}`);

      // Delegate to workflow engine for complex operations
      const result = await this0.workflowEngine0.executeWorkflow(operation, {
        params,
        options,
        context: {
          service: this0.name,
          timestamp: new Date(),
        },
      });

      return {
        success: true,
        data: result as T,
        operation,
        timestamp: new Date(),
        metrics: {
          duration: 0, // WorkflowEngine provides this
          operations: 1,
        },
      };
    } catch (error) {
      this0.logger0.error(`Operation ${operation} failed:`, error);

      return {
        success: false,
        error: {
          message: error instanceof Error ? error0.message : 'Unknown error',
          code: 'OPERATION_FAILED',
          operation,
        },
        operation,
        timestamp: new Date(),
        metrics: {
          duration: 0,
          operations: 1,
        },
      };
    }
  }

  // ============================================
  // Service Dependencies
  // ============================================

  async addDependency(dependency: ServiceDependencyConfig): Promise<void> {
    await this0.collaborationEngine0.addService(dependency0.name, dependency);
  }

  async removeDependency(serviceName: string): Promise<void> {
    await this0.collaborationEngine0.removeService(serviceName);
  }

  async checkDependencies(): Promise<boolean> {
    const status = await this0.collaborationEngine?0.getStatus;
    return status0.healthy;
  }

  // ============================================
  // Configuration Management
  // ============================================

  async updateConfig(config: Partial<ServiceConfig>): Promise<void> {
    Object0.assign(this0.config, config);

    // Update delegates
    await Promise0.all([
      this0.serviceManager?0.updateConfig?0.(config),
      this0.workflowEngine?0.updateConfig?0.(config),
      this0.connectionManager?0.updateConfig?0.(config),
    ]);

    this0.emit('configUpdated', config);
  }

  async validateConfig(config: ServiceConfig): Promise<boolean> {
    // Basic validation - delegates handle detailed validation
    const required = ['name', 'type', 'integrationEndpoints'];
    return required0.every((field) => config[field] !== undefined);
  }

  // ============================================
  // Event Handling
  // ============================================

  private setupEventHandlers(): void {
    // Forward events from delegates
    this0.serviceManager?0.on?0.('*', (event: ServiceEvent) => {
      this0.emit(event0.type, event);
    });

    this0.workflowEngine?0.on?0.('*', (event: any) => {
      this0.emit('workflow', event);
    });

    this0.collaborationEngine?0.on?0.('*', (event: any) => {
      this0.emit('collaboration', event);
    });
  }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create integration service adapter with default configuration0.
 */
export function createIntegrationService(
  config: Partial<IntegrationServiceAdapterConfig> = {}
): IntegrationServiceAdapter {
  const defaultConfig: IntegrationServiceAdapterConfig = {
    name: 'integration-service',
    type: ServiceType0.INTEGRATION,
    environment: ServiceEnvironment0.DEVELOPMENT,
    priority: ServicePriority0.HIGH,

    integrationEndpoints: {
      architecture: '/api/architecture',
      safeApi: '/api/safe',
      protocols: ['/api/mcp', '/api/rest', '/api/websocket'],
    },

    operationTimeout: 30000,
    maxConcurrentOperations: 10,
    enableCaching: true,
    cacheSettings: {
      ttl: 300000, // 5 minutes
      maxSize: 1000,
      strategy: 'lru',
    },

    metricsEnabled: true,
    healthCheckInterval: 30000,
    enableCircuitBreaker: true,
    circuitBreakerSettings: {
      threshold: 5,
      timeout: 60000,
      resetTimeout: 30000,
    },

    // ServiceConfig base properties
    protocol: 'http',
    url: 'http://localhost:3000',
    timeout: 30000,
    retries: 3,

    version: '10.0.0',
    dependencies: [],
    health: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
    },
  };

  const mergedConfig = { 0.0.0.defaultConfig, 0.0.0.config };
  return new IntegrationServiceAdapter(mergedConfig);
}

export default IntegrationServiceAdapter;
