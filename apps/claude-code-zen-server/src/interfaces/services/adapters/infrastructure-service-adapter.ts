/**
 * @file USL Infrastructure Service Adapter - Lightweight facade for infrastructure services.
 *
 * Provides unified interface to infrastructure-related services through delegation
 * to battle-tested packages from the @claude-zen ecosystem.
 *
 * Delegates to:
 * - @claude-zen/foundation: ServiceManager for core infrastructure lifecycle
 * - @claude-zen/foundation: DatabaseManager for data operations
 * - @claude-zen/intelligence: WorkflowOrchestrator for infrastructure workflows
 * - @claude-zen/monitoring: MetricsCollector for infrastructure monitoring
 * - @claude-zen/intelligence: ResourceOptimizer for performance optimization
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';

import type {
  Service,
  ServiceConfig,
  ServiceDependencyConfig,
  ServiceLifecycleStatus,
  ServiceMetrics,
  ServiceOperationOptions,
  ServiceOperationResponse,
  ServiceStatus,
} from './core/interfaces';
import { ServiceEnvironment, ServicePriority, ServiceType } from './types';

// ============================================
// Service Error Classes
// ============================================

class ServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

class ServiceDependencyError extends Error {
  constructor(
    public serviceName: string,
    message: string
  ) {
    super(`Service dependency error [${serviceName}]: ${message}`);
    this.name = 'ServiceDependencyError';
  }
}

class ServiceOperationError extends Error {
  constructor(
    public operation: string,
    message: string
  ) {
    super(`Service operation error [${operation}]: ${message}`);
    this.name = 'ServiceOperationError';
  }
}

class ServiceTimeoutError extends Error {
  constructor(
    public timeout: number,
    message: string
  ) {
    super(`Service timeout error [${timeout}ms]: ${message}`);
    this.name = 'ServiceTimeoutError';
  }
}

// ============================================
// Configuration Interface
// ============================================

export interface InfrastructureServiceAdapterConfig extends ServiceConfig {
  // Service identification
  name: string;
  type: ServiceType;
  environment: ServiceEnvironment;
  priority: ServicePriority;

  // Infrastructure-specific configuration
  infrastructure: {
    database: {
      enabled: boolean;
      connections: number;
      pooling: boolean;
    };
    memory: {
      enabled: boolean;
      cacheSize: number;
      ttl: number;
    };
    neural: {
      enabled: boolean;
      models: string[];
      optimization: boolean;
    };
    swarm: {
      enabled: boolean;
      maxAgents: number;
      topology: string;
    };
    workflow: {
      enabled: boolean;
      maxConcurrent: number;
      timeout: number;
    };
  };

  // Performance settings
  performance: {
    optimization: boolean;
    loadBalancing: boolean;
    caching: boolean;
    monitoring: boolean;
  };

  // Resource management
  resources: {
    maxMemory: number;
    maxCpu: number;
    maxConnections: number;
    cleanup: {
      enabled: boolean;
      interval: number;
    };
  };
}

// ============================================
// Infrastructure Service Adapter
// ============================================

/**
 * Lightweight Infrastructure Service Adapter.
 *
 * Delegates infrastructure operations to specialized @claude-zen packages:
 * - ServiceManager handles core infrastructure lifecycle
 * - DatabaseManager provides data operations
 * - WorkflowOrchestrator manages infrastructure workflows
 * - MetricsCollector tracks infrastructure performance
 * - ResourceOptimizer optimizes resource utilization
 */
