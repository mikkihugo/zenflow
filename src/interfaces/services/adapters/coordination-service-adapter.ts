/**
 * USL Coordination Service Adapter
 *
 * Unified Service Layer adapter for coordination-related services, providing
 * a consistent interface to DaaService, SessionRecoveryService, and SwarmCoordinator
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * caching, retry logic, and performance metrics.
 *
 * This adapter follows the exact same patterns as the UACL client adapters,
 * implementing the IService interface and providing unified configuration
 * management for coordination operations across Claude-Zen.
 */

import { EventEmitter } from 'node:events';
import { DaaService } from '../../../coordination/swarm/core/daa-service';
import { SessionEnabledSwarm } from '../../../coordination/swarm/core/session-integration';
import type { SessionConfig, SessionState } from '../../../coordination/swarm/core/session-manager';
import type { SwarmAgent, SwarmMetrics } from '../../../coordination/swarm/core/swarm-coordinator';
import { SwarmCoordinator } from '../../../coordination/swarm/core/swarm-coordinator';
import type { SwarmOptions } from '../../../coordination/swarm/core/types';
import type { AgentType } from '../../../types/agent-types';
import type { SwarmTopology } from '../../../types/shared-types';
import { createLogger, type Logger } from '../../../utils/logger';
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
import type { CoordinationServiceConfig } from '../types';

/**
 * Coordination service adapter configuration extending USL CoordinationServiceConfig
 *
 * @example
 */
export interface CoordinationServiceAdapterConfig extends CoordinationServiceConfig {
  /** DaaService integration settings */
  daaService?: {
    enabled: boolean;
    autoInitialize?: boolean;
    enableLearning?: boolean;
    enableCognitive?: boolean;
    enableMetaLearning?: boolean;
  };

  /** SessionRecoveryService integration settings */
  sessionService?: {
    enabled: boolean;
    autoRecovery?: boolean;
    healthCheckInterval?: number;
    maxSessions?: number;
    checkpointInterval?: number;
  };

  /** SwarmCoordinator integration settings */
  swarmCoordinator?: {
    enabled: boolean;
    defaultTopology?: SwarmTopology;
    maxAgents?: number;
    coordinationTimeout?: number;
    performanceThreshold?: number;
  };

  /** Performance optimization settings */
  performance?: {
    enableRequestDeduplication?: boolean;
    maxConcurrency?: number;
    requestTimeout?: number;
    enableMetricsCollection?: boolean;
    agentPooling?: boolean;
    sessionCaching?: boolean;
  };

  /** Retry configuration for failed operations */
  retry?: {
    enabled: boolean;
    maxAttempts: number;
    backoffMultiplier: number;
    retryableOperations: string[];
  };

  /** Cache configuration for coordination operations */
  cache?: {
    enabled: boolean;
    strategy: 'memory' | 'redis' | 'hybrid';
    defaultTTL: number;
    maxSize: number;
    keyPrefix: string;
  };

  /** Agent lifecycle management settings */
  agentManagement?: {
    autoSpawn?: boolean;
    maxLifetime?: number;
    healthCheckInterval?: number;
    performanceTracking?: boolean;
  };

  /** Learning and adaptation settings */
  learning?: {
    enableContinuousLearning?: boolean;
    knowledgeSharing?: boolean;
    patternAnalysis?: boolean;
    metaLearningInterval?: number;
  };
}

/**
 * Coordination operation metrics for performance monitoring
 *
 * @example
 */
interface CoordinationOperationMetrics {
  operationName: string;
  executionTime: number;
  success: boolean;
  agentCount?: number;
  sessionId?: string;
  coordinationLatency?: number;
  cacheHit?: boolean;
  retryCount?: number;
  timestamp: Date;
}

/**
 * Agent performance tracking
 *
 * @example
 */
interface AgentPerformanceMetrics {
  agentId: string;
  type: AgentType;
  tasksCompleted: number;
  averageResponseTime: number;
  errorRate: number;
  learningProgress: number;
  lastActivity: Date;
}

/**
 * Session performance tracking
 *
 * @example
 */
interface SessionPerformanceMetrics {
  sessionId: string;
  uptime: number;
  operationsCount: number;
  checkpointsCreated: number;
  recoveryAttempts: number;
  lastAccessed: Date;
}

/**
 * Cache entry structure for coordination caching
 *
 * @example
 */
interface CacheEntry<T = any> {
  data: T;
  timestamp: Date;
  ttl: number;
  accessed: Date;
  accessCount: number;
}

/**
 * Request deduplication entry
 *
 * @example
 */
interface PendingRequest<T = any> {
  promise: Promise<T>;
  timestamp: Date;
  requestCount: number;
}

/**
 * Unified Coordination Service Adapter
 *
 * Provides a unified interface to DaaService, SessionRecoveryService, and SwarmCoordinator
 * while implementing the IService interface for USL compatibility.
 *
 * Features:
 * - Unified configuration management
 * - Performance monitoring and metrics
 * - Request caching and deduplication
 * - Retry logic with backoff
 * - Health monitoring
 * - Event forwarding
 * - Error handling and recovery
 * - Agent lifecycle management
 * - Session state management
 * - Learning and adaptation tracking
 *
 * @example
 */
export class CoordinationServiceAdapter implements IService {
  // Core service properties
  public readonly name: string;
  public readonly type: string;
  public readonly config: CoordinationServiceAdapterConfig;

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

  // Integrated services
  private daaService?: DaaService;
  private sessionEnabledSwarm?: SessionEnabledSwarm;
  private swarmCoordinator?: SwarmCoordinator;

  // Performance optimization
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, PendingRequest>();
  private metrics: CoordinationOperationMetrics[] = [];
  private agentMetrics = new Map<string, AgentPerformanceMetrics>();
  private sessionMetrics = new Map<string, SessionPerformanceMetrics>();
  private healthStats = {
    lastHealthCheck: new Date(),
    consecutiveFailures: 0,
    totalHealthChecks: 0,
    healthCheckFailures: 0,
  };

