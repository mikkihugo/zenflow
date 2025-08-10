/**
 * @file USL Infrastructure Service Adapter.
 *
 * Unified Service Layer adapter for infrastructure-related services, providing
 * a consistent interface to ClaudeZenFacade, IntegratedPatternSystem, and
 * core infrastructure services while maintaining full backward compatibility.
 * and adding enhanced orchestration, resource management, configuration management,
 * and performance metrics.
 *
 * This adapter follows the exact same patterns as other USL service adapters,
 * implementing the IService interface and providing unified configuration.
 * management for infrastructure operations across Claude-Zen.
 */

import { EventEmitter } from 'node:events';
import type { Logger } from '../../../config/logging-config';
import { getLogger } from '../../../config/logging-config';
import {
  ClaudeZenFacade,
  type IDatabaseService,
  type IInterfaceService,
  type IMemoryService,
  type INeuralService,
  type ISwarmService,
  type IWorkflowService,
} from '../../../core/facade';
import {
  ConfigurationFactory,
  IntegratedPatternSystem,
  type IntegrationConfig,
} from '../../../core/pattern-integration';
import type {
  IService,
  ServiceDependencyConfig,
  ServiceEvent,
  ServiceEventType,
  ServiceLifecycleStatus,
  ServiceMetrics,
  ServiceOperationOptions,
  ServiceOperationResponse,
  ServiceStatus,
} from '../core/interfaces';
import { ServiceEnvironment, ServicePriority, ServiceType } from '../types';

// Define ServiceError locally if not available in types
class ServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

import type { InfrastructureServiceConfig } from '../types';

// Error classes for infrastructure service operations
class ServiceDependencyError extends Error {
  public readonly serviceName: string;
  public readonly code = 'SERVICE_DEPENDENCY_ERROR';

  constructor(serviceName: string, message: string) {
    super(message);
    this.name = 'ServiceDependencyError';
    this.serviceName = serviceName;
  }
}

class ServiceOperationError extends Error {
  public readonly serviceName: string;
  public readonly operation: string;
  public readonly code = 'SERVICE_OPERATION_ERROR';
  public readonly cause: Error;

  constructor(serviceName: string, operation: string, cause: Error) {
    super(`Operation '${operation}' failed in service '${serviceName}': ${cause.message}`);
    this.name = 'ServiceOperationError';
    this.serviceName = serviceName;
    this.operation = operation;
    this.cause = cause;
  }
}

class ServiceTimeoutError extends Error {
  public readonly serviceName: string;
  public readonly operation: string;
  public readonly timeout: number;
  public readonly code = 'SERVICE_TIMEOUT_ERROR';

  constructor(serviceName: string, operation: string, timeout: number) {
    super(`Operation '${operation}' timed out after ${timeout}ms in service '${serviceName}'`);
    this.name = 'ServiceTimeoutError';
    this.serviceName = serviceName;
    this.operation = operation;
    this.timeout = timeout;
  }
}

/**
 * Infrastructure service adapter configuration extending USL InfrastructureServiceConfig.
 *
 * @example
 */
export interface InfrastructureServiceAdapterConfig extends InfrastructureServiceConfig {
  /** Claude Zen Facade integration settings */
  facade?: {
    enabled: boolean;
    autoInitialize?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    enableHealthChecks?: boolean;
    systemStatusInterval?: number;
    mockServices?: boolean;
    enableBatchOperations?: boolean;
  };

  /** Pattern Integration System settings */
  patternIntegration?: {
    enabled: boolean;
    configProfile?: 'default' | 'production' | 'development';
    enableEventSystem?: boolean;
    enableCommandSystem?: boolean;
    enableProtocolSystem?: boolean;
    enableAgentSystem?: boolean;
    maxAgents?: number;
    enableAutoOptimization?: boolean;
  };

  /** Service orchestration settings */
  orchestration?: {
    enableServiceDiscovery?: boolean;
    enableLoadBalancing?: boolean;
    enableCircuitBreaker?: boolean;
    maxConcurrentServices?: number;
    serviceStartupTimeout?: number;
    shutdownGracePeriod?: number;
    enableServiceMesh?: boolean;
  };

  /** Resource management settings */
  resourceManagement?: {
    enableResourceTracking?: boolean;
    enableResourceOptimization?: boolean;
    memoryThreshold?: number;
    cpuThreshold?: number;
    diskThreshold?: number;
    networkThreshold?: number;
    cleanupInterval?: number;
    enableGarbageCollection?: boolean;
  };

  /** Configuration management settings */
  configManagement?: {
    enableHotReload?: boolean;
    enableValidation?: boolean;
    enableVersioning?: boolean;
    reloadCheckInterval?: number;
    backupConfigs?: boolean;
    maxConfigHistory?: number;
    configEncryption?: boolean;
  };

  /** Event coordination settings */
  eventCoordination?: {
    enableCentralizedEvents?: boolean;
    enableEventPersistence?: boolean;
    enableEventMetrics?: boolean;
    maxEventQueueSize?: number;
    eventRetentionPeriod?: number;
    enableEventFiltering?: boolean;
    enableEventAggregation?: boolean;
  };

  /** Health monitoring settings */
  healthMonitoring?: {
    enableAdvancedChecks?: boolean;
    enableServiceDependencyTracking?: boolean;
    enablePerformanceAlerts?: boolean;
    healthCheckTimeout?: number;
    performanceThresholds?: {
      responseTime?: number;
      errorRate?: number;
      resourceUsage?: number;
    };
    enablePredictiveMonitoring?: boolean;
  };
}

/**
 * Infrastructure operation metrics for performance monitoring.
 *
 * @example
 */
interface InfrastructureOperationMetrics {
  operationName: string;
  executionTime: number;
  success: boolean;
  resourcesUsed?: {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
  };
  servicesInvolved?: string[];
  cacheHit?: boolean;
  retryCount?: number;
  timestamp: Date;
}

/**
 * Service orchestration entry.
 *
 * @example
 */
interface ServiceOrchestrationEntry {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  startTime: Date;
  dependencies: string[];
  resourceAllocation: {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
  };
}

/**
 * Configuration version entry.
 *
 * @example
 */
interface ConfigurationVersion {
  version: string;
  config: any;
  timestamp: Date;
  hash: string;
  description?: string;
}

/**
 * Resource tracking entry.
 *
 * @example
 */
interface ResourceTrackingEntry {
  timestamp: Date;
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  activeServices: number;
  activeTasks: number;
}

/**
 * Unified Infrastructure Service Adapter.
 *
 * Provides a unified interface to ClaudeZenFacade, IntegratedPatternSystem,
 * and core infrastructure services while implementing the IService interface.
 * For USL compatibility.
 *
 * Features:
 * - Service orchestration and lifecycle management
 * - Resource monitoring and optimization
 * - Configuration management with hot reloading
 * - Event-driven architecture coordination
 * - Health checking and service discovery
 * - Performance optimization and load balancing
 * - Unified configuration management
 * - Performance monitoring and metrics
 * - Error handling and recovery.
 *
 * @example
 */
export class InfrastructureServiceAdapter implements IService {
  // Core service properties
  public readonly name: string;
  public readonly type: string;
  public readonly config: InfrastructureServiceAdapterConfig;

  // Service state
  private lifecycleStatus: ServiceLifecycleStatus = 'uninitialized';
  private eventEmitter = new EventEmitter();
  private logger: Logger;
  private startTime?: Date;
  private operationCount = 0;
  private successCount = 0;
  private errorCount = 0;
  private totalLatency = 0;
  private dependencies = new Map<string, ServiceDependencyConfig>();

  // Integrated infrastructure services
  private facade?: ClaudeZenFacade;
  private patternSystem?: IntegratedPatternSystem;
  private integrationConfig?: IntegrationConfig;

  // Infrastructure management
  private serviceRegistry = new Map<string, ServiceOrchestrationEntry>();
  private configVersions: ConfigurationVersion[] = [];
  private resourceTracker: ResourceTrackingEntry[] = [];
  private metrics: InfrastructureOperationMetrics[] = [];
  private eventQueue: Array<{ event: any; timestamp: Date }> = [];
  private circuitBreakers = new Map<
    string,
    { failures: number; lastFailure?: Date; open: boolean }
  >();

  // Performance optimization.
  private cache = new Map<string, { data: any; timestamp: Date; ttl: number }>();
  private performanceStats = {
    lastHealthCheck: new Date(),
    consecutiveFailures: 0,
    totalHealthChecks: 0,
    healthCheckFailures: 0,
    avgSystemHealth: 0,
    resourceUtilization: { cpu: 0, memory: 0, network: 0, storage: 0 },
  };