export class InfrastructureServiceAdapter
  extends TypedEventBase
  implements Service
{
  public readonly name: string;
  public readonly type: string;
  public readonly config: ServiceConfig & InfrastructureServiceAdapterConfig;

  private logger: Logger;
  private serviceManager: any;
  private databaseManager: any;
  private workflowOrchestrator: any;
  private metricsCollector: any;
  private resourceOptimizer: any;
  private status: ServiceLifecycleStatus = 'stopped';
  private initialized = false;

  constructor(config: InfrastructureServiceAdapterConfig) {
    super();

    this.name = config.name || 'infrastructure-service';
    this.type = config.type || ServiceType.INFRASTRUCTURE;
    this.config = config;
    this.logger = getLogger();
  }

  // ============================================
  // Service Lifecycle Management
  // ============================================

  async initialize(config?: Partial<ServiceConfig>): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info(`Initializing ${this.name}`);
      this.status = 'initializing';

      // Merge configuration
      if (config) {
        Object.assign(this.config, config);
      }

      // Initialize delegates from @claude-zen packages
      const { ServiceManager, MetricsCollector } = await import(
        '@claude-zen/foundation'
      );
      const { DatabaseManager } = await import('@claude-zen/foundation');
      const { WorkflowOrchestrator } = await import('@claude-zen/intelligence');
      const { ResourceOptimizer } = await import('@claude-zen/intelligence');

      this.serviceManager = new ServiceManager({
        name: this.name,
        type: this.type,
        config: this.config,
        services: ['database, memory', 'neural, swarm', 'workflow'],
      });

      this.databaseManager = new DatabaseManager({
        connections: this.config.infrastructure.database.connections,
        pooling: this.config.infrastructure.database.pooling,
        enabled: this.config.infrastructure.database.enabled,
      });

      this.workflowOrchestrator = new WorkflowOrchestrator({
        workflows: ['infrastructure, deployment', 'scaling, maintenance'],
        maxConcurrent: this.config.infrastructure.workflow.maxConcurrent,
        timeout: this.config.infrastructure.workflow.timeout,
      });

      this.metricsCollector = new MetricsCollector({
        service: this.name,
        enabled: this.config.performance.monitoring,
        metrics: ['cpu, memory', 'connections, throughput'],
      });

      this.resourceOptimizer = new ResourceOptimizer({
        enabled: this.config.performance.optimization,
        loadBalancing: this.config.performance.loadBalancing,
        resources: this.config.resources,
      });

      this.status = 'stopped';
      this.initialized = true;
      this.logger.info(`${this.name} initialized successfully`);
    } catch (error) {
      this.status = 'error';
      this.logger.error(`Failed to initialize ${this.name}:`, error);
      throw error;
    }
  }

  async start(): Promise<void> {
    await this.initialize;

    try {
      this.logger.info(`Starting ${this.name}`);
      this.status = 'starting';

      // Start all delegates in parallel
      await Promise.all([
        this.serviceManager?.start,
        this.databaseManager?.start,
        this.workflowOrchestrator?.start,
        this.metricsCollector?.start,
        this.resourceOptimizer?.start,
      ]);

      this.status = 'running';
      this.emit('start', { timestamp: new Date() });
      this.logger.info(`${this.name} started successfully`);
    } catch (error) {
      this.status = 'error';
      this.logger.error(`Failed to start ${this.name}:`, error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      this.logger.info(`Stopping ${this.name}`);
      this.status = 'stopping';

      // Stop all delegates in parallel
      await Promise.all([
        this.serviceManager?.stop,
        this.databaseManager?.stop,
        this.workflowOrchestrator?.stop,
        this.metricsCollector?.stop,
        this.resourceOptimizer?.stop,
      ]);

      this.status = 'stopped';
      this.emit('stop', { timestamp: new Date() });
      this.logger.info(`${this.name} stopped successfully`);
    } catch (error) {
      this.status = 'error';
      this.logger.error(`Failed to stop ${this.name}:`, error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      this.logger.info(`Destroying ${this.name}`);
      await this.stop;

      // Cleanup delegates
      await Promise.all([
        this.serviceManager?.destroy?.(),
        this.databaseManager?.destroy?.(),
        this.workflowOrchestrator?.destroy?.(),
        this.metricsCollector?.destroy?.(),
        this.resourceOptimizer?.destroy?.(),
      ]);

      this.removeAllListeners;
      this.status = 'destroyed';
      this.initialized = false;
      this.logger.info(`${this.name} destroyed successfully`);
    } catch (error) {
      this.logger.error(`Failed to destroy ${this.name}:`, error);
      throw error;
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const metrics = await this.getMetrics;
    const health = await this.healthCheck;

    return {
      name: this.name,
      type: this.type,
      status: this.status,
      health: health ? 'healthy : unhealthy',
      metrics,
      lastUpdate: new Date(),
    };
  }

  async getMetrics(): Promise<ServiceMetrics> {
    if (!this.metricsCollector) {
      return {
        requests: { total: 0, successful: 0, failed: 0, rate: 0 },
        responseTime: { average: 0, p5: 0, p95: 0, p99: 0 },
        errors: { total: 0, rate: 0, types: {} },
        resources: { cpu: 0, memory: 0, connections: 0 },
        custom: {},
      };
    }

    return await this.metricsCollector?.getMetrics()
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.serviceManager) return false;

      // Delegate health check to service manager
      const health = await this.serviceManager?.healthCheck()
      return health.healthy;
    } catch (error) {
      this.logger.error(`Health check failed for ${this.name}:`, error);
      return false;
    }
  }

  // ============================================
  // Infrastructure Operations
  // ============================================

  async execute<T = any>(
    operation: string,
    params?: any,
    options?: ServiceOperationOptions
  ): Promise<ServiceOperationResponse<T>> {
    try {
      this.logger.debug(`Executing infrastructure operation: ${operation}`);

      // Delegate to workflow orchestrator for complex operations
      const result = await this.workflowOrchestrator.executeWorkflow(
        operation,
        {
          params,
          options,
          context: {
            service: this.name,
            infrastructure: this.config.infrastructure,
            timestamp: new Date(),
          },
        }
      );

      return {
        success: true,
        data: result as T,
        operation,
        timestamp: new Date(),
        metrics: {
          duration: 0, // WorkflowOrchestrator provides this
          operations: 1,
        },
      };
    } catch (error) {
      this.logger.error(`Infrastructure operation ${operation} failed:`, error);

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INFRASTRUCTURE_OPERATION_FAILED',
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
    await this.serviceManager.addDependency(dependency.name, dependency);
  }

  async removeDependency(serviceName: string): Promise<void> {
    await this.serviceManager.removeDependency(serviceName);
  }

  async checkDependencies(): Promise<boolean> {
    const status = await this.serviceManager?.getDependencyStatus()
    return status.healthy;
  }

  // ============================================
  // Configuration Management
  // ============================================

  async updateConfig(config: Partial<ServiceConfig>): Promise<void> {
    Object.assign(this.config, config);

    // Update delegates
    await Promise.all([
      this.serviceManager?.updateConfig?.(config),
      this.databaseManager?.updateConfig?.(config),
      this.workflowOrchestrator?.updateConfig?.(config),
      this.resourceOptimizer?.updateConfig?.(config),
    ]);

    this.emit('configUpdated', config);
  }

  async validateConfig(config: ServiceConfig): Promise<boolean> {
    // Basic validation - delegates handle detailed validation
    const required = ['name, type', 'infrastructure'];
    return required.every((field) => config[field] !== undefined);
  }

  // ============================================
  // Infrastructure-Specific Operations
  // ============================================

  /**
   * Optimize infrastructure resources.
   */
  async optimizeResources(): Promise<{ optimized: boolean; metrics: any }> {
    if (!this.resourceOptimizer) {
      throw new ServiceOperationError(
        'optimize-resources',
        'Resource optimizer not available'
      );
    }

    return await this.resourceOptimizer.optimize({
      target: 'infrastructure',
      metrics: await this.getMetrics,
      constraints: this.config.resources,
    });
  }

  /**
   * Scale infrastructure components.
   */
  async scale(
    component: string,
    instances: number
  ): Promise<{ scaled: boolean; instances: number }> {
    const result = await this.execute('scale-component', {
      component,
      instances,
      config:
        this.config.infrastructure[
          component as keyof typeof this.config.infrastructure
        ],
    });

    return {
      scaled: result.success,
      instances: result.data?.instances || instances,
    };
  }

  /**
   * Perform maintenance operations.
   */
  async performMaintenance(
    type: string
  ): Promise<{ completed: boolean; results: any }> {
    const result = await this.execute('maintenance', {
      type,
      infrastructure: this.config.infrastructure,
    });

    return {
      completed: result.success,
      results: result.data,
    };
  }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create infrastructure service adapter with default configuration.
 */
export function createInfrastructureService(
  config: Partial<InfrastructureServiceAdapterConfig> = {}
): InfrastructureServiceAdapter {
  const defaultConfig: InfrastructureServiceAdapterConfig = {
    name: 'infrastructure-service',
    type: ServiceType.INFRASTRUCTURE,
    environment: ServiceEnvironment.DEVELOPMENT,
    priority: ServicePriority.HIGH,

    infrastructure: {
      database: {
        enabled: true,
        connections: 10,
        pooling: true,
      },
      memory: {
        enabled: true,
        cacheSize: 1000,
        ttl: 300000, // 5 minutes
      },
      neural: {
        enabled: true,
        models: ['decision-support, optimization'],
        optimization: true,
      },
      swarm: {
        enabled: true,
        maxAgents: 50,
        topology: 'mesh',
      },
      workflow: {
        enabled: true,
        maxConcurrent: 20,
        timeout: 300000, // 5 minutes
      },
    },

    performance: {
      optimization: true,
      loadBalancing: true,
      caching: true,
      monitoring: true,
    },

    resources: {
      maxMemory: 2048, // MB
      maxCpu: 80, // percent
      maxConnections: 1000,
      cleanup: {
        enabled: true,
        interval: 60000, // 1 minute
      },
    },

    // ServiceConfig base properties
    protocol: 'internal',
    url: 'internal://infrastructure',
    timeout: 30000,
    retries: 3,
    version: '1..0',
    dependencies: [],
    health: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
    },
  };

  const mergedConfig = { ...defaultConfig, ...config };
  return new InfrastructureServiceAdapter(mergedConfig);
}

export default InfrastructureServiceAdapter;
