/**
 * @file USL Integration Service Adapter - Lightweight facade for integration services.
 *
 * Provides a unified interface to integration-related services through delegation
 * to battle-tested packages from the @claude-zen ecosystem.
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
} from './core/interfaces';
import type { IntegrationServiceConfig } from './types';
import { ServiceEnvironment, ServicePriority, ServiceType } from './types';

// ============================================
// Service-Specific Error Classes
// ============================================
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
 * Lightweight Integration Service Adapter.
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
    this.name = config.name || 'integration-service';
    this.type = config.type || ServiceType.INTEGRATION;
    this.config = config;
    this.logger = getLogger();
  }
  // ============================================
  // Service Lifecycle Management
  // ============================================
  async initialize(config?: Partial<ServiceConfig>): Promise<void> {
    try {
      this.logger.info('Initializing ' + this.name);
      this.status = 'initializing';
      // Merge configuration
      if (config) {
        Object.assign(this.config, config);
      }
      // Initialize delegates from @claude-zen packages
      const { ServiceManager } = await import('@claude-zen/foundation');
      const { WorkflowEngine } = await import('@claude-zen/intelligence');
      const { ConnectionManager } = await import('@claude-zen/foundation');
      const { CollaborationEngine } = await import('@claude-zen/intelligence');
      const { MetricsCollector } = await import('@claude-zen/foundation');
      this.serviceManager = new ServiceManager({
        name: this.name,
        type: this.type,
        config: this.config,
      });
      this.workflowEngine = new WorkflowEngine({
        workflows: ['integration', 'architecture', 'safe-api'],
        context: { service: this.name },
      });
      this.connectionManager = new ConnectionManager({
        connections: this.config.integrationEndpoints,
        pooling: true,
        retries: 3,
      });
      this.collaborationEngine = new CollaborationEngine({
        services: ['architecture', 'safe-api', 'protocols'],
        coordination: 'mesh',
      });
      this.metricsCollector = new MetricsCollector({
        service: this.name,
        enabled: this.config.metricsEnabled,
        interval: this.config.healthCheckInterval,
      });
      this.status = 'stopped';
      this.logger.info(this.name + ' initialized successfully');
    } catch (error) {
      this.status = 'error';
      this.logger.error('Failed to initialize ' + this.name + ':', error);
      throw error;
    }
  }
  async start(): Promise<void> {
    try {
      this.logger.info('Starting ' + this.name);
      this.status = 'starting';
      // Start all delegates
      await Promise.all([
        this.serviceManager?.start?.(),
        this.workflowEngine?.start?.(),
        this.connectionManager?.start?.(),
        this.collaborationEngine?.start?.(),
        this.metricsCollector?.start?.(),
      ]);
      this.status = 'running';
      this.emit('start', { timestamp: new Date() });
      this.logger.info(this.name + ' started successfully');
    } catch (error) {
      this.status = 'error';
      this.logger.error('Failed to start ' + this.name + ':', error);
      throw error;
    }
  }
  async stop(): Promise<void> {
    try {
      this.logger.info('Stopping ' + this.name);
      this.status = 'stopping';
      // Stop all delegates
      await Promise.all([
        this.serviceManager?.stop?.(),
        this.workflowEngine?.stop?.(),
        this.connectionManager?.stop?.(),
        this.collaborationEngine?.stop?.(),
        this.metricsCollector?.stop?.(),
      ]);
      this.status = 'stopped';
      this.emit('stop', { timestamp: new Date() });
      this.logger.info(this.name + ' stopped successfully');
    } catch (error) {
      this.status = 'error';
      this.logger.error('Failed to stop ' + this.name + ':', error);
      throw error;
    }
  }
  async destroy(): Promise<void> {
    try {
      this.logger.info('Destroying ' + this.name);
      await this.stop();
      // Cleanup delegates
      await Promise.all([
        this.serviceManager?.destroy?.(),
        this.workflowEngine?.destroy?.(),
        this.connectionManager?.destroy?.(),
        this.collaborationEngine?.destroy?.(),
        this.metricsCollector?.destroy?.(),
      ]);
      this.removeAllListeners();
      this.status = 'destroyed';
      this.logger.info(this.name + ' destroyed successfully');
    } catch (error) {
      this.logger.error('Failed to destroy ' + this.name + ':', error);
      throw error;
    }
  }
  async getStatus(): Promise<ServiceStatus> {
    const metrics = await this.getMetrics();
    const health = await this.healthCheck();
    return {
      name: this.name,
      type: this.type,
      status: this.status,
      health: health ? 'healthy' : 'unhealthy',
      metrics,
      lastUpdate: new Date(),
    };
  }
  async getMetrics(): Promise<ServiceMetrics> {
    if (!this.metricsCollector) {
      return {
        requests: {
          total: 0,
          successful: 0,
          failed: 0,
          rate: 0,
        },
        responseTime: {
          average: 0,
          p5: 0,
          p95: 0,
          p99: 0,
        },
        errors: { total: 0, rate: 0, types: {} },
        resources: {
          cpu: 0,
          memory: 0,
          connections: 0,
        },
        custom: {},
      };
    }
    return await this.metricsCollector.getMetrics();
  }
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.serviceManager) return false;
      // Delegate health check to service manager
      const health = await this.serviceManager.healthCheck();
      return health.healthy;
    } catch (error) {
      this.logger.error('Health check failed for ' + this.name + ':', error);
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
      this.logger.debug('Executing operation: ' + operation);
      // Delegate to workflow engine for complex operations
      const result = await this.workflowEngine.executeWorkflow(operation, {
        params,
        options,
        context: {
          service: this.name,
          timestamp: new Date(),
        },
      });
      return {
        success: true,
        data: result as T,
        operation,
        timestamp: new Date(),
        metrics: {
          duration: 0,
          // WorkflowEngine provides this
          operations: 1,
        },
      };
    } catch (error) {
      this.logger.error('Operation ' + operation + ' failed:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
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
    await this.collaborationEngine.addService(dependency.name, dependency);
  }
  async removeDependency(serviceName: string): Promise<void> {
    await this.collaborationEngine.removeService(serviceName);
  }
  async checkDependencies(): Promise<boolean> {
    const status = await this.collaborationEngine?.getStatus();
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
      this.workflowEngine?.updateConfig?.(config),
      this.connectionManager?.updateConfig?.(config),
    ]);
    this.emit('configUpdated', config);
  }
  async validateConfig(config: ServiceConfig): Promise<boolean> {
    // Basic validation - delegates handle detailed validation
    const required = ['name', 'type', 'integrationEndpoints'];
    return required.every((field) => config[field] !== undefined);
  }
  // ============================================
  // Event Handling
  // ============================================
  private setupEventHandlers(): void {
    // Forward events from delegates
    this.serviceManager?.on?.('*', (event: ServiceEvent) => {
      this.emit(event.type, event);
    });
    this.workflowEngine?.on?.('*', (event: any) => {
      this.emit('workflow', event);
    });
    this.collaborationEngine?.on?.('*', (event: any) => {
      this.emit('collaboration', event);
    });
  }
}
// ============================================
// Factory Functions
// ============================================
/**
 * Create integration service adapter with default configuration.
 */
export function createIntegrationService(
  config: Partial<IntegrationServiceAdapterConfig> = {}
): IntegrationServiceAdapter {
  const defaultConfig: IntegrationServiceAdapterConfig = {
    name: 'integration-service',
    type: ServiceType.INTEGRATION,
    environment: ServiceEnvironment.DEVELOPMENT,
    priority: ServicePriority.HIGH,
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
    version: '1.0.0',
    dependencies: [],
    health: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
    },
  };
  const mergedConfig = {
    ...defaultConfig,
    ...config,
  };
  return new IntegrationServiceAdapter(mergedConfig);
}

export default IntegrationServiceAdapter;
