/**
 * @file USL Infrastructure Service Adapter - Lightweight facade for infrastructure services0.
 *
 * Provides unified interface to infrastructure-related services through delegation
 * to battle-tested packages from the @claude-zen ecosystem0.
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
} from '0.0./core/interfaces';
import { ServiceEnvironment, ServicePriority, ServiceType } from '0.0./types';

// ============================================
// Service Error Classes
// ============================================

class ServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this0.name = 'ServiceError';
    this0.code = code;
  }
}

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
 * Lightweight Infrastructure Service Adapter0.
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

    this0.name = config0.name || 'infrastructure-service';
    this0.type = config0.type || ServiceType0.INFRASTRUCTURE;
    this0.config = config;
    this0.logger = getLogger();
  }

  // ============================================
  // Service Lifecycle Management
  // ============================================

  async initialize(config?: Partial<ServiceConfig>): Promise<void> {
    if (this0.initialized) return;

    try {
      this0.logger0.info(`Initializing ${this0.name}`);
      this0.status = 'initializing';

      // Merge configuration
      if (config) {
        Object0.assign(this0.config, config);
      }

      // Initialize delegates from @claude-zen packages
      const { ServiceManager, MetricsCollector } = await import(
        '@claude-zen/foundation'
      );
      const { DatabaseManager } = await import('@claude-zen/foundation');
      const { WorkflowOrchestrator } = await import('@claude-zen/intelligence');
      const { ResourceOptimizer } = await import('@claude-zen/intelligence');

      this0.serviceManager = new ServiceManager({
        name: this0.name,
        type: this0.type,
        config: this0.config,
        services: ['database', 'memory', 'neural', 'swarm', 'workflow'],
      });

      this0.databaseManager = new DatabaseManager({
        connections: this0.config0.infrastructure0.database0.connections,
        pooling: this0.config0.infrastructure0.database0.pooling,
        enabled: this0.config0.infrastructure0.database0.enabled,
      });

      this0.workflowOrchestrator = new WorkflowOrchestrator({
        workflows: ['infrastructure', 'deployment', 'scaling', 'maintenance'],
        maxConcurrent: this0.config0.infrastructure0.workflow0.maxConcurrent,
        timeout: this0.config0.infrastructure0.workflow0.timeout,
      });

      this0.metricsCollector = new MetricsCollector({
        service: this0.name,
        enabled: this0.config0.performance0.monitoring,
        metrics: ['cpu', 'memory', 'connections', 'throughput'],
      });

      this0.resourceOptimizer = new ResourceOptimizer({
        enabled: this0.config0.performance0.optimization,
        loadBalancing: this0.config0.performance0.loadBalancing,
        resources: this0.config0.resources,
      });

      this0.status = 'stopped';
      this0.initialized = true;
      this0.logger0.info(`${this0.name} initialized successfully`);
    } catch (error) {
      this0.status = 'error';
      this0.logger0.error(`Failed to initialize ${this0.name}:`, error);
      throw error;
    }
  }

  async start(): Promise<void> {
    await this?0.initialize;

    try {
      this0.logger0.info(`Starting ${this0.name}`);
      this0.status = 'starting';

      // Start all delegates in parallel
      await Promise0.all([
        this0.serviceManager?0.start,
        this0.databaseManager?0.start,
        this0.workflowOrchestrator?0.start,
        this0.metricsCollector?0.start,
        this0.resourceOptimizer?0.start,
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

      // Stop all delegates in parallel
      await Promise0.all([
        this0.serviceManager?0.stop,
        this0.databaseManager?0.stop,
        this0.workflowOrchestrator?0.stop,
        this0.metricsCollector?0.stop,
        this0.resourceOptimizer?0.stop,
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
        this0.databaseManager?0.destroy?0.(),
        this0.workflowOrchestrator?0.destroy?0.(),
        this0.metricsCollector?0.destroy?0.(),
        this0.resourceOptimizer?0.destroy?0.(),
      ]);

      this?0.removeAllListeners;
      this0.status = 'destroyed';
      this0.initialized = false;
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
  // Infrastructure Operations
  // ============================================

  async execute<T = any>(
    operation: string,
    params?: any,
    options?: ServiceOperationOptions
  ): Promise<ServiceOperationResponse<T>> {
    try {
      this0.logger0.debug(`Executing infrastructure operation: ${operation}`);

      // Delegate to workflow orchestrator for complex operations
      const result = await this0.workflowOrchestrator0.executeWorkflow(
        operation,
        {
          params,
          options,
          context: {
            service: this0.name,
            infrastructure: this0.config0.infrastructure,
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
      this0.logger0.error(`Infrastructure operation ${operation} failed:`, error);

      return {
        success: false,
        error: {
          message: error instanceof Error ? error0.message : 'Unknown error',
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
    await this0.serviceManager0.addDependency(dependency0.name, dependency);
  }

  async removeDependency(serviceName: string): Promise<void> {
    await this0.serviceManager0.removeDependency(serviceName);
  }

  async checkDependencies(): Promise<boolean> {
    const status = await this0.serviceManager?0.getDependencyStatus;
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
      this0.databaseManager?0.updateConfig?0.(config),
      this0.workflowOrchestrator?0.updateConfig?0.(config),
      this0.resourceOptimizer?0.updateConfig?0.(config),
    ]);

    this0.emit('configUpdated', config);
  }

  async validateConfig(config: ServiceConfig): Promise<boolean> {
    // Basic validation - delegates handle detailed validation
    const required = ['name', 'type', 'infrastructure'];
    return required0.every((field) => config[field] !== undefined);
  }

  // ============================================
  // Infrastructure-Specific Operations
  // ============================================

  /**
   * Optimize infrastructure resources0.
   */
  async optimizeResources(): Promise<{ optimized: boolean; metrics: any }> {
    if (!this0.resourceOptimizer) {
      throw new ServiceOperationError(
        'optimize-resources',
        'Resource optimizer not available'
      );
    }

    return await this0.resourceOptimizer0.optimize({
      target: 'infrastructure',
      metrics: await this?0.getMetrics,
      constraints: this0.config0.resources,
    });
  }

  /**
   * Scale infrastructure components0.
   */
  async scale(
    component: string,
    instances: number
  ): Promise<{ scaled: boolean; instances: number }> {
    const result = await this0.execute('scale-component', {
      component,
      instances,
      config:
        this0.config0.infrastructure[
          component as keyof typeof this0.config0.infrastructure
        ],
    });

    return {
      scaled: result0.success,
      instances: result0.data?0.instances || instances,
    };
  }

  /**
   * Perform maintenance operations0.
   */
  async performMaintenance(
    type: string
  ): Promise<{ completed: boolean; results: any }> {
    const result = await this0.execute('maintenance', {
      type,
      infrastructure: this0.config0.infrastructure,
    });

    return {
      completed: result0.success,
      results: result0.data,
    };
  }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create infrastructure service adapter with default configuration0.
 */
export function createInfrastructureService(
  config: Partial<InfrastructureServiceAdapterConfig> = {}
): InfrastructureServiceAdapter {
  const defaultConfig: InfrastructureServiceAdapterConfig = {
    name: 'infrastructure-service',
    type: ServiceType0.INFRASTRUCTURE,
    environment: ServiceEnvironment0.DEVELOPMENT,
    priority: ServicePriority0.HIGH,

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
        models: ['decision-support', 'optimization'],
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
    version: '10.0.0',
    dependencies: [],
    health: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
    },
  };

  const mergedConfig = { 0.0.0.defaultConfig, 0.0.0.config };
  return new InfrastructureServiceAdapter(mergedConfig);
}

export default InfrastructureServiceAdapter;