  constructor(config: CoordinationServiceAdapterConfig) {
    this.name = config.name;
    this.type = config.type;
    this.config = {
      // Default configuration values
      daaService: {
        enabled: true,
        autoInitialize: true,
        enableLearning: true,
        enableCognitive: true,
        enableMetaLearning: true,
        ...config.daaService,
      },
      sessionService: {
        enabled: true,
        autoRecovery: true,
        healthCheckInterval: 30000, // 30 seconds
        maxSessions: 100,
        checkpointInterval: 300000, // 5 minutes
        ...config.sessionService,
      },
      swarmCoordinator: {
        enabled: true,
        defaultTopology: 'mesh',
        maxAgents: 50,
        coordinationTimeout: 10000,
        performanceThreshold: 0.8,
        ...config.swarmCoordinator,
      },
      performance: {
        enableRequestDeduplication: true,
        maxConcurrency: 20,
        requestTimeout: 30000,
        enableMetricsCollection: true,
        agentPooling: true,
        sessionCaching: true,
        ...config.performance,
      },
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 2,
        retryableOperations: [
          'agent-create',
          'agent-adapt',
          'workflow-execute',
          'session-create',
          'session-save',
          'session-restore',
          'swarm-coordinate',
          'swarm-assign-task',
          'knowledge-share',
        ],
        ...config.retry,
      },
      cache: {
        enabled: true,
        strategy: 'memory',
        defaultTTL: 600000, // 10 minutes
        maxSize: 500,
        keyPrefix: 'coord-adapter:',
        ...config.cache,
      },
      agentManagement: {
        autoSpawn: false,
        maxLifetime: 3600000, // 1 hour
        healthCheckInterval: 60000, // 1 minute
        performanceTracking: true,
        ...config.agentManagement,
      },
      learning: {
        enableContinuousLearning: true,
        knowledgeSharing: true,
        patternAnalysis: true,
        metaLearningInterval: 1800000, // 30 minutes
        ...config.learning,
      },
      ...config,
    };