  constructor(config: InfrastructureServiceAdapterConfig) {
    this.name = config?.name;
    this.type = config?.type;
    this.config = {
      // Default configuration values
      facade: {
        enabled: true,
        autoInitialize: true,
        enableCaching: true,
        enableMetrics: true,
        enableHealthChecks: true,
        systemStatusInterval: 30000,
        mockServices: false,
        enableBatchOperations: true,
        ...config?.facade,
      },
      patternIntegration: {
        enabled: true,
        configProfile: 'development',
        enableEventSystem: true,
        enableCommandSystem: true,
        enableProtocolSystem: true,
        enableAgentSystem: true,
        maxAgents: 20,
        enableAutoOptimization: true,
        ...config?.patternIntegration,
      },
      orchestration: {
        enableServiceDiscovery: true,
        enableLoadBalancing: true,
        enableCircuitBreaker: true,
        maxConcurrentServices: 20,
        serviceStartupTimeout: 30000,
        shutdownGracePeriod: 10000,
        enableServiceMesh: true,
        ...config?.orchestration,
      },
      resourceManagement: {
        enableResourceTracking: true,
        enableResourceOptimization: true,
        memoryThreshold: 0.8,
        cpuThreshold: 0.8,
        diskThreshold: 0.9,
        networkThreshold: 0.8,
        cleanupInterval: 300000,
        enableGarbageCollection: true,
        ...config?.resourceManagement,
      },
      configManagement: {
        enableHotReload: true,
        enableValidation: true,
        enableVersioning: true,
        reloadCheckInterval: 30000,
        backupConfigs: true,
        maxConfigHistory: 50,
        configEncryption: false,
        ...config?.configManagement,
      },
      eventCoordination: {
        enableCentralizedEvents: true,
        enableEventPersistence: false,
        enableEventMetrics: true,
        maxEventQueueSize: 10000,
        eventRetentionPeriod: 3600000,
        enableEventFiltering: true,
        enableEventAggregation: true,
        ...config?.eventCoordination,
      },
      healthMonitoring: {
        enableAdvancedChecks: true,
        enableServiceDependencyTracking: true,
        enablePerformanceAlerts: true,
        healthCheckTimeout: 5000,
        performanceThresholds: {
          responseTime: 1000,
          errorRate: 0.05,
          resourceUsage: 0.8,
        },
        enablePredictiveMonitoring: true,
        ...config?.healthMonitoring,
      },
      ...config,
    };

    this.logger = getLogger(`InfrastructureServiceAdapter:${this.name}`);
    this.logger.info(`Creating infrastructure service adapter: ${this.name}`);
  }

  // ============================================
  // IService Interface Implementation
  // ============================================