    this.logger = createLogger(`CoordinationServiceAdapter:${this.name}`);
    this.logger.info(`Creating coordination service adapter: ${this.name}`);
  }

  // ============================================
  // IService Interface Implementation
  // ============================================

  /**
   * Initialize the coordination service adapter and its dependencies
   *
   * @param config
   */
  async initialize(config?: Partial<CoordinationServiceAdapterConfig>): Promise<void> {
    this.logger.info(`Initializing coordination service adapter: ${this.name}`);
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
        throw new Error('Invalid coordination service adapter configuration');
      }

      // Initialize DaaService if enabled
      if (this.config.daaService?.enabled) {
        this.logger.debug('Initializing DaaService integration');
        this.daaService = new DaaService();

        if (this.config.daaService.autoInitialize) {
          await this.daaService.initialize();
        }

        await this.addDependency({
          serviceName: 'daa-service',
          required: true,
          healthCheck: true,
          timeout: 5000,
          retries: 2,
        });
      }

      // Initialize SessionEnabledSwarm if enabled
      if (this.config.sessionService?.enabled) {
        this.logger.debug('Initializing SessionEnabledSwarm integration');
        const swarmOptions: SwarmOptions = {
          topology: this.config.swarmCoordinator?.defaultTopology || 'mesh',
          maxAgents: this.config.swarmCoordinator?.maxAgents || 50,
        };

        const sessionConfig: SessionConfig = {
          autoSave: true,
          checkpointInterval: this.config.sessionService.checkpointInterval || 300000,
          maxSessions: this.config.sessionService.maxSessions || 100,
        };

        this.sessionEnabledSwarm = new SessionEnabledSwarm(swarmOptions, sessionConfig);
        await this.sessionEnabledSwarm.init();

        // Initialize session recovery service
        if (this.config.sessionService.autoRecovery) {
          // Note: SessionRecoveryService needs a SessionManager instance
          // This would be properly initialized in a real implementation
          this.logger.debug('Session recovery service would be initialized here');
        }

        await this.addDependency({
          serviceName: 'session-enabled-swarm',
          required: true,
          healthCheck: true,
          timeout: 10000,
          retries: 3,
        });
      }

      // Initialize SwarmCoordinator if enabled
      if (this.config.swarmCoordinator?.enabled) {
        this.logger.debug('Initializing SwarmCoordinator integration');
        this.swarmCoordinator = new SwarmCoordinator();
        await this.swarmCoordinator.initialize({
          maxAgents: this.config.swarmCoordinator.maxAgents,
          topology: this.config.swarmCoordinator.defaultTopology,
          timeout: this.config.swarmCoordinator.coordinationTimeout,
        });

        await this.addDependency({
          serviceName: 'swarm-coordinator',
          required: true,
          healthCheck: true,
          timeout: 5000,
          retries: 2,
        });
      }

      // Initialize cache if enabled
      if (this.config.cache?.enabled) {
        this.logger.debug('Cache system initialized');
        this.startCacheCleanupTimer();
      }

      // Initialize metrics collection if enabled
      if (this.config.performance?.enableMetricsCollection) {
        this.logger.debug('Metrics collection initialized');
        this.startMetricsCleanupTimer();
      }

      // Start agent management if enabled
      if (this.config.agentManagement?.performanceTracking) {
        this.logger.debug('Agent performance tracking initialized');
        this.startAgentMetricsTimer();
      }

      // Start learning system if enabled
      if (this.config.learning?.enableContinuousLearning) {
        this.logger.debug('Continuous learning system initialized');
        this.startLearningTimer();
      }

      this.lifecycleStatus = 'initialized';
      this.emit('initialized');
      this.logger.info(`Coordination service adapter initialized successfully: ${this.name}`);
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', error);
      this.logger.error(`Failed to initialize coordination service adapter ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Start the coordination service adapter
   */
  async start(): Promise<void> {
    this.logger.info(`Starting coordination service adapter: ${this.name}`);

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
      this.logger.info(`Coordination service adapter started successfully: ${this.name}`);
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', error);
      this.logger.error(`Failed to start coordination service adapter ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Stop the coordination service adapter
   */
  async stop(): Promise<void> {
    this.logger.info(`Stopping coordination service adapter: ${this.name}`);
    this.lifecycleStatus = 'stopping';
    this.emit('stopping');

    try {
      // Clear any pending requests
      this.pendingRequests.clear();

      // Stop swarm coordinator if running
      if (this.swarmCoordinator) {
        await this.swarmCoordinator.shutdown();
      }

      // Stop session-enabled swarm if running
      if (this.sessionEnabledSwarm) {
        await this.sessionEnabledSwarm.destroy();
      }

      // Clear cache if needed
      if (this.config.cache?.enabled) {
        this.cache.clear();
      }

      this.lifecycleStatus = 'stopped';
      this.emit('stopped');
      this.logger.info(`Coordination service adapter stopped successfully: ${this.name}`);
    } catch (error) {
      this.lifecycleStatus = 'error';
      this.emit('error', error);
      this.logger.error(`Failed to stop coordination service adapter ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Destroy the coordination service adapter and clean up resources
   */
  async destroy(): Promise<void> {
    this.logger.info(`Destroying coordination service adapter: ${this.name}`);

    try {
      // Stop the service if still running
      if (this.lifecycleStatus === 'running') {
        await this.stop();
      }

      // Clear all data structures
      this.cache.clear();
      this.pendingRequests.clear();
      this.metrics.length = 0;
      this.agentMetrics.clear();
      this.sessionMetrics.clear();
      this.dependencies.clear();

      // Clear services
      this.daaService = undefined;
      this.sessionEnabledSwarm = undefined;
      this.sessionRecoveryService = undefined;
      this.swarmCoordinator = undefined;

      // Remove all event listeners
      this.eventEmitter.removeAllListeners();

      this.lifecycleStatus = 'destroyed';
      this.logger.info(`Coordination service adapter destroyed successfully: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to destroy coordination service adapter ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Get service status information
   */
  async getStatus(): Promise<ServiceStatus> {
    const now = new Date();
    const uptime = this.startTime ? now.getTime() - this.startTime.getTime() : 0;
    const errorRate = this.operationCount > 0 ? (this.errorCount / this.operationCount) * 100 : 0;

    // Check dependency statuses
    const dependencyStatuses: {
      [serviceName: string]: { status: 'healthy' | 'unhealthy' | 'unknown'; lastCheck: Date };
    } = {};

    if (this.daaService && this.config.daaService?.enabled) {
      dependencyStatuses['daa-service'] = {
        status: this.daaService.isInitialized() ? 'healthy' : 'unhealthy',
        lastCheck: now,
      };
    }

    if (this.swarmCoordinator && this.config.swarmCoordinator?.enabled) {
      dependencyStatuses['swarm-coordinator'] = {
        status: this.swarmCoordinator.getState() === 'active' ? 'healthy' : 'unhealthy',
        lastCheck: now,
      };
    }

    if (this.sessionEnabledSwarm && this.config.sessionService?.enabled) {
      dependencyStatuses['session-enabled-swarm'] = {
        status: this.sessionEnabledSwarm.isReady() ? 'healthy' : 'unhealthy',
        lastCheck: now,
      };
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
        cacheSize: this.cache.size,
        pendingRequests: this.pendingRequests.size,
        activeAgents: this.agentMetrics.size,
        activeSessions: this.sessionMetrics.size,
        daaServiceEnabled: this.config.daaService?.enabled || false,
        sessionServiceEnabled: this.config.sessionService?.enabled || false,
        swarmCoordinatorEnabled: this.config.swarmCoordinator?.enabled || false,
      },
    };
  }

  /**
   * Get service performance metrics
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

    // Calculate coordination-specific metrics
    const coordinationMetrics = recentMetrics.filter((m) => m.coordinationLatency !== undefined);
    const avgCoordinationLatency =
      coordinationMetrics.length > 0
        ? coordinationMetrics.reduce((sum, m) => sum + (m.coordinationLatency || 0), 0) /
          coordinationMetrics.length
        : 0;

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
        total: this.config.cache?.maxSize || 500,
        percentage: (this.cache.size / (this.config.cache?.maxSize || 500)) * 100,
      },
      customMetrics: {
        cacheHitRate: this.calculateCacheHitRate(),
        pendingRequestsCount: this.pendingRequests.size,
        avgRequestDeduplicationRate: this.calculateDeduplicationRate(),
        activeAgentsCount: this.agentMetrics.size,
        activeSessionsCount: this.sessionMetrics.size,
        avgCoordinationLatency,
        learningOperationsRate: this.calculateLearningOperationsRate(),
      },
      timestamp: now,
    };
  }

  /**
   * Perform health check on the service
   */
  async healthCheck(): Promise<boolean> {
    this.healthStats.totalHealthChecks++;
    this.healthStats.lastHealthCheck = new Date();

    try {
      // Check service state
      if (this.lifecycleStatus !== 'running') {
        this.healthStats.consecutiveFailures++;
        this.healthStats.healthCheckFailures++;
        return false;
      }

      // Check dependencies
      const dependenciesHealthy = await this.checkDependencies();
      if (!dependenciesHealthy) {
        this.healthStats.consecutiveFailures++;
        this.healthStats.healthCheckFailures++;
        return false;
      }

      // Check DaaService if enabled
      if (this.daaService && this.config.daaService?.enabled) {
        if (!this.daaService.isInitialized()) {
          this.healthStats.consecutiveFailures++;
          this.healthStats.healthCheckFailures++;
          return false;
        }
      }

      // Check SwarmCoordinator if enabled
      if (this.swarmCoordinator && this.config.swarmCoordinator?.enabled) {
        if (this.swarmCoordinator.getState() !== 'active') {
          this.healthStats.consecutiveFailures++;
          this.healthStats.healthCheckFailures++;
          return false;
        }
      }

      // Check cache health
      if (this.config.cache?.enabled) {
        const maxSize = this.config.cache.maxSize || 500;
        if (this.cache.size > maxSize * 1.2) {
          // 20% overage threshold
          this.logger.warn(
            `Cache size (${this.cache.size}) significantly exceeds limit (${maxSize})`
          );
          this.healthStats.consecutiveFailures++;
          this.healthStats.healthCheckFailures++;
          return false;
        }
      }

      // Reset consecutive failures on success
      this.healthStats.consecutiveFailures = 0;
      return true;
    } catch (error) {
      this.logger.error(`Health check failed for ${this.name}:`, error);
      this.healthStats.consecutiveFailures++;
      this.healthStats.healthCheckFailures++;
      return false;
    }
  }

  /**
   * Update service configuration
   *
   * @param config
   */
  async updateConfig(config: Partial<CoordinationServiceAdapterConfig>): Promise<void> {
    this.logger.info(`Updating configuration for coordination service adapter: ${this.name}`);

    try {
      // Validate the updated configuration
      const newConfig = { ...this.config, ...config };
      const isValid = await this.validateConfig(newConfig);
      if (!isValid) {
        throw new Error('Invalid configuration update');
      }

      // Apply the configuration
      Object.assign(this.config, config);

      this.logger.info(`Configuration updated successfully for: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to update configuration for ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Validate service configuration
   *
   * @param config
   */
  async validateConfig(config: CoordinationServiceAdapterConfig): Promise<boolean> {
    try {
      // Basic validation
      if (!config.name || !config.type) {
        this.logger.error('Configuration missing required fields: name or type');
        return false;
      }

      // Validate DAA service configuration
      if (
        config.daaService?.enabled &&
        config.performance?.requestTimeout &&
        config.performance.requestTimeout < 1000
      ) {
        this.logger.error('Request timeout must be at least 1000ms');
        return false;
      }

      // Validate session service configuration
      if (config.sessionService?.enabled) {
        if (config.sessionService.maxSessions && config.sessionService.maxSessions < 1) {
          this.logger.error('Max sessions must be at least 1');
          return false;
        }
        if (
          config.sessionService.checkpointInterval &&
          config.sessionService.checkpointInterval < 10000
        ) {
          this.logger.error('Checkpoint interval must be at least 10000ms');
          return false;
        }
      }

      // Validate swarm coordinator configuration
      if (config.swarmCoordinator?.enabled) {
        if (config.swarmCoordinator.maxAgents && config.swarmCoordinator.maxAgents < 1) {
          this.logger.error('Max agents must be at least 1');
          return false;
        }
        if (
          config.swarmCoordinator.performanceThreshold &&
          (config.swarmCoordinator.performanceThreshold < 0 ||
            config.swarmCoordinator.performanceThreshold > 1)
        ) {
          this.logger.error('Performance threshold must be between 0 and 1');
          return false;
        }
      }

      // Validate performance configuration
      if (config.performance?.maxConcurrency && config.performance.maxConcurrency < 1) {
        this.logger.error('Max concurrency must be at least 1');
        return false;
      }

      // Validate retry configuration
      if (config.retry?.enabled && config.retry.maxAttempts && config.retry.maxAttempts < 1) {
        this.logger.error('Retry max attempts must be at least 1');
        return false;
      }

      // Validate cache configuration
      if (config.cache?.enabled && config.cache.maxSize && config.cache.maxSize < 1) {
        this.logger.error('Cache max size must be at least 1');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Configuration validation error: ${error}`);
      return false;
    }
  }

  /**
   * Check if service is ready to handle operations
   */
  isReady(): boolean {
    return this.lifecycleStatus === 'running';
  }

  /**
   * Get service capabilities
   */
  getCapabilities(): string[] {
    const capabilities = ['coordination-operations'];

    if (this.config.daaService?.enabled) {
      capabilities.push(
        'agent-management',
        'workflow-execution',
        'knowledge-sharing',
        'learning-operations',
        'cognitive-analysis',
        'performance-metrics'
      );
    }

    if (this.config.sessionService?.enabled) {
      capabilities.push(
        'session-management',
        'state-persistence',
        'checkpoint-creation',
        'session-recovery',
        'cross-session-continuity'
      );
    }

    if (this.config.swarmCoordinator?.enabled) {
      capabilities.push(
        'swarm-coordination',
        'task-assignment',
        'agent-orchestration',
        'topology-management',
        'load-balancing'
      );
    }

    if (this.config.cache?.enabled) {
      capabilities.push('caching', 'performance-optimization');
    }

    if (this.config.retry?.enabled) {
      capabilities.push('retry-logic', 'fault-tolerance');
    }

    if (this.config.learning?.enableContinuousLearning) {
      capabilities.push('continuous-learning', 'adaptation', 'pattern-analysis');
    }

    return capabilities;
  }

  /**
   * Execute service operations with unified interface
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
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    this.logger.debug(`Executing operation: ${operation}`, { operationId, params });

    try {
      // Check if service is ready
      if (!this.isReady()) {
        throw new ServiceOperationError(this.name, operation, new Error('Service not ready'));
      }

      // Apply timeout if specified
      const timeout = options?.timeout || this.config.performance?.requestTimeout || 30000;
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
        agentCount: this.estimateAgentCount(params),
        sessionId: this.extractSessionId(params),
        coordinationLatency: this.calculateCoordinationLatency(result),
        timestamp: new Date(),
      });

      this.operationCount++;
      this.successCount++;
      this.totalLatency += duration;

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
        timestamp: new Date(),
      });

      this.operationCount++;
      this.errorCount++;
      this.totalLatency += duration;

      this.emit('operation', { operationId, operation, success: false, duration, error });
      this.emit('error', error);

      this.logger.error(`Operation ${operation} failed:`, error);

      return {
        success: false,
        error: {
          code: error instanceof ServiceError ? error.code : 'OPERATION_ERROR',
          message: error.message,
          details: params,
          stack: error.stack,
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
      error,
    };
    this.eventEmitter.emit(event, serviceEvent);
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
          if (!config.healthCheck) {
            return true; // Skip health check if not required
          }

          try {
            // Simulate dependency health check
            // In a real implementation, this would check the actual dependency
            return true;
          } catch (error) {
            this.logger.warn(`Dependency ${name} health check failed:`, error);
            return !config.required; // Return false only if dependency is required
          }
        }
      );

      const results = await Promise.all(dependencyChecks);
      return results.every((result) => result === true);
    } catch (error) {
      this.logger.error(`Error checking dependencies for ${this.name}:`, error);
      return false;
    }
  }

  // ============================================
  // Internal Operation Execution
  // ============================================

  /**
   * Internal operation execution with caching, deduplication, and retry logic
   *
   * @param operation
   * @param params
   * @param options
   */
  private async executeOperationInternal<T = any>(
    operation: string,
    params?: any,
    options?: ServiceOperationOptions
  ): Promise<T> {
    // Generate cache key
    const cacheKey = this.generateCacheKey(operation, params);

    // Check cache first if enabled
    if (this.config.cache?.enabled && this.isCacheableOperation(operation)) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for operation: ${operation}`);
        this.recordOperationMetrics({
          operationName: operation,
          executionTime: 0,
          success: true,
          cacheHit: true,
          timestamp: new Date(),
        });
        return cached;
      }
    }

    // Check for request deduplication
    if (this.config.performance?.enableRequestDeduplication) {
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        this.logger.debug(`Request deduplication for operation: ${operation}`);
        pending.requestCount++;
        return await pending.promise;
      }
    }

    // Execute operation with retry logic
    const executionPromise = this.executeWithRetry<T>(operation, params, options);

    // Store pending request for deduplication
    if (this.config.performance?.enableRequestDeduplication) {
      this.pendingRequests.set(cacheKey, {
        promise: executionPromise,
        timestamp: new Date(),
        requestCount: 1,
      });
    }

    try {
      const result = await executionPromise;

      // Cache the result if enabled
      if (this.config.cache?.enabled && this.isCacheableOperation(operation)) {
        this.setInCache(cacheKey, result);
      }

      return result;
    } finally {
      // Clean up pending request
      if (this.config.performance?.enableRequestDeduplication) {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  /**
   * Execute operation with retry logic
   *
   * @param operation
   * @param params
   * @param options
   * @param attempt
   */
  private async executeWithRetry<T = any>(
    operation: string,
    params?: any,
    options?: ServiceOperationOptions,
    attempt = 1
  ): Promise<T> {
    try {
      return await this.performOperation<T>(operation, params, options);
    } catch (error) {
      const shouldRetry = this.shouldRetryOperation(operation, error, attempt);

      if (shouldRetry && attempt < (this.config.retry?.maxAttempts || 3)) {
        const delay = (this.config.retry?.backoffMultiplier || 2) ** (attempt - 1) * 1000;
        this.logger.warn(
          `Operation ${operation} failed (attempt ${attempt}), retrying in ${delay}ms:`,
          error
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        this.recordOperationMetrics({
          operationName: operation,
          executionTime: 0,
          success: false,
          retryCount: attempt,
          timestamp: new Date(),
        });

        return await this.executeWithRetry<T>(operation, params, options, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Perform the actual operation based on operation type
   *
   * @param operation
   * @param params
   * @param options
   * @param _options
   */
  private async performOperation<T = any>(
    operation: string,
    params?: any,
    _options?: ServiceOperationOptions
  ): Promise<T> {
    switch (operation) {
      // DaaService operations
      case 'agent-create':
        return (await this.createAgent(params?.config)) as T;

      case 'agent-adapt':
        return (await this.adaptAgent(params?.agentId, params?.adaptation)) as T;

      case 'agent-learning-status':
        return (await this.getAgentLearningStatus(params?.agentId)) as T;

      case 'workflow-create':
        return (await this.createWorkflow(params?.workflow)) as T;

      case 'workflow-execute':
        return (await this.executeWorkflow(params?.workflowId, params?.params)) as T;

      case 'knowledge-share':
        return (await this.shareKnowledge(params?.knowledge)) as T;

      case 'cognitive-analyze':
        return (await this.analyzeCognitivePatterns(params?.agentId)) as T;

      case 'cognitive-set':
        return (await this.setCognitivePattern(params?.agentId, params?.pattern)) as T;

      case 'meta-learning':
        return (await this.performMetaLearning(params)) as T;

      case 'performance-metrics':
        return (await this.getPerformanceMetrics(params?.agentId)) as T;

      // Session operations
      case 'session-create':
        return (await this.createSession(params?.name)) as T;

      case 'session-load':
        return (await this.loadSession(params?.sessionId)) as T;

      case 'session-save':
        return (await this.saveSession(params?.sessionId)) as T;

      case 'session-checkpoint':
        return (await this.createCheckpoint(params?.sessionId, params?.description)) as T;

      case 'session-restore':
        return (await this.restoreFromCheckpoint(params?.sessionId, params?.checkpointId)) as T;

      case 'session-list':
        return (await this.listSessions(params?.filter)) as T;

      case 'session-stats':
        return (await this.getSessionStats(params?.sessionId)) as T;

      // Swarm coordination operations
      case 'swarm-coordinate':
        return (await this.coordinateSwarm(params?.agents, params?.topology)) as T;

      case 'swarm-add-agent':
        return (await this.addAgentToSwarm(params?.agent)) as T;

      case 'swarm-remove-agent':
        return (await this.removeAgentFromSwarm(params?.agentId)) as T;

      case 'swarm-assign-task':
        return (await this.assignTask(params?.task)) as T;

      case 'swarm-complete-task':
        return (await this.completeTask(params?.taskId, params?.result)) as T;

      case 'swarm-metrics':
        return (await this.getSwarmMetrics()) as T;

      case 'swarm-agents':
        return (await this.getSwarmAgents()) as T;

      // Utility operations
      case 'cache-stats':
        return this.getCacheStats() as T;

      case 'clear-cache':
        return (await this.clearCache()) as T;

      case 'service-stats':
        return (await this.getServiceStats()) as T;

      case 'agent-metrics':
        return this.getAgentMetrics() as T;

      case 'session-metrics':
        return this.getSessionMetrics() as T;

      default:
        throw new ServiceOperationError(
          this.name,
          operation,
          new Error(`Unknown operation: ${operation}`)
        );
    }
  }

  // ============================================
  // DaaService Integration Methods
  // ============================================

  private async createAgent(config: any): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }

    const result = await this.daaService.createAgent(config);

    // Track agent metrics
    if (this.config.agentManagement?.performanceTracking) {
      this.agentMetrics.set(result.id, {
        agentId: result.id,
        type: result.type || 'unknown',
        tasksCompleted: 0,
        averageResponseTime: 0,
        errorRate: 0,
        learningProgress: 0,
        lastActivity: new Date(),
      });
    }

    return result;
  }

  private async adaptAgent(agentId: string, adaptation: any): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }

    const result = await this.daaService.adaptAgent(agentId, adaptation);

    // Update agent metrics
    const metrics = this.agentMetrics.get(agentId);
    if (metrics) {
      metrics.lastActivity = new Date();
      metrics.learningProgress = Math.min(metrics.learningProgress + 0.1, 1.0);
    }

    return result;
  }

  private async getAgentLearningStatus(agentId: string): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }
    return await this.daaService.getAgentLearningStatus(agentId);
  }

  private async createWorkflow(workflow: any): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }
    return await this.daaService.createWorkflow(workflow);
  }

  private async executeWorkflow(workflowId: string, params: any): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }
    return await this.daaService.executeWorkflow(workflowId, params);
  }

  private async shareKnowledge(knowledge: any): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }
    return await this.daaService.shareKnowledge(knowledge);
  }

  private async analyzeCognitivePatterns(agentId?: string): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }
    return await this.daaService.analyzeCognitivePatterns(agentId);
  }

  private async setCognitivePattern(agentId: string, pattern: any): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }
    return await this.daaService.setCognitivePattern(agentId, pattern);
  }

  private async performMetaLearning(params: any): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }
    return await this.daaService.performMetaLearning(params);
  }

  private async getPerformanceMetrics(agentId?: string): Promise<any> {
    if (!this.daaService) {
      throw new Error('DaaService not available');
    }
    return await this.daaService.getPerformanceMetrics(agentId);
  }

  // ============================================
  // Session Service Integration Methods
  // ============================================

  private async createSession(name: string): Promise<string> {
    if (!this.sessionEnabledSwarm) {
      throw new Error('SessionEnabledSwarm not available');
    }

    const sessionId = await this.sessionEnabledSwarm.createSession(name);

    // Track session metrics
    this.sessionMetrics.set(sessionId, {
      sessionId,
      uptime: 0,
      operationsCount: 0,
      checkpointsCreated: 0,
      recoveryAttempts: 0,
      lastAccessed: new Date(),
    });

    return sessionId;
  }

  private async loadSession(sessionId: string): Promise<void> {
    if (!this.sessionEnabledSwarm) {
      throw new Error('SessionEnabledSwarm not available');
    }

    await this.sessionEnabledSwarm.loadSession(sessionId);

    // Update session metrics
    const metrics = this.sessionMetrics.get(sessionId);
    if (metrics) {
      metrics.lastAccessed = new Date();
    }
  }

  private async saveSession(sessionId?: string): Promise<void> {
    if (!this.sessionEnabledSwarm) {
      throw new Error('SessionEnabledSwarm not available');
    }

    await this.sessionEnabledSwarm.saveSession();

    // Update session metrics
    if (sessionId) {
      const metrics = this.sessionMetrics.get(sessionId);
      if (metrics) {
        metrics.operationsCount++;
        metrics.lastAccessed = new Date();
      }
    }
  }

  private async createCheckpoint(sessionId: string, description?: string): Promise<string> {
    if (!this.sessionEnabledSwarm) {
      throw new Error('SessionEnabledSwarm not available');
    }

    const checkpointId = await this.sessionEnabledSwarm.createCheckpoint(description);

    // Update session metrics
    const metrics = this.sessionMetrics.get(sessionId);
    if (metrics) {
      metrics.checkpointsCreated++;
      metrics.lastAccessed = new Date();
    }

    return checkpointId;
  }

  private async restoreFromCheckpoint(sessionId: string, checkpointId: string): Promise<void> {
    if (!this.sessionEnabledSwarm) {
      throw new Error('SessionEnabledSwarm not available');
    }

    await this.sessionEnabledSwarm.restoreFromCheckpoint(checkpointId);

    // Update session metrics
    const metrics = this.sessionMetrics.get(sessionId);
    if (metrics) {
      metrics.recoveryAttempts++;
      metrics.lastAccessed = new Date();
    }
  }

  private async listSessions(filter?: any): Promise<SessionState[]> {
    if (!this.sessionEnabledSwarm) {
      throw new Error('SessionEnabledSwarm not available');
    }
    return await this.sessionEnabledSwarm.listSessions(filter);
  }

  private async getSessionStats(sessionId?: string): Promise<Record<string, any>> {
    if (!this.sessionEnabledSwarm) {
      throw new Error('SessionEnabledSwarm not available');
    }
    return await this.sessionEnabledSwarm.getSessionStats(sessionId);
  }

  // ============================================
  // SwarmCoordinator Integration Methods
  // ============================================

  private async coordinateSwarm(agents: SwarmAgent[], topology?: SwarmTopology): Promise<any> {
    if (!this.swarmCoordinator) {
      throw new Error('SwarmCoordinator not available');
    }
    return await this.swarmCoordinator.coordinateSwarm(agents, topology);
  }

  private async addAgentToSwarm(
    agent: Omit<SwarmAgent, 'performance' | 'connections'>
  ): Promise<void> {
    if (!this.swarmCoordinator) {
      throw new Error('SwarmCoordinator not available');
    }
    return await this.swarmCoordinator.addAgent(agent);
  }

  private async removeAgentFromSwarm(agentId: string): Promise<void> {
    if (!this.swarmCoordinator) {
      throw new Error('SwarmCoordinator not available');
    }

    await this.swarmCoordinator.removeAgent(agentId);

    // Clean up agent metrics
    this.agentMetrics.delete(agentId);
  }

  private async assignTask(task: any): Promise<string | null> {
    if (!this.swarmCoordinator) {
      throw new Error('SwarmCoordinator not available');
    }
    return await this.swarmCoordinator.assignTask(task);
  }

  private async completeTask(taskId: string, result: any): Promise<void> {
    if (!this.swarmCoordinator) {
      throw new Error('SwarmCoordinator not available');
    }
    return await this.swarmCoordinator.completeTask(taskId, result);
  }

  private async getSwarmMetrics(): Promise<SwarmMetrics> {
    if (!this.swarmCoordinator) {
      throw new Error('SwarmCoordinator not available');
    }
    return this.swarmCoordinator.getMetrics();
  }

  private async getSwarmAgents(): Promise<SwarmAgent[]> {
    if (!this.swarmCoordinator) {
      throw new Error('SwarmCoordinator not available');
    }
    return this.swarmCoordinator.getAgents();
  }

  // ============================================
  // Utility and Stats Methods
  // ============================================

  private getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.cache?.maxSize || 500,
      hitRate: this.calculateCacheHitRate(),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private async clearCache(): Promise<{ cleared: number }> {
    const cleared = this.cache.size;
    this.cache.clear();
    this.logger.info(`Cleared ${cleared} items from cache`);
    return { cleared };
  }

  private async getServiceStats(): Promise<{
    operationCount: number;
    successCount: number;
    errorCount: number;
    avgLatency: number;
    cacheHitRate: number;
    pendingRequests: number;
    activeAgents: number;
    activeSessions: number;
    healthStats: typeof this.healthStats;
  }> {
    return {
      operationCount: this.operationCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      avgLatency: this.operationCount > 0 ? this.totalLatency / this.operationCount : 0,
      cacheHitRate: this.calculateCacheHitRate(),
      pendingRequests: this.pendingRequests.size,
      activeAgents: this.agentMetrics.size,
      activeSessions: this.sessionMetrics.size,
      healthStats: { ...this.healthStats },
    };
  }

  private getAgentMetrics(): AgentPerformanceMetrics[] {
    return Array.from(this.agentMetrics.values());
  }

  private getSessionMetrics(): SessionPerformanceMetrics[] {
    return Array.from(this.sessionMetrics.values());
  }

  // ============================================
  // Helper Methods
  // ============================================

  private generateCacheKey(operation: string, params?: any): string {
    const prefix = this.config.cache?.keyPrefix || 'coord-adapter:';
    const paramsHash = params ? JSON.stringify(params) : '';
    return `${prefix}${operation}:${Buffer.from(paramsHash).toString('base64')}`;
  }

  private isCacheableOperation(operation: string): boolean {
    const cacheableOps = [
      'agent-learning-status',
      'performance-metrics',
      'cognitive-analyze',
      'session-stats',
      'session-list',
      'swarm-metrics',
      'swarm-agents',
    ];
    return cacheableOps.includes(operation);
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = new Date();
    if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.accessed = now;
    entry.accessCount++;
    return entry.data;
  }

  private setInCache<T>(key: string, data: T): void {
    const now = new Date();
    const ttl = this.config.cache?.defaultTTL || 600000;

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessed: now,
      accessCount: 1,
    });

    // Cleanup cache if it exceeds max size
    if (this.cache.size > (this.config.cache?.maxSize || 500)) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    const maxSize = this.config.cache?.maxSize || 500;
    const targetSize = Math.floor(maxSize * 0.8); // Clean to 80% of max size

    if (this.cache.size <= targetSize) {
      return;
    }

    // Sort by least recently used and lowest access count
    const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => {
      const aScore = a.accessed.getTime() + a.accessCount * 1000;
      const bScore = b.accessed.getTime() + b.accessCount * 1000;
      return aScore - bScore;
    });

    const toRemove = this.cache.size - targetSize;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }

    this.logger.debug(`Cache cleanup: removed ${toRemove} entries`);
  }

  private shouldRetryOperation(operation: string, error: any, attempt: number): boolean {
    if (!this.config.retry?.enabled) {
      return false;
    }

    if (!this.config.retry.retryableOperations.includes(operation)) {
      return false;
    }

    if (attempt >= (this.config.retry.maxAttempts || 3)) {
      return false;
    }

    // Don't retry certain types of errors
    if (error instanceof ServiceTimeoutError && error.timeout < 5000) {
      return false; // Don't retry short timeouts
    }

    return true;
  }

  private recordOperationMetrics(metrics: CoordinationOperationMetrics): void {
    if (!this.config.performance?.enableMetricsCollection) {
      return;
    }

    this.metrics.push(metrics);

    // Keep only recent metrics
    const cutoff = new Date(Date.now() - 3600000); // 1 hour
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
  }

  private calculateCacheHitRate(): number {
    const recentMetrics = this.metrics.filter(
      (m) => Date.now() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    if (recentMetrics.length === 0) {
      return 0;
    }

    const cacheHits = recentMetrics.filter((m) => m.cacheHit).length;
    return (cacheHits / recentMetrics.length) * 100;
  }

  private calculateDeduplicationRate(): number {
    const deduplicatedRequests = Array.from(this.pendingRequests.values()).reduce(
      (sum, req) => sum + (req.requestCount - 1),
      0
    );

    const totalRequests = this.operationCount + deduplicatedRequests;
    return totalRequests > 0 ? (deduplicatedRequests / totalRequests) * 100 : 0;
  }

  private calculateLearningOperationsRate(): number {
    const recentMetrics = this.metrics.filter(
      (m) => Date.now() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    if (recentMetrics.length === 0) {
      return 0;
    }

    const learningOps = recentMetrics.filter(
      (m) =>
        m.operationName.includes('learning') ||
        m.operationName.includes('cognitive') ||
        m.operationName.includes('adapt')
    ).length;

    return (learningOps / recentMetrics.length) * 100;
  }

  private estimateMemoryUsage(): number {
    let size = 0;

    // Estimate cache memory usage
    for (const entry of this.cache.values()) {
      size += this.estimateDataSize(entry.data) + 200; // 200 bytes for metadata
    }

    // Estimate pending requests memory usage
    size += this.pendingRequests.size * 100;

    // Estimate metrics memory usage
    size += this.metrics.length * 200;

    // Estimate agent metrics memory usage
    size += this.agentMetrics.size * 150;

    // Estimate session metrics memory usage
    size += this.sessionMetrics.size * 150;

    return size;
  }

  private estimateDataSize(data: any): number {
    if (!data) return 0;

    try {
      return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 1000; // Default estimate for non-serializable data
    }
  }

  private estimateAgentCount(params: any): number | undefined {
    if (!params) return undefined;

    if (params.agents && Array.isArray(params.agents)) {
      return params.agents.length;
    }

    if (params.agentId || params.agent) {
      return 1;
    }

    return undefined;
  }

  private extractSessionId(params: any): string | undefined {
    return params?.sessionId;
  }

  private calculateCoordinationLatency(result: any): number | undefined {
    if (result && typeof result === 'object' && result.averageLatency) {
      return result.averageLatency;
    }
    return undefined;
  }

  private determineHealthStatus(
    errorRate: number
  ): 'healthy' | 'degraded' | 'unhealthy' | 'unknown' {
    if (this.healthStats.consecutiveFailures > 5) {
      return 'unhealthy';
    } else if (errorRate > 10 || this.healthStats.consecutiveFailures > 2) {
      return 'degraded';
    } else if (this.operationCount > 0) {
      return 'healthy';
    } else {
      return 'unknown';
    }
  }

  private startCacheCleanupTimer(): void {
    setInterval(() => {
      this.cleanupCache();

      // Clean expired entries
      const now = new Date();
      for (const [key, entry] of this.cache.entries()) {
        if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Run every minute
  }

  private startMetricsCleanupTimer(): void {
    setInterval(() => {
      const cutoff = new Date(Date.now() - 3600000); // 1 hour
      this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
    }, 300000); // Run every 5 minutes
  }

  private startAgentMetricsTimer(): void {
    if (!this.config.agentManagement?.performanceTracking) return;

    setInterval(() => {
      const now = new Date();
      const maxLifetime = this.config.agentManagement?.maxLifetime || 3600000;

      // Clean up stale agent metrics
      for (const [agentId, metrics] of this.agentMetrics.entries()) {
        if (now.getTime() - metrics.lastActivity.getTime() > maxLifetime) {
          this.agentMetrics.delete(agentId);
          this.logger.debug(`Cleaned up stale agent metrics for: ${agentId}`);
        }
      }
    }, this.config.agentManagement?.healthCheckInterval || 60000);
  }

  private startLearningTimer(): void {
    if (!this.config.learning?.enableContinuousLearning) return;

    setInterval(() => {
      // Trigger meta-learning if enabled
      if (this.config.learning?.patternAnalysis && this.daaService) {
        this.performMetaLearning({
          analysisType: 'automated',
          timestamp: new Date(),
        }).catch((error) => {
          this.logger.warn('Automated meta-learning failed:', error);
        });
      }
    }, this.config.learning?.metaLearningInterval || 1800000);
  }
}

/**
 * Factory function for creating CoordinationServiceAdapter instances
 *
 * @param config
 */
export function createCoordinationServiceAdapter(
  config: CoordinationServiceAdapterConfig
): CoordinationServiceAdapter {
  return new CoordinationServiceAdapter(config);
}

/**
 * Helper function for creating default configuration
 *
 * @param name
 * @param overrides
 */
export function createDefaultCoordinationServiceAdapterConfig(
  name: string,
  overrides?: Partial<CoordinationServiceAdapterConfig>
): CoordinationServiceAdapterConfig {
  return {
    name,
    type: ServiceType.COORDINATION,
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
    daaService: {
      enabled: true,
      autoInitialize: true,
      enableLearning: true,
      enableCognitive: true,
      enableMetaLearning: true,
    },
    sessionService: {
      enabled: true,
      autoRecovery: true,
      healthCheckInterval: 30000,
      maxSessions: 100,
      checkpointInterval: 300000,
    },
    swarmCoordinator: {
      enabled: true,
      defaultTopology: 'mesh',
      maxAgents: 50,
      coordinationTimeout: 10000,
      performanceThreshold: 0.8,
    },
    performance: {
      enableRequestDeduplication: true,
      maxConcurrency: 20,
      requestTimeout: 30000,
      enableMetricsCollection: true,
      agentPooling: true,
      sessionCaching: true,
    },
    retry: {
      enabled: true,
      maxAttempts: 3,
      backoffMultiplier: 2,
      retryableOperations: [
        'agent-create',
        'agent-adapt',
        'workflow-execute',
        'session-create',
        'session-save',
        'session-restore',
        'swarm-coordinate',
        'swarm-assign-task',
        'knowledge-share',
      ],
    },
    cache: {
      enabled: true,
      strategy: 'memory',
      defaultTTL: 600000,
      maxSize: 500,
      keyPrefix: 'coord-adapter:',
    },
    agentManagement: {
      autoSpawn: false,
      maxLifetime: 3600000,
      healthCheckInterval: 60000,
      performanceTracking: true,
    },
    learning: {
      enableContinuousLearning: true,
      knowledgeSharing: true,
      patternAnalysis: true,
      metaLearningInterval: 1800000,
    },
    ...overrides,
  };
}

export default CoordinationServiceAdapter;