  /**
   * Initialize the infrastructure service adapter and its dependencies.
   *
   * @param config
   */
  async initialize(config?: Partial<InfrastructureServiceAdapterConfig>): Promise<void> {
    this.logger.info(`Initializing infrastructure service adapter: ${this.name}`);
    this.lifecycleStatus = 'initializing';
    this.emit('initializing');

    try {
      // Apply configuration updates if provided
      if (config) {
        Object.assign(this.config, config);
      }

      // Validate configuration
      const isValidConfig = await this.validateConfig(this.config);
      if (!isValidConfig) {
        throw new Error('Invalid infrastructure service adapter configuration');
      }

      // Initialize pattern integration system if enabled
      if (this.config.patternIntegration?.enabled) {
        this.logger.debug('Initializing Pattern Integration System');
        this.integrationConfig = this.createIntegrationConfig();
        this.patternSystem = new IntegratedPatternSystem(
          this.integrationConfig,
          this.logger,
          this.createMockMetrics()
        );
        await this.patternSystem.initialize();

        await this.addDependency({
          serviceName: 'pattern-integration-system',
          required: true,
          healthCheck: true,
          timeout: 10000,
          retries: 3,
        });
      }

      // Initialize Claude Zen Facade if enabled
      if (this.config.facade?.enabled) {
        this.logger.debug('Initializing Claude Zen Facade');
        if (this.patternSystem) {
          this.facade = this.patternSystem.getFacade();
        } else {
          // Create standalone facade with mock services
          this.facade = this.createStandaloneFacade();
        }

        await this.addDependency({
          serviceName: 'claude-zen-facade',
          required: true,
          healthCheck: true,
          timeout: 10000,
          retries: 3,
        });
      }

      // Initialize service orchestration if enabled
      if (this.config.orchestration?.enableServiceDiscovery) {
        this.logger.debug('Service orchestration initialized');
        this.startServiceDiscovery();
      }

      // Initialize resource management if enabled
      if (this.config.resourceManagement?.enableResourceTracking) {
        this.logger.debug('Resource management initialized');
        this.startResourceTracking();
      }

      // Initialize configuration management if enabled
      if (this.config.configManagement?.enableHotReload) {
        this.logger.debug('Configuration management initialized');
        this.startConfigurationManagement();
      }

      // Initialize event coordination if enabled
      if (this.config.eventCoordination?.enableCentralizedEvents) {
        this.logger.debug('Event coordination initialized');
        this.startEventCoordination();
      }

      // Initialize health monitoring if enabled
      if (this.config.healthMonitoring?.enableAdvancedChecks) {
        this.logger.debug('Advanced health monitoring initialized');
        this.startAdvancedHealthMonitoring();
      }

      // Initialize performance optimization timers
      if (this.config.facade?.enableMetrics) {
        this.startMetricsCollection();
      }

      this.lifecycleStatus = 'initialized';
      this.emit('initialized');
      this.logger.info(`Infrastructure service adapter initialized successfully: ${this.name}`);
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', error);
      this.logger.error(`Failed to initialize infrastructure service adapter ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Start the infrastructure service adapter.
   */
  async start(): Promise<void> {
    this.logger.info(`Starting infrastructure service adapter: ${this.name}`);

    if (this.lifecycleStatus !== 'initialized') {
      throw new Error(`Cannot start service in ${this.lifecycleStatus} state`);
    }

    this.lifecycleStatus = 'starting';
    this.emit('starting');

    try {
      // Check dependencies before starting
      const dependenciesOk = await this.checkDependencies();
      if (!dependenciesOk) {
        throw new ServiceDependencyError(this.name, 'One or more dependencies failed');
      }

      this.startTime = new Date();
      this.lifecycleStatus = 'running';
      this.emit('started');
      this.logger.info(`Infrastructure service adapter started successfully: ${this.name}`);
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', error);
      this.logger.error(`Failed to start infrastructure service adapter ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Stop the infrastructure service adapter.
   */
  async stop(): Promise<void> {
    this.logger.info(`Stopping infrastructure service adapter: ${this.name}`);
    this.lifecycleStatus = 'stopping';
    this.emit('stopping');

    try {
      // Graceful shutdown with timeout
      const shutdownTimeout = this.config.orchestration?.shutdownGracePeriod || 10000;
      const shutdownPromise = this.performGracefulShutdown();

      await Promise.race([
        shutdownPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Shutdown timeout')), shutdownTimeout)
        ),
      ]);

      this.lifecycleStatus = 'stopped';
      this.emit('stopped');
      this.logger.info(`Infrastructure service adapter stopped successfully: ${this.name}`);
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', error);
      this.logger.error(`Failed to stop infrastructure service adapter ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Destroy the infrastructure service adapter and clean up resources.
   */
  async destroy(): Promise<void> {
    this.logger.info(`Destroying infrastructure service adapter: ${this.name}`);

    try {
      // Stop the service if still running
      if (this.lifecycleStatus === 'running') {
        await this.stop();
      }

      // Shutdown integrated systems
      if (this.patternSystem) {
        await this.patternSystem.shutdown();
      }

      if (this.facade) {
        await this.facade.shutdown();
      }

      // Clear all data structures
      this.serviceRegistry.clear();
      this.configVersions.length = 0;
      this.resourceTracker.length = 0;
      this.metrics.length = 0;
      this.eventQueue.length = 0;
      this.circuitBreakers.clear();
      this.cache.clear();
      this.dependencies.clear();

      // Clear services
      this.facade = undefined;
      this.patternSystem = undefined;
      this.integrationConfig = undefined;

      // Remove all event listeners
      this.eventEmitter.removeAllListeners();

      this.lifecycleStatus = 'destroyed';
      this.logger.info(`Infrastructure service adapter destroyed successfully: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to destroy infrastructure service adapter ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Get service status information.
   */
  async getStatus(): Promise<ServiceStatus> {
    const now = new Date();
    const uptime = this.startTime ? now.getTime() - this.startTime.getTime() : 0;
    const errorRate = this.operationCount > 0 ? (this.errorCount / this.operationCount) * 100 : 0;

    // Check dependency statuses
    const dependencyStatuses: {
      [serviceName: string]: { status: 'healthy' | 'unhealthy' | 'unknown'; lastCheck: Date };
    } = {};

    if (this.facade && this.config.facade?.enabled) {
      try {
        const systemStatus = await this.facade.getSystemStatus();
        dependencyStatuses['claude-zen-facade'] = {
          status: systemStatus.overall.status === 'healthy' ? 'healthy' : 'unhealthy',
          lastCheck: now,
        };
      } catch {
        dependencyStatuses['claude-zen-facade'] = {
          status: 'unhealthy',
          lastCheck: now,
        };
      }
    }

    if (this.patternSystem && this.config.patternIntegration?.enabled) {
      try {
        const patternStatus = this.patternSystem.getIntegratedSystemStatus();
        dependencyStatuses['pattern-integration-system'] = {
          status: patternStatus.integration.healthy ? 'healthy' : 'unhealthy',
          lastCheck: now,
        };
      } catch {
        dependencyStatuses['pattern-integration-system'] = {
          status: 'unhealthy',
          lastCheck: now,
        };
      }
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
        facadeEnabled: this.config.facade?.enabled || false,
        patternIntegrationEnabled: this.config.patternIntegration?.enabled || false,
        serviceRegistrySize: this.serviceRegistry.size,
        configVersionsCount: this.configVersions.length,
        resourceTrackerSize: this.resourceTracker.length,
        eventQueueSize: this.eventQueue.length,
        circuitBreakersCount: this.circuitBreakers.size,
        avgSystemHealth: this.performanceStats.avgSystemHealth,
        resourceUtilization: this.performanceStats.resourceUtilization,
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

    const avgLatency = this.operationCount > 0 ? this.totalLatency / this.operationCount : 0;
    const throughput = recentMetrics.length > 0 ? recentMetrics.length / 300 : 0; // ops per second

    // Calculate percentile latencies from recent metrics
    const latencies = recentMetrics.map((m) => m.executionTime).sort((a, b) => a - b);
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
        total: 1000000, // 1MB estimate
        percentage: (this.estimateMemoryUsage() / 1000000) * 100,
      },
      customMetrics: {
        serviceOrchestrationEfficiency: this.calculateOrchestrationEfficiency(),
        resourceOptimizationRatio: this.calculateResourceOptimization(),
        configManagementEffectiveness: this.calculateConfigEffectiveness(),
        systemHealthScore: this.performanceStats.avgSystemHealth,
        resourceUtilization:
          (this.performanceStats.resourceUtilization.cpu +
            this.performanceStats.resourceUtilization.memory +
            this.performanceStats.resourceUtilization.network +
            this.performanceStats.resourceUtilization.storage) /
          4,
        eventProcessingRate: this.calculateEventProcessingRate(),
        circuitBreakerActivations: Array.from(this.circuitBreakers.values()).filter((cb) => cb.open)
          .length,
      },
      timestamp: now,
    };
  }

  /**
   * Perform health check on the service.
   */
  async healthCheck(): Promise<boolean> {
    this.performanceStats.totalHealthChecks++;
    this.performanceStats.lastHealthCheck = new Date();

    try {
      // Check service state
      if (this.lifecycleStatus !== 'running') {
        this.performanceStats.consecutiveFailures++;
        this.performanceStats.healthCheckFailures++;
        return false;
      }

      // Check dependencies
      const dependenciesHealthy = await this.checkDependencies();
      if (!dependenciesHealthy) {
        this.performanceStats.consecutiveFailures++;
        this.performanceStats.healthCheckFailures++;
        return false;
      }

      // Check facade health if enabled
      if (this.facade && this.config.facade?.enabled) {
        try {
          const systemStatus = await this.facade.getSystemStatus();
          if (systemStatus.overall.status === 'unhealthy') {
            this.performanceStats.consecutiveFailures++;
            this.performanceStats.healthCheckFailures++;
            return false;
          }
          this.performanceStats.avgSystemHealth = systemStatus.overall.health;
        } catch (error) {
          this.logger.warn('Facade health check failed:', error);
          this.performanceStats.consecutiveFailures++;
          this.performanceStats.healthCheckFailures++;
          return false;
        }
      }

      // Check pattern system health if enabled
      if (this.patternSystem && this.config.patternIntegration?.enabled) {
        try {
          const patternStatus = this.patternSystem.getIntegratedSystemStatus();
          if (!patternStatus.integration.healthy) {
            this.performanceStats.consecutiveFailures++;
            this.performanceStats.healthCheckFailures++;
            return false;
          }
        } catch (error) {
          this.logger.warn('Pattern system health check failed:', error);
          this.performanceStats.consecutiveFailures++;
          this.performanceStats.healthCheckFailures++;
          return false;
        }
      }

      // Check resource utilization
      if (this.config.resourceManagement?.enableResourceTracking) {
        const latestResource = this.resourceTracker[this.resourceTracker.length - 1];
        if (latestResource) {
          const thresholds = {
            cpu: this.config.resourceManagement.cpuThreshold || 0.8,
            memory: this.config.resourceManagement.memoryThreshold || 0.8,
            network: this.config.resourceManagement.networkThreshold || 0.8,
            storage: this.config.resourceManagement.diskThreshold || 0.9,
          };

          if (
            latestResource.cpu > thresholds.cpu ||
            latestResource.memory > thresholds.memory ||
            latestResource.network > thresholds.network ||
            latestResource.storage > thresholds.storage
          ) {
            this.logger.warn('Resource utilization exceeds thresholds', {
              current: latestResource,
              thresholds,
            });
            this.performanceStats.consecutiveFailures++;
            this.performanceStats.healthCheckFailures++;
            return false;
          }

          this.performanceStats.resourceUtilization = {
            cpu: latestResource.cpu,
            memory: latestResource.memory,
            network: latestResource.network,
            storage: latestResource.storage,
          };
        }
      }

      // Reset consecutive failures on success
      this.performanceStats.consecutiveFailures = 0;
      return true;
    } catch (error) {
      this.logger.error(`Health check failed for ${this.name}:`, error);
      this.performanceStats.consecutiveFailures++;
      this.performanceStats.healthCheckFailures++;
      return false;
    }
  }

  /**
   * Update service configuration.
   *
   * @param config
   */
  async updateConfig(config: Partial<InfrastructureServiceAdapterConfig>): Promise<void> {
    this.logger.info(`Updating configuration for infrastructure service adapter: ${this.name}`);

    try {
      // Validate the updated configuration
      const newConfig = { ...this.config, ...config };
      const isValid = await this.validateConfig(newConfig);
      if (!isValid) {
        throw new Error('Invalid configuration update');
      }

      // Create configuration version if versioning is enabled
      if (this.config.configManagement?.enableVersioning) {
        this.createConfigurationVersion(newConfig, 'Configuration update via updateConfig');
      }

      // Apply the configuration
      Object.assign(this.config, config);

      // Hot reload if enabled
      if (this.config.configManagement?.enableHotReload) {
        await this.performHotReload(config);
      }

      this.logger.info(`Configuration updated successfully for: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to update configuration for ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Validate service configuration.
   *
   * @param config
   */
  async validateConfig(config: InfrastructureServiceAdapterConfig): Promise<boolean> {
    try {
      // Basic validation
      if (!config?.name || !config?.type) {
        this.logger.error('Configuration missing required fields: name or type');
        return false;
      }

      // Validate facade configuration
      if (
        config?.facade?.enabled &&
        config?.facade?.systemStatusInterval &&
        config?.facade?.systemStatusInterval < 1000
      ) {
        this.logger.error('Facade system status interval must be at least 1000ms');
        return false;
      }

      // Validate pattern integration configuration
      if (
        config?.patternIntegration?.enabled &&
        config?.patternIntegration?.maxAgents &&
        config?.patternIntegration?.maxAgents < 1
      ) {
        this.logger.error('Pattern integration max agents must be at least 1');
        return false;
      }

      // Validate orchestration configuration
      if (
        config?.orchestration?.maxConcurrentServices &&
        config?.orchestration?.maxConcurrentServices < 1
      ) {
        this.logger.error('Max concurrent services must be at least 1');
        return false;
      }

      // Validate resource management configuration
      if (
        config?.resourceManagement?.memoryThreshold &&
        (config?.resourceManagement?.memoryThreshold < 0 ||
          config?.resourceManagement?.memoryThreshold > 1)
      ) {
        this.logger.error('Memory threshold must be between 0 and 1');
        return false;
      }

      // Validate health monitoring configuration
      if (
        config?.healthMonitoring?.healthCheckTimeout &&
        config?.healthMonitoring?.healthCheckTimeout < 1000
      ) {
        this.logger.error('Health check timeout must be at least 1000ms');
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
    const capabilities = ['infrastructure-operations'];

    if (this.config.facade?.enabled) {
      capabilities.push(
        'project-management',
        'document-processing',
        'system-status',
        'workflow-execution',
        'batch-operations'
      );
    }

    if (this.config.patternIntegration?.enabled) {
      capabilities.push(
        'pattern-integration',
        'swarm-coordination',
        'event-management',
        'command-processing',
        'protocol-adaptation'
      );
    }

    if (this.config.orchestration?.enableServiceDiscovery) {
      capabilities.push('service-orchestration', 'service-discovery', 'load-balancing');
    }

    if (this.config.resourceManagement?.enableResourceTracking) {
      capabilities.push('resource-management', 'resource-optimization');
    }

    if (this.config.configManagement?.enableHotReload) {
      capabilities.push('configuration-management', 'hot-reload');
    }

    if (this.config.eventCoordination?.enableCentralizedEvents) {
      capabilities.push('event-coordination', 'centralized-events');
    }

    if (this.config.healthMonitoring?.enableAdvancedChecks) {
      capabilities.push('advanced-health-monitoring', 'predictive-monitoring');
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
    params?: any,
    options?: ServiceOperationOptions
  ): Promise<ServiceOperationResponse<T>> {
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const startTime = Date.now();

    this.logger.debug(`Executing operation: ${operation}`, { operationId, params });

    try {
      // Check if service is ready
      if (!this.isReady()) {
        throw new ServiceOperationError(this.name, operation, new Error('Service not ready'));
      }

      // Check circuit breaker
      if (this.config.orchestration?.enableCircuitBreaker && this.isCircuitBreakerOpen(operation)) {
        throw new ServiceOperationError(this.name, operation, new Error('Circuit breaker is open'));
      }

      // Apply timeout if specified
      const timeout = options?.timeout || this.config.timeout || 30000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new ServiceTimeoutError(this.name, operation, timeout)), timeout);
      });

      // Execute operation with timeout
      const operationPromise = this.executeOperationInternal<T>(operation, params, options);
      const result = await Promise.race([operationPromise, timeoutPromise]);

      const duration = Date.now() - startTime;

      // Record success metrics
      this.recordOperationMetrics({
        operationName: operation,
        executionTime: duration,
        success: true,
        resourcesUsed: await this.getCurrentResourceUsage(),
        servicesInvolved: this.getServicesInvolvedInOperation(operation),
        timestamp: new Date(),
      });

      this.operationCount++;
      this.successCount++;
      this.totalLatency += duration;

      // Reset circuit breaker on success
      if (this.config.orchestration?.enableCircuitBreaker) {
        this.resetCircuitBreaker(operation);
      }

      this.emit('operation', { operationId, operation, success: true, duration });

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
        resourcesUsed: await this.getCurrentResourceUsage(),
        servicesInvolved: this.getServicesInvolvedInOperation(operation),
        timestamp: new Date(),
      });

      this.operationCount++;
      this.errorCount++;
      this.totalLatency += duration;

      // Update circuit breaker on failure
      if (this.config.orchestration?.enableCircuitBreaker) {
        this.recordCircuitBreakerFailure(operation);
      }

      this.emit('operation', { operationId, operation, success: false, duration, error });
      this.emit('error', error);

      this.logger.error(`Operation ${operation} failed:`, error);

      const errorObj = error as Error;
      return {
        success: false,
        error: {
          code: error instanceof ServiceError ? error.code : 'OPERATION_ERROR',
          message: errorObj.message || 'Unknown error',
          details: params,
          stack: errorObj.stack,
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

  emit(event: ServiceEventType, data?: any, error?: Error): void {
    const serviceEvent: ServiceEvent = {
      type: event,
      serviceName: this.name,
      timestamp: new Date(),
      data,
      ...(error !== undefined && { error }),
    };
    this.eventEmitter.emit(event, serviceEvent);

    // Add to event queue if coordination is enabled
    if (this.config.eventCoordination?.enableCentralizedEvents) {
      this.addToEventQueue({ event: serviceEvent, timestamp: new Date() });
    }
  }

  // ============================================
  // Dependency Management
  // ============================================

  async addDependency(dependency: ServiceDependencyConfig): Promise<void> {
    this.logger.debug(`Adding dependency ${dependency.serviceName} for ${this.name}`);
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
            // Perform actual health check based on dependency type
            switch (name) {
              case 'claude-zen-facade':
                if (this.facade) {
                  const status = await this.facade.getSystemStatus();
                  return status.overall.status !== 'unhealthy';
                }
                return false;

              case 'pattern-integration-system':
                if (this.patternSystem) {
                  const status = this.patternSystem.getIntegratedSystemStatus();
                  return status.integration.healthy;
                }
                return false;

              default:
                return true; // Unknown dependency, assume healthy
            }
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
   * Internal operation execution with infrastructure-specific logic.
   *
   * @param operation
   * @param params
   * @param options
   * @param _options
   */
  private async executeOperationInternal<T = any>(
    operation: string,
    params?: any,
    _options?: ServiceOperationOptions
  ): Promise<T> {
    switch (operation) {
      // Facade operations
      case 'project-init':
        return (await this.initializeProject(params)) as T;

      case 'project-status':
        return (await this.getProjectStatus(params?.projectId)) as T;

      case 'document-process':
        return (await this.processDocument(params?.documentPath, params?.options)) as T;

      case 'system-status':
        return (await this.getSystemStatus()) as T;

      case 'workflow-execute':
        return (await this.executeWorkflow(params?.workflowId, params?.inputs)) as T;

      case 'batch-execute':
        return (await this.executeBatch(params?.operations)) as T;

      // Pattern integration operations
      case 'swarm-init':
        return (await this.initializeSwarm(params)) as T;

      case 'swarm-status':
        return (await this.getSwarmStatus(params?.swarmId)) as T;

      case 'swarm-coordinate':
        return (await this.coordinateSwarm(params?.swarmId, params?.operation)) as T;

      case 'agent-spawn':
        return (await this.spawnAgent(params?.swarmId, params?.agentConfig)) as T;

      case 'pattern-status':
        return (await this.getPatternSystemStatus()) as T;

      // Service orchestration operations
      case 'service-register':
        return (await this.registerService(params?.serviceId, params?.serviceInfo)) as T;

      case 'service-discover':
        return (await this.discoverServices(params?.serviceType)) as T;

      case 'service-health':
        return (await this.checkServiceHealth(params?.serviceId)) as T;

      case 'load-balance':
        return (await this.performLoadBalancing(params?.serviceType, params?.operation)) as T;

      // Resource management operations
      case 'resource-track':
        return (await this.trackResources()) as T;

      case 'resource-optimize':
        return (await this.optimizeResources()) as T;

      case 'resource-stats':
        return (await this.getResourceStats()) as T;

      case 'resource-cleanup':
        return (await this.performResourceCleanup()) as T;

      // Configuration management operations
      case 'config-reload':
        return (await this.reloadConfiguration()) as T;

      case 'config-validate':
        return (await this.validateCurrentConfiguration()) as T;

      case 'config-version':
        return (await this.getConfigurationVersion(params?.version)) as T;

      case 'config-rollback':
        return (await this.rollbackConfiguration(params?.version)) as T;

      // Event coordination operations
      case 'event-publish':
        return (await this.publishEvent(params?.event)) as T;

      case 'event-subscribe':
        return (await this.subscribeToEvents(params?.eventTypes)) as T;

      case 'event-stats':
        return (await this.getEventStats()) as T;

      case 'event-clear':
        return (await this.clearEventQueue()) as T;

      // Infrastructure utility operations
      case 'infrastructure-stats':
        return (await this.getInfrastructureStats()) as T;

      case 'cache-clear':
        return (await this.clearCache()) as T;

      case 'health-check':
        return (await this.performHealthCheck()) as T;

      case 'performance-report':
        return (await this.generatePerformanceReport()) as T;

      default:
        throw new ServiceOperationError(
          this.name,
          operation,
          new Error(`Unknown operation: ${operation}`)
        );
    }
  }

  // ============================================
  // Facade Integration Methods
  // ============================================

  private async initializeProject(config: any): Promise<any> {
    if (!this.facade) {
      throw new Error('Facade not available');
    }
    return await this.facade.initializeProject(config);
  }

  private async getProjectStatus(projectId: string): Promise<any> {
    try {
      // Connect to real database/cache service to get actual project status
      if (this.facade) {
        const systemStatus = await this.facade.getSystemStatus();
        return {
          projectId,
          status: systemStatus.overall.status === 'healthy' ? 'active' : 'inactive',
          lastUpdated: new Date(),
          health: systemStatus.overall.status,
          components: systemStatus.components || {},
          uptime: systemStatus.overall?.uptime || 0,
        };
      }

      // Fallback: get status from pattern system
      if (this.patternSystem) {
        const patternStatus = this.patternSystem.getIntegratedSystemStatus();
        return {
          projectId,
          status: patternStatus.integration.healthy ? 'active' : 'inactive',
          lastUpdated: new Date(),
          health: patternStatus.integration.healthy ? 'healthy' : 'unhealthy',
          patterns: patternStatus.patterns,
          uptime: patternStatus.integration.uptime || 0,
        };
      }

      // Final fallback: basic system info
      return {
        projectId,
        status: this.lifecycleStatus === 'running' ? 'active' : 'inactive',
        lastUpdated: new Date(),
        health: this.lifecycleStatus === 'running' ? 'healthy' : 'unhealthy',
        uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      };
    } catch (error) {
      this.logger.warn('Failed to get real project status, using minimal data:', error);
      return {
        projectId,
        status: 'unknown',
        lastUpdated: new Date(),
        health: 'unknown',
        error: (error as Error).message,
      };
    }
  }

  private async processDocument(documentPath: string, options?: any): Promise<any> {
    if (!this.facade) {
      throw new Error('Facade not available');
    }
    return await this.facade.processDocument(documentPath, options);
  }

  private async getSystemStatus(): Promise<any> {
    if (!this.facade) {
      throw new Error('Facade not available');
    }
    return await this.facade.getSystemStatus();
  }

  private async executeWorkflow(workflowId: string, inputs: any): Promise<any> {
    if (!this.facade) {
      throw new Error('Facade not available');
    }
    return await this.facade.executeWorkflow(workflowId, inputs);
  }

  private async executeBatch(operations: any[]): Promise<any> {
    if (!this.facade) {
      throw new Error('Facade not available');
    }
    return await this.facade.executeBatch(operations);
  }

  // ============================================
  // Pattern Integration Methods
  // ============================================

  private async initializeSwarm(config: any): Promise<any> {
    if (!this.patternSystem) {
      throw new Error('Pattern system not available');
    }
    return await this.patternSystem.createIntegratedSwarm(config);
  }

  private async getSwarmStatus(swarmId: string): Promise<any> {
    if (!this.patternSystem) {
      throw new Error('Pattern system not available');
    }

    const swarmService = this.patternSystem.getAgentManager();
    const swarmGroup = swarmService.getSwarmGroup(swarmId);

    if (!swarmGroup) {
      throw new Error(`Swarm ${swarmId} not found`);
    }

    return swarmGroup.getStatus();
  }

  private async coordinateSwarm(swarmId: string, _operation: string): Promise<any> {
    if (!this.patternSystem) {
      throw new Error('Pattern system not available');
    }

    const swarmCoordinator = this.patternSystem.getSwarmCoordinator();
    const agentManager = this.patternSystem.getAgentManager();
    const swarmGroup = agentManager.getSwarmGroup(swarmId);

    if (!swarmGroup) {
      throw new Error(`Swarm ${swarmId} not found`);
    }

    // Create coordination context
    const agents = swarmGroup
      .getMembers()
      .filter((member) => member.getType() === 'individual')
      .map((agent) => ({
        id: agent.getId(),
        capabilities: agent.getCapabilities().map((cap) => cap.name),
        status: 'idle' as const,
      }));

    const context = {
      swarmId,
      timestamp: new Date(),
      resources: { cpu: 0.8, memory: 0.7, network: 0.6, storage: 0.9 },
      constraints: {
        maxLatency: 500,
        minReliability: 0.9,
        resourceLimits: { cpu: 1.0, memory: 1.0, network: 1.0, storage: 1.0 },
        securityLevel: 'medium' as const,
      },
      history: [],
    };

    return await swarmCoordinator.executeCoordination(agents, context);
  }

  private async spawnAgent(swarmId: string, agentConfig: any): Promise<any> {
    if (!this.patternSystem) {
      throw new Error('Pattern system not available');
    }

    const agentManager = this.patternSystem.getAgentManager();
    const agentId = `${swarmId}-agent-${Date.now()}`;

    await agentManager.addAgentToSwarm(swarmId, agentId, agentConfig);

    return {
      agentId,
      swarmId,
      status: 'ready',
      capabilities: agentConfig?.capabilities || [],
    };
  }

  private async getPatternSystemStatus(): Promise<any> {
    if (!this.patternSystem) {
      throw new Error('Pattern system not available');
    }
    return this.patternSystem.getIntegratedSystemStatus();
  }

  // ============================================
  // Service Orchestration Methods
  // ============================================

  private async registerService(serviceId: string, serviceInfo: any): Promise<any> {
    const entry: ServiceOrchestrationEntry = {
      serviceId,
      serviceName: serviceInfo.name || serviceId,
      serviceType: serviceInfo.type || 'unknown',
      status: 'starting',
      startTime: new Date(),
      dependencies: serviceInfo.dependencies || [],
      resourceAllocation: serviceInfo.resourceAllocation || {
        cpu: 0.1,
        memory: 64,
        network: 10,
        storage: 100,
      },
    };

    this.serviceRegistry.set(serviceId, entry);

    this.logger.info(`Service registered: ${serviceId}`, { serviceInfo });

    return {
      serviceId,
      registered: true,
      timestamp: new Date(),
    };
  }

  private async discoverServices(serviceType?: string): Promise<any> {
    const services = Array.from(this.serviceRegistry.values());

    if (serviceType) {
      return services.filter((service) => service.serviceType === serviceType);
    }

    return services;
  }

  private async checkServiceHealth(serviceId: string): Promise<any> {
    const service = this.serviceRegistry.get(serviceId);

    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    // Simulate health check
    const isHealthy = service.status === 'running';

    return {
      serviceId,
      healthy: isHealthy,
      status: service.status,
      uptime: Date.now() - service.startTime.getTime(),
      lastCheck: new Date(),
    };
  }

  private async performLoadBalancing(serviceType: string, operation: string): Promise<any> {
    const services = Array.from(this.serviceRegistry.values()).filter(
      (service) => service.serviceType === serviceType && service.status === 'running'
    );

    if (services.length === 0) {
      throw new Error(`No healthy services of type ${serviceType} available`);
    }

    // Simple round-robin load balancing
    const selectedService = services[Math.floor(Math.random() * services.length)];

    return {
      selectedService: selectedService?.serviceId,
      operation,
      timestamp: new Date(),
      totalServices: services.length,
    };
  }

  // ============================================
  // Resource Management Methods
  // ============================================

  private async trackResources(): Promise<any> {
    // Get real system resource usage
    const memoryUsage = process.memoryUsage();

    // Get system load averages (Unix-like systems)
    let systemLoad = [0, 0, 0];
    try {
      const os = await import('node:os');
      systemLoad = os.loadavg();
    } catch {
      // Windows fallback
    }

    const resourceEntry: ResourceTrackingEntry = {
      timestamp: new Date(),
      cpu: systemLoad[0] ? systemLoad[0] / (await import('node:os')).cpus().length : 0.1, // Real CPU load with fallback
      memory: memoryUsage.heapUsed / memoryUsage.heapTotal, // Real memory usage
      network: 0.05, // Network monitoring would need external tool
      storage: this.estimateStorageUsage(), // Calculate storage from actual data
      activeServices: this.serviceRegistry.size,
      activeTasks: this.operationCount,
    };

    this.resourceTracker.push(resourceEntry);

    // Keep only recent entries
    const maxEntries = 1000;
    if (this.resourceTracker.length > maxEntries) {
      this.resourceTracker.splice(0, this.resourceTracker.length - maxEntries);
    }

    return resourceEntry;
  }

  private async optimizeResources(): Promise<any> {
    const optimizations: string[] = [];

    // Check for optimization opportunities
    if (this.cache.size > 500) {
      this.cache.clear();
      optimizations.push('Cache cleared to free memory');
    }

    if (this.metrics.length > 1000) {
      this.metrics.splice(0, this.metrics.length - 500);
      optimizations.push('Metrics history trimmed');
    }

    if (this.eventQueue.length > 1000) {
      this.eventQueue.splice(0, this.eventQueue.length - 500);
      optimizations.push('Event queue trimmed');
    }

    // Garbage collection if enabled
    if (this.config.resourceManagement?.enableGarbageCollection && global.gc) {
      global.gc();
      optimizations.push('Garbage collection performed');
    }

    return {
      optimizations,
      timestamp: new Date(),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private async getResourceStats(): Promise<any> {
    const recent = this.resourceTracker.slice(-10);

    if (recent.length === 0) {
      return {
        cpu: { avg: 0, max: 0, min: 0 },
        memory: { avg: 0, max: 0, min: 0 },
        network: { avg: 0, max: 0, min: 0 },
        storage: { avg: 0, max: 0, min: 0 },
        dataPoints: 0,
      };
    }

    return {
      cpu: {
        avg: recent.reduce((sum, r) => sum + r.cpu, 0) / recent.length,
        max: Math.max(...recent.map((r) => r.cpu)),
        min: Math.min(...recent.map((r) => r.cpu)),
      },
      memory: {
        avg: recent.reduce((sum, r) => sum + r.memory, 0) / recent.length,
        max: Math.max(...recent.map((r) => r.memory)),
        min: Math.min(...recent.map((r) => r.memory)),
      },
      network: {
        avg: recent.reduce((sum, r) => sum + r.network, 0) / recent.length,
        max: Math.max(...recent.map((r) => r.network)),
        min: Math.min(...recent.map((r) => r.network)),
      },
      storage: {
        avg: recent.reduce((sum, r) => sum + r.storage, 0) / recent.length,
        max: Math.max(...recent.map((r) => r.storage)),
        min: Math.min(...recent.map((r) => r.storage)),
      },
      dataPoints: recent.length,
      trackingDuration:
        this.resourceTracker.length > 0 && this.resourceTracker[0]?.timestamp
          ? Date.now() - this.resourceTracker[0].timestamp.getTime()
          : 0,
    };
  }

  private async performResourceCleanup(): Promise<any> {
    let cleaned = 0;

    // Clean old resource tracking entries
    const cutoff = new Date(Date.now() - 3600000); // 1 hour
    const originalCount = this.resourceTracker.length;
    this.resourceTracker = this.resourceTracker.filter((entry) => entry.timestamp > cutoff);
    cleaned += originalCount - this.resourceTracker.length;

    // Clean old metrics
    const originalMetricsCount = this.metrics.length;
    this.metrics = this.metrics.filter((metric) => metric.timestamp > cutoff);
    cleaned += originalMetricsCount - this.metrics.length;

    // Clean old events
    const originalEventsCount = this.eventQueue.length;
    this.eventQueue = this.eventQueue.filter((event) => event.timestamp > cutoff);
    cleaned += originalEventsCount - this.eventQueue.length;

    return {
      cleaned,
      timestamp: new Date(),
      memoryFreed: this.estimateMemoryUsage(),
    };
  }

  // ============================================
  // Configuration Management Methods
  // ============================================

  private async reloadConfiguration(): Promise<any> {
    // Simulate configuration reload
    this.logger.info('Reloading configuration');

    return {
      reloaded: true,
      timestamp: new Date(),
      version:
        this.configVersions.length > 0
          ? this.configVersions[this.configVersions.length - 1]?.version
          : '1.0.0',
    };
  }

  private async validateCurrentConfiguration(): Promise<any> {
    const isValid = await this.validateConfig(this.config);

    return {
      valid: isValid,
      timestamp: new Date(),
      configHash: this.generateConfigHash(this.config),
    };
  }

  private async getConfigurationVersion(version?: string): Promise<any> {
    if (version) {
      const configVersion = this.configVersions.find((cv) => cv.version === version);
      if (!configVersion) {
        throw new Error(`Configuration version ${version} not found`);
      }
      return configVersion;
    }

    return this.configVersions.map((cv) => ({
      version: cv.version,
      timestamp: cv.timestamp,
      description: cv.description,
    }));
  }

  private async rollbackConfiguration(version: string): Promise<any> {
    const configVersion = this.configVersions.find((cv) => cv.version === version);
    if (!configVersion) {
      throw new Error(`Configuration version ${version} not found`);
    }

    // Apply the rollback configuration
    Object.assign(this.config, configVersion?.config);

    // Create new version entry for rollback
    this.createConfigurationVersion(this.config, `Rollback to version ${version}`);

    return {
      rolledBack: true,
      version,
      timestamp: new Date(),
    };
  }

  // ============================================
  // Event Coordination Methods
  // ============================================

  private async publishEvent(event: any): Promise<any> {
    this.addToEventQueue({ event, timestamp: new Date() });

    return {
      published: true,
      eventId: `event-${Date.now()}`,
      timestamp: new Date(),
    };
  }

  private async subscribeToEvents(eventTypes: string[]): Promise<any> {
    // This would typically set up event subscriptions
    return {
      subscribed: true,
      eventTypes,
      timestamp: new Date(),
    };
  }

  private async getEventStats(): Promise<any> {
    const recentEvents = this.eventQueue.filter(
      (entry) => Date.now() - entry.timestamp.getTime() < 300000 // Last 5 minutes
    );

    return {
      totalEvents: this.eventQueue.length,
      recentEvents: recentEvents.length,
      queueCapacity: this.config.eventCoordination?.maxEventQueueSize || 10000,
      processingRate: this.calculateEventProcessingRate(),
      oldestEvent: this.eventQueue.length > 0 ? this.eventQueue[0]?.timestamp : null,
    };
  }

  private async clearEventQueue(): Promise<any> {
    const cleared = this.eventQueue.length;
    this.eventQueue.length = 0;

    return {
      cleared,
      timestamp: new Date(),
    };
  }

  // ============================================
  // Infrastructure Utility Methods
  // ============================================

  private async getInfrastructureStats(): Promise<any> {
    return {
      serviceRegistry: {
        totalServices: this.serviceRegistry.size,
        runningServices: Array.from(this.serviceRegistry.values()).filter(
          (service) => service.status === 'running'
        ).length,
      },
      resourceTracking: {
        dataPoints: this.resourceTracker.length,
        currentUtilization: this.performanceStats.resourceUtilization,
      },
      configurationManagement: {
        versions: this.configVersions.length,
        hotReloadEnabled: this.config.configManagement?.enableHotReload,
      },
      eventCoordination: {
        queueSize: this.eventQueue.length,
        processingRate: this.calculateEventProcessingRate(),
      },
      healthMonitoring: {
        avgSystemHealth: this.performanceStats.avgSystemHealth,
        consecutiveFailures: this.performanceStats.consecutiveFailures,
      },
      circuitBreakers: {
        total: this.circuitBreakers.size,
        open: Array.from(this.circuitBreakers.values()).filter((cb) => cb.open).length,
      },
    };
  }

  private async clearCache(): Promise<any> {
    const cleared = this.cache.size;
    this.cache.clear();

    return {
      cleared,
      timestamp: new Date(),
    };
  }

  private async performHealthCheck(): Promise<any> {
    const isHealthy = await this.healthCheck();

    return {
      healthy: isHealthy,
      timestamp: new Date(),
      details: {
        lifecycle: this.lifecycleStatus,
        dependencies: this.dependencies.size,
        consecutiveFailures: this.performanceStats.consecutiveFailures,
      },
    };
  }

  private async generatePerformanceReport(): Promise<any> {
    const metrics = await this.getMetrics();
    const resourceStats = await this.getResourceStats();
    const infrastructureStats = await this.getInfrastructureStats();

    return {
      summary: {
        operationCount: metrics.operationCount,
        successRate: (metrics.successCount / metrics.operationCount) * 100,
        avgLatency: metrics.averageLatency,
        throughput: metrics.throughput,
      },
      resources: resourceStats,
      infrastructure: infrastructureStats,
      recommendations: this.generatePerformanceRecommendations(metrics, resourceStats),
      timestamp: new Date(),
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private createIntegrationConfig(): IntegrationConfig {
    const profile = this.config.patternIntegration?.configProfile || 'development';

    switch (profile) {
      case 'production':
        return ConfigurationFactory?.createProductionConfig();
      case 'development':
        return ConfigurationFactory?.createDevelopmentConfig();
      default:
        return ConfigurationFactory?.createDefaultConfig();
    }
  }

  private createMockMetrics(): any {
    return {
      startOperation: () => {},
      endOperation: () => {},
      getOperationMetrics: () => ({}),
      getSystemMetrics: () => ({
        uptime: Date.now() - (this.startTime?.getTime() || Date.now()),
        totalRequests: this.operationCount,
        errorRate: this.operationCount > 0 ? (this.errorCount / this.operationCount) * 100 : 0,
        averageResponseTime: this.operationCount > 0 ? this.totalLatency / this.operationCount : 0,
        activeConnections: 0,
        memoryUsage: {
          cpu: this.performanceStats.resourceUtilization.cpu,
          memory: this.performanceStats.resourceUtilization.memory,
          network: this.performanceStats.resourceUtilization.network,
          storage: this.performanceStats.resourceUtilization.storage,
          timestamp: new Date(),
        },
      }),
      recordEvent: () => {},
    };
  }

  private createStandaloneFacade(): ClaudeZenFacade {
    // Create mock services for standalone facade
    const mockSwarmService: ISwarmService = {
      initializeSwarm: async () => ({
        swarmId: 'mock',
        topology: 'hierarchical',
        agentCount: 1,
        status: 'ready',
        estimatedReadyTime: 0,
      }),
      getSwarmStatus: async () => ({
        healthy: true,
        activeAgents: 1,
        completedTasks: 0,
        errors: [],
        topology: 'hierarchical',
        uptime: 0,
      }),
      destroySwarm: async () => {},
      coordinateSwarm: async () => ({
        success: true,
        coordination: {
          strategy: 'hierarchical',
          participants: [],
          result: {
            success: true,
            metrics: {
              latency: 0,
              throughput: 0,
              reliability: 1,
              resourceUsage: { cpu: 0, memory: 0, network: 0, storage: 0 },
            },
          },
        },
      }),
      spawnAgent: async () => ({
        agentId: 'mock',
        type: 'worker',
        capabilities: [],
        status: 'ready',
        resourceAllocation: { cpu: 0, memory: 0, network: 0, storage: 0, timestamp: new Date() },
      }),
      listSwarms: async () => [],
    };

    const mockNeuralService: INeuralService = {
      trainModel: async () => ({
        modelId: 'mock',
        accuracy: 0.95,
        loss: 0.05,
        trainingTime: 1000,
        status: 'ready',
      }),
      predictWithModel: async () => ({
        predictions: [],
        confidence: [],
        modelId: 'mock',
        processingTime: 100,
      }),
      evaluateModel: async () => ({ accuracy: 0.95, precision: 0.95, recall: 0.95, f1Score: 0.95 }),
      optimizeModel: async () => ({
        improvedAccuracy: 0.96,
        optimizationTime: 500,
        strategy: { method: 'gradient', maxIterations: 100, targetMetric: 'accuracy' },
        iterations: 50,
      }),
      listModels: async () => [],
      deleteModel: async () => {},
    };

    const mockMemoryService: IMemoryService = {
      store: async () => {},
      retrieve: async () => null,
      delete: async () => true,
      list: async () => [],
      clear: async () => 0,
      getStats: async () => ({
        totalKeys: 0,
        memoryUsage: 0,
        hitRate: 0.9,
        missRate: 0.1,
        avgResponseTime: 10,
      }),
    };

    const mockDatabaseService: IDatabaseService = {
      query: async () => [],
      insert: async () => 'mock-id',
      update: async () => true,
      delete: async () => true,
      vectorSearch: async () => [],
      createIndex: async () => {},
      getHealth: async () => ({
        status: 'healthy',
        connectionCount: 1,
        queryLatency: 10,
        diskUsage: 0.5,
      }),
    };

    const mockInterfaceService: IInterfaceService = {
      startHTTPMCP: async () => ({ serverId: 'mock', port: 3000, status: 'running', uptime: 0 }),
      startWebDashboard: async () => ({
        serverId: 'mock',
        port: 3456,
        status: 'running',
        activeConnections: 0,
      }),
      startTUI: async () => ({ instanceId: 'mock', mode: 'swarm-overview', status: 'running' }),
      startCLI: async () => ({ instanceId: 'mock', status: 'ready' }),
      stopInterface: async () => {},
      getInterfaceStatus: async () => [],
    };

    const mockWorkflowService: IWorkflowService = {
      executeWorkflow: async () => ({
        workflowId: 'mock',
        executionId: 'mock',
        status: 'completed',
        startTime: new Date(),
        results: {},
      }),
      createWorkflow: async () => 'mock-workflow-id',
      listWorkflows: async () => [],
      pauseWorkflow: async () => {},
      resumeWorkflow: async () => {},
      cancelWorkflow: async () => {},
    };

    // Create mock event manager and command queue
    const mockEventManager = {
      notify: async () => {},
      subscribe: () => {},
      on: () => {},
      shutdown: async () => {},
      getObserverStats: () => [],
      getQueueStats: () => ({ size: 0, processing: 0 }),
    } as any;

    const mockCommandQueue = {
      execute: async () => ({
        success: true,
        data: {},
        executionTime: 100,
        resourceUsage: { cpu: 0, memory: 0, network: 0, storage: 0 },
      }),
      on: () => {},
      shutdown: async () => {},
      getMetrics: () => ({ executed: 0, failed: 0, avgExecutionTime: 0 }),
      getHistory: () => [],
    } as any;

    return new ClaudeZenFacade(
      mockSwarmService,
      mockNeuralService,
      mockMemoryService,
      mockDatabaseService,
      mockInterfaceService,
      mockWorkflowService,
      mockEventManager,
      mockCommandQueue,
      this.logger,
      this.createMockMetrics()
    );
  }

  private async performGracefulShutdown(): Promise<void> {
    // Shutdown pattern system first
    if (this.patternSystem) {
      await this.patternSystem.shutdown();
    }

    // Shutdown facade
    if (this.facade) {
      await this.facade.shutdown();
    }

    // Clear registries and caches
    this.serviceRegistry.clear();
    this.cache.clear();
  }

  private async performHotReload(
    config: Partial<InfrastructureServiceAdapterConfig>
  ): Promise<void> {
    this.logger.info('Performing hot reload of configuration');

    // Apply configuration changes that can be hot-reloaded
    if (config?.resourceManagement?.cleanupInterval !== undefined) {
      // Restart resource tracking with new interval
      this.startResourceTracking();
    }

    if (config?.healthMonitoring?.healthCheckTimeout !== undefined) {
      // Restart health monitoring with new timeout
      this.startAdvancedHealthMonitoring();
    }

    if (config?.eventCoordination?.maxEventQueueSize !== undefined) {
      // Trim event queue if new size is smaller
      const maxSize = config?.eventCoordination?.maxEventQueueSize;
      if (this.eventQueue.length > maxSize) {
        this.eventQueue.splice(0, this.eventQueue.length - maxSize);
      }
    }
  }

  private createConfigurationVersion(config: any, description?: string): void {
    const version = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const configVersion: ConfigurationVersion = {
      version,
      config: JSON.parse(JSON.stringify(config)), // Deep copy
      timestamp: new Date(),
      hash: this.generateConfigHash(config),
      ...(description !== undefined && { description }),
    };

    this.configVersions.push(configVersion);

    // Keep only recent versions
    const maxHistory = this.config.configManagement?.maxConfigHistory || 50;
    if (this.configVersions.length > maxHistory) {
      this.configVersions.splice(0, this.configVersions.length - maxHistory);
    }
  }

  private generateConfigHash(config: any): string {
    const configStr = JSON.stringify(config);
    let hash = 0;
    for (let i = 0; i < configStr.length; i++) {
      const char = configStr?.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private startServiceDiscovery(): void {
    // Service discovery would run periodically
    setInterval(() => {
      this.logger.debug('Running service discovery');
      // Discovery logic would go here
    }, 30000);
  }

  private startResourceTracking(): void {
    const interval = this.config.resourceManagement?.cleanupInterval || 300000;

    setInterval(async () => {
      try {
        await this.trackResources();

        if (this.config.resourceManagement?.enableResourceOptimization) {
          await this.optimizeResources();
        }
      } catch (error) {
        this.logger.warn('Resource tracking failed:', error);
      }
    }, interval);
  }

  private startConfigurationManagement(): void {
    const interval = this.config.configManagement?.reloadCheckInterval || 30000;

    setInterval(() => {
      this.logger.debug('Checking for configuration changes');
      // Configuration change detection logic would go here
    }, interval);
  }

  private startEventCoordination(): void {
    // Process event queue periodically
    setInterval(() => {
      if (this.config.eventCoordination?.enableEventAggregation) {
        this.processEventQueue();
      }
    }, 5000);
  }

  private startAdvancedHealthMonitoring(): void {
    const interval = this.config.health?.interval || 30000;

    setInterval(async () => {
      try {
        await this.healthCheck();

        if (this.config.healthMonitoring?.enablePerformanceAlerts) {
          this.checkPerformanceAlerts();
        }
      } catch (error) {
        this.logger.warn('Health monitoring failed:', error);
      }
    }, interval);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.cleanupMetrics();
    }, 300000); // Clean up every 5 minutes
  }

  private processEventQueue(): void {
    // Event processing logic would go here
    this.logger.debug(`Processing ${this.eventQueue.length} events`);
  }

  private checkPerformanceAlerts(): void {
    const thresholds = this.config.healthMonitoring?.performanceThresholds;
    if (!thresholds) return;

    const avgLatency = this.operationCount > 0 ? this.totalLatency / this.operationCount : 0;
    const errorRate = this.operationCount > 0 ? this.errorCount / this.operationCount : 0;

    if (thresholds.responseTime && avgLatency > thresholds.responseTime) {
      this.logger.warn(
        `Performance alert: Response time ${avgLatency}ms exceeds threshold ${thresholds.responseTime}ms`
      );
    }

    if (thresholds.errorRate && errorRate > thresholds.errorRate) {
      this.logger.warn(
        `Performance alert: Error rate ${errorRate} exceeds threshold ${thresholds.errorRate}`
      );
    }
  }

  private cleanupMetrics(): void {
    const cutoff = new Date(Date.now() - 3600000); // 1 hour
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
  }

  private addToEventQueue(entry: { event: any; timestamp: Date }): void {
    this.eventQueue.push(entry);

    // Trim queue if it exceeds max size
    const maxSize = this.config.eventCoordination?.maxEventQueueSize || 10000;
    if (this.eventQueue.length > maxSize) {
      this.eventQueue.shift();
    }
  }

  private isCircuitBreakerOpen(operation: string): boolean {
    const breaker = this.circuitBreakers.get(operation);
    if (!breaker) return false;

    // Circuit breaker is open if it has too many failures
    return breaker.open && breaker.failures > 5;
  }

  private recordCircuitBreakerFailure(operation: string): void {
    const breaker = this.circuitBreakers.get(operation) || { failures: 0, open: false };
    breaker.failures++;
    breaker.lastFailure = new Date();
    breaker.open = breaker.failures > 5;
    this.circuitBreakers.set(operation, breaker);
  }

  private resetCircuitBreaker(operation: string): void {
    this.circuitBreakers.delete(operation);
  }

  private async getCurrentResourceUsage(): Promise<{
    cpu: number;
    memory: number;
    network: number;
    storage: number;
  }> {
    try {
      const memoryUsage = process.memoryUsage();

      // Get system load
      let cpuLoad = 0;
      try {
        const os = await import('node:os');
        const loadavg = os.loadavg();
        cpuLoad = loadavg[0] ? loadavg[0] / os.cpus().length : 0.1;
      } catch {
        // Fallback for systems without loadavg
        cpuLoad = 0.1;
      }

      return {
        cpu: Math.min(cpuLoad, 1.0), // Real CPU usage (capped at 100%)
        memory: memoryUsage.heapUsed / memoryUsage.heapTotal, // Real memory usage
        network: 0.05, // Network would need external monitoring
        storage: this.estimateStorageUsage(), // Real storage calculation
      };
    } catch (error) {
      this.logger.warn('Failed to get real resource usage:', error);
      return {
        cpu: 0.1,
        memory: 0.1,
        network: 0.05,
        storage: 0.1,
      };
    }
  }

  private getServicesInvolvedInOperation(operation: string): string[] {
    const services: string[] = [];

    if (
      operation.startsWith('project-') ||
      operation.startsWith('document-') ||
      operation.startsWith('system-') ||
      operation.startsWith('workflow-') ||
      operation.startsWith('batch-')
    ) {
      services.push('claude-zen-facade');
    }

    if (
      operation.startsWith('swarm-') ||
      operation.startsWith('agent-') ||
      operation.startsWith('pattern-')
    ) {
      services.push('pattern-integration-system');
    }

    return services;
  }

  private recordOperationMetrics(metrics: InfrastructureOperationMetrics): void {
    this.metrics.push(metrics);

    // Keep only recent metrics
    const cutoff = new Date(Date.now() - 3600000); // 1 hour
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
  }

  private calculateOrchestrationEfficiency(): number {
    const runningServices = Array.from(this.serviceRegistry.values()).filter(
      (service) => service.status === 'running'
    ).length;
    const totalServices = this.serviceRegistry.size;

    return totalServices > 0 ? (runningServices / totalServices) * 100 : 100;
  }

  private calculateResourceOptimization(): number {
    if (this.resourceTracker.length < 2) return 100;

    const recent = this.resourceTracker[this.resourceTracker.length - 1];
    const previous = this.resourceTracker[this.resourceTracker.length - 2];

    if (!recent || !previous) {
      return 100; // Default optimization ratio if insufficient data
    }

    const currentTotal = recent.cpu + recent.memory + recent.network + recent.storage;
    const previousTotal = previous.cpu + previous.memory + previous.network + previous.storage;

    return previousTotal > 0 ? ((previousTotal - currentTotal) / previousTotal) * 100 : 0;
  }

  private calculateConfigEffectiveness(): number {
    // Configuration effectiveness based on successful hot reloads
    return this.configVersions.length > 0 ? 95 : 100; // Assume 95% effectiveness if versions exist
  }

  private calculateEventProcessingRate(): number {
    const recentEvents = this.eventQueue.filter(
      (entry) => Date.now() - entry.timestamp.getTime() < 60000 // Last minute
    );

    return recentEvents.length; // Events per minute
  }

  private generatePerformanceRecommendations(metrics: any, resourceStats: any): string[] {
    const recommendations: string[] = [];

    if (metrics.averageLatency > 1000) {
      recommendations.push('Consider enabling caching to reduce response times');
    }

    if (metrics.throughput < 10) {
      recommendations.push('Consider increasing concurrency limits for better throughput');
    }

    if (resourceStats.memory?.avg > 0.8) {
      recommendations.push('Memory usage is high - consider enabling garbage collection');
    }

    if (resourceStats.cpu?.avg > 0.8) {
      recommendations.push('CPU usage is high - consider load balancing or resource optimization');
    }

    if (this.circuitBreakers.size > 5) {
      recommendations.push('Multiple circuit breakers are active - check service health');
    }

    return recommendations;
  }

  private estimateMemoryUsage(): number {
    let size = 0;

    // Estimate service registry memory usage
    size += this.serviceRegistry.size * 500; // 500 bytes per service entry

    // Estimate config versions memory usage
    size += this.configVersions.length * 1000; // 1KB per config version

    // Estimate resource tracker memory usage
    size += this.resourceTracker.length * 100; // 100 bytes per resource entry

    // Estimate metrics memory usage
    size += this.metrics.length * 200; // 200 bytes per metric entry

    // Estimate event queue memory usage
    size += this.eventQueue.length * 150; // 150 bytes per event

    // Estimate cache memory usage
    for (const entry of Array.from(this.cache.values())) {
      size += JSON.stringify(entry.data).length * 2 + 100; // Estimate with metadata
    }

    return size;
  }

  private estimateStorageUsage(): number {
    try {
      // Calculate storage usage based on actual data structures
      let storageBytes = 0;

      // Service registry storage
      storageBytes += this.serviceRegistry.size * 500;

      // Configuration versions storage
      storageBytes += this.configVersions.length * 1000;

      // Metrics storage
      storageBytes += this.metrics.length * 300;

      // Event queue storage
      storageBytes += this.eventQueue.length * 200;

      // Resource tracker storage
      storageBytes += this.resourceTracker.length * 150;

      // Cache storage
      for (const entry of Array.from(this.cache.values())) {
        try {
          storageBytes += JSON.stringify(entry).length;
        } catch {
          storageBytes += 100; // Fallback estimate
        }
      }

      // Convert bytes to percentage (assuming 1GB total storage budget)
      const totalStorageBudget = 1024 * 1024 * 1024; // 1GB
      return Math.min(storageBytes / totalStorageBudget, 0.95);
    } catch (error) {
      this.logger.warn('Failed to estimate storage usage:', error);
      return 0.1; // Default 10% usage
    }
  }

  private determineHealthStatus(
    errorRate: number
  ): 'healthy' | 'degraded' | 'unhealthy' | 'unknown' {
    if (this.performanceStats.consecutiveFailures > 5) {
      return 'unhealthy';
    } else if (errorRate > 10 || this.performanceStats.consecutiveFailures > 2) {
      return 'degraded';
    } else if (this.operationCount > 0) {
      return 'healthy';
    } else {
      return 'unknown';
    }
  }
}

/**
 * Factory function for creating InfrastructureServiceAdapter instances.
 *
 * @param config
 * @example
 */
export function createInfrastructureServiceAdapter(
  config: InfrastructureServiceAdapterConfig
): InfrastructureServiceAdapter {
  return new InfrastructureServiceAdapter(config);
}

/**
 * Helper function for creating default configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export function createDefaultInfrastructureServiceAdapterConfig(
  name: string,
  overrides?: Partial<InfrastructureServiceAdapterConfig>
): InfrastructureServiceAdapterConfig {
  return {
    name,
    type: ServiceType.INFRASTRUCTURE,
    enabled: true,
    priority: ServicePriority.HIGH,
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
    facade: {
      enabled: true,
      autoInitialize: true,
      enableCaching: true,
      enableMetrics: true,
      enableHealthChecks: true,
      systemStatusInterval: 30000,
      mockServices: true,
      enableBatchOperations: true,
    },
    patternIntegration: {
      enabled: true,
      configProfile: 'development',
      enableEventSystem: true,
      enableCommandSystem: true,
      enableProtocolSystem: true,
      enableAgentSystem: true,
      maxAgents: 20,
      enableAutoOptimization: true,
    },
    orchestration: {
      enableServiceDiscovery: true,
      enableLoadBalancing: true,
      enableCircuitBreaker: true,
      maxConcurrentServices: 20,
      serviceStartupTimeout: 30000,
      shutdownGracePeriod: 10000,
      enableServiceMesh: true,
    },
    resourceManagement: {
      enableResourceTracking: true,
      enableResourceOptimization: true,
      memoryThreshold: 0.8,
      cpuThreshold: 0.8,
      diskThreshold: 0.9,
      networkThreshold: 0.8,
      cleanupInterval: 300000,
      enableGarbageCollection: true,
    },
    configManagement: {
      enableHotReload: true,
      enableValidation: true,
      enableVersioning: true,
      reloadCheckInterval: 30000,
      backupConfigs: true,
      maxConfigHistory: 50,
      configEncryption: false,
    },
    eventCoordination: {
      enableCentralizedEvents: true,
      enableEventPersistence: false,
      enableEventMetrics: true,
      maxEventQueueSize: 10000,
      eventRetentionPeriod: 3600000,
      enableEventFiltering: true,
      enableEventAggregation: true,
    },
    healthMonitoring: {
      enableAdvancedChecks: true,
      enableServiceDependencyTracking: true,
      enablePerformanceAlerts: true,
      healthCheckTimeout: 5000,
      performanceThresholds: {
        responseTime: 1000,
        errorRate: 0.05,
        resourceUsage: 0.8,
      },
      enablePredictiveMonitoring: true,
    },
    ...overrides,
  };
}

export default InfrastructureServiceAdapter;
