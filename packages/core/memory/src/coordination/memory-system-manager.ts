/**
 * Memory System Manager - Unified Memory System Orchestration
 *
 * Provides a unified interface for managing complex memory systems with coordination,
 * optimization strategies, lifecycle management, and comprehensive monitoring.
 */

import { EventEmitter } from '@claude-zen/foundation';
import {
  getLogger,
  recordMetric,
  withTrace,
  TelemetryManager,
  createCircuitBreaker,
} from '@claude-zen/foundation';
import type { Logger, CircuitBreakerOptions } from '@claude-zen/foundation';
import { MemoryCoordinationSystem } from '../coordinators/memory-coordination-system';
import { MemoryOptimizationEngine } from '../strategies/memory-optimization-engine';
import { DataLifecycleManager } from '../strategies/data-lifecycle-manager';
import { PerformanceTuningStrategy } from '../strategies/performance-tuning-strategy';
import { CacheEvictionStrategy } from '../strategies/cache-eviction-strategy';
import type {
  MemorySystemConfig,
  MemorySystemStatus,
  SystemMetrics,
} from './types';
import type { BaseMemoryBackend } from '../backends/base-backend';
import type { JSONValue } from '../core/memory-system';

interface ManagedComponent {
  name: string;
  instance: any;
  initialized: boolean;
  healthy: boolean;
  lastHealthCheck: number;
}

export class MemorySystemManager extends EventEmitter {
  private logger: Logger;
  private config: MemorySystemConfig;
  private telemetry: TelemetryManager;
  private coordination?: MemoryCoordinationSystem;
  private optimization?: MemoryOptimizationEngine;
  private lifecycle?: DataLifecycleManager;
  private performance?: PerformanceTuningStrategy;
  private cacheEviction?: CacheEvictionStrategy;
  private components = new Map<string, ManagedComponent>();
  private monitoringTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;
  private initialized = false;
  private startTime = Date.now();
  private circuitBreaker: any;

  constructor(config: MemorySystemConfig) {
    super();
    this.config = config;
    this.logger = getLogger(`MemorySystemManager:${config.name}`);
    this.telemetry = new TelemetryManager({
      serviceName: `memory-system-${config.name}`,
      enableTracing: true,
      enableMetrics: true,
    });

    // Create circuit breaker for system operations
    this.circuitBreaker = createCircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000,
      monitoringPeriod: 60000,
    } as CircuitBreakerOptions);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await withTrace('memory-system-manager-init', async (span) => {
        span?.setAttributes({
          'system.name': this.config.name,
          'system.mode': this.config.mode,
        });

        await this.telemetry.initialize();

        // Initialize core coordination system
        await this.initializeCoordination();

        // Initialize optional components based on configuration
        if (this.config.optimization?.enabled) {
          await this.initializeOptimization();
        }

        if (this.config.lifecycle?.enabled) {
          await this.initializeLifecycle();
        }

        if (this.config.performance?.enabled) {
          await this.initializePerformance();
        }

        // Initialize cache eviction if any coordination strategy uses caching
        if (this.shouldInitializeCacheEviction()) {
          await this.initializeCacheEviction();
        }

        // Start monitoring
        if (this.config.monitoring.enabled) {
          this.startMonitoring();
        }

        this.initialized = true;
        this.logger.info(
          `Memory system '${this.config.name}' initialized successfully`,
          {
            mode: this.config.mode,
            components: Array.from(this.components.keys()),
          }
        );

        recordMetric('memory_system_initialized', 1, {
          name: this.config.name,
          mode: this.config.mode,
        });

        this.emit('systemInitialized', {
          name: this.config.name,
          mode: this.config.mode,
          components: Array.from(this.components.keys()),
        });
      });
    } catch (error) {
      this.logger.error(
        `Failed to initialize memory system '${this.config.name}':`,
        error
      );
      throw error;
    }
  }

  async addNode(
    id: string,
    backend: BaseMemoryBackend,
    options: {
      weight?: number;
      priority?: number;
      tier?: 'hot|warm|cold';
    } = {}
  ): Promise<void> {
    if (!this.coordination) {
      throw new Error('Coordination system not initialized');
    }

    return this.circuitBreaker.execute(async () => {
      await this.coordination!.addNode(id, backend, options);

      this.emit('nodeAdded', { id, options });
      recordMetric('memory_system_node_added', 1, {
        systemName: this.config.name,
        nodeId: id,
      });
    });
  }

  async removeNode(id: string): Promise<void> {
    if (!this.coordination) {
      throw new Error('Coordination system not initialized');
    }

    return this.circuitBreaker.execute(async () => {
      await this.coordination!.removeNode(id);

      this.emit('nodeRemoved', { id });
      recordMetric('memory_system_node_removed', 1, {
        systemName: this.config.name,
        nodeId: id,
      });
    });
  }

  async store(
    key: string,
    value: JSONValue,
    namespace = 'default',
    options?: {
      consistency?: 'strong' | ' eventual';
      tier?: 'hot|warm|cold';
      ttl?: number;
      priority?: number;
      tags?: string[];
    }
  ): Promise<any> {
    if (!this.coordination) {
      throw new Error('Coordination system not initialized');
    }

    return withTrace('memory-system-store', async (span) => {
      span?.setAttributes({
        'memory.key': key,
        'memory.namespace': namespace,
        'memory.tier': options?.tier || ' warm',
      });

      // Store via coordination system
      const result = await this.coordination!.store(key, value, namespace, {
        consistency: options?.consistency,
        tier: options?.tier,
        replicate: this.config.coordination.strategy === 'replicated',
      });

      // Also store in lifecycle manager if enabled
      if (this.lifecycle && this.config.lifecycle?.enabled) {
        this.lifecycle.store(key, value, {
          stage: options?.tier || 'warm',
          priority: options?.priority,
          tags: options?.tags,
          source: 'memory-system',
        });
      }

      recordMetric('memory_system_store', 1, {
        systemName: this.config.name,
        namespace,
        success: result.success ? 'true' : ' false',
      });

      return result;
    });
  }

  async retrieve<T = JSONValue>(
    key: string,
    namespace = 'default',
    options?: {
      consistency?: 'strong' | ' eventual';
      timeout?: number;
    }
  ): Promise<T | null> {
    if (!this.coordination) {
      throw new Error('Coordination system not initialized');
    }

    return withTrace('memory-system-retrieve', async (span) => {
      span?.setAttributes({
        'memory.key': key,
        'memory.namespace': namespace,
      });

      // Try lifecycle manager first if enabled
      if (this.lifecycle && this.config.lifecycle?.enabled) {
        const lifecycleResult = this.lifecycle.retrieve(key);
        if (lifecycleResult) {
          recordMetric('memory_system_retrieve', 1, {
            systemName: this.config.name,
            namespace,
            source: 'lifecycle',
          });
          return lifecycleResult.value as T;
        }
      }

      // Fall back to coordination system
      const result = await this.coordination!.retrieve<T>(
        key,
        namespace,
        options
      );

      recordMetric('memory_system_retrieve', 1, {
        systemName: this.config.name,
        namespace,
        source: 'coordination',
        success: result.success ? 'true' : ' false',
      });

      return result.success ? result.data || null : null;
    });
  }

  async delete(key: string, namespace = 'default'): Promise<boolean> {
    if (!this.coordination) {
      throw new Error('Coordination system not initialized');
    }

    return withTrace('memory-system-delete', async (span) => {
      span?.setAttributes({
        'memory.key': key,
        'memory.namespace': namespace,
      });

      // Delete from lifecycle manager if enabled
      if (this.lifecycle && this.config.lifecycle?.enabled) {
        this.lifecycle.delete(key);
      }

      // Delete from coordination system
      const result = await this.coordination!.delete(key, namespace);

      recordMetric('memory_system_delete', 1, {
        systemName: this.config.name,
        namespace,
        success: result.success ? 'true' : ' false',
      });

      return result.success && result.data === true;
    });
  }

  async clear(namespace?: string): Promise<void> {
    if (!this.coordination) {
      throw new Error('Coordination system not initialized');
    }

    return withTrace('memory-system-clear', async (span) => {
      span?.setAttributes({
        'memory.namespace': namespace || ' all',
      });

      // Clear cache eviction if enabled
      if (this.cacheEviction) {
        this.cacheEviction.clear();
      }

      // Clear coordination system
      await this.coordination!.clear(namespace);

      recordMetric('memory_system_clear', 1, {
        systemName: this.config.name,
        namespace: namespace || 'all',
      });
    });
  }

  getSystemStatus(): MemorySystemStatus {
    const now = Date.now();
    const uptime = now - this.startTime;

    // Collect status from all components
    const componentHealth = this.getComponentsHealth();
    const coordinationStatus = this.coordination?.getHealthStatus();

    return {
      name: this.config.name,
      mode: this.config.mode,
      status: this.calculateOverallStatus(componentHealth),
      uptime,
      nodes: {
        total: coordinationStatus?.totalNodes || 0,
        healthy: coordinationStatus?.healthyNodes || 0,
        unhealthy:
          (coordinationStatus?.totalNodes || 0) -
          (coordinationStatus?.healthyNodes || 0),
      },
      performance: {
        averageResponseTime: this.getAverageResponseTime(),
        throughput: this.getThroughput(),
        cacheHitRate: this.getCacheHitRate(),
        errorRate: this.getErrorRate(),
      },
      resources: {
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        storageUsage: this.getStorageUsage(),
        cpuUsage: this.getCpuUsage(),
      },
      optimization: {
        optimizationsApplied:
          this.optimization?.getMetrics().operations.compressions || 0,
        improvementScore: this.optimization?.getMetrics().health.score || 100,
        lastOptimization: this.getLastOptimizationTime(),
      },
      health: {
        score: this.calculateHealthScore(componentHealth),
        issues: this.collectHealthIssues(),
        recommendations: this.generateRecommendations(),
      },
    };
  }

  getSystemMetrics(): SystemMetrics {
    const coordinationStatus = this.coordination?.getHealthStatus();
    const optimizationMetrics = this.optimization?.getMetrics();
    const lifecycleMetrics = this.lifecycle?.getMetrics();
    const performanceMetrics = this.performance?.getMetrics();

    return {
      system: {
        name: this.config.name,
        uptime: Date.now() - this.startTime,
        version: '2.1.0',
        mode: this.config.mode,
      },
      coordination: {
        totalNodes: coordinationStatus?.totalNodes || 0,
        healthyNodes: coordinationStatus?.healthyNodes || 0,
        operationsPerSecond: 0, // Would come from actual metrics
        averageLatency: 0, // Would come from actual metrics
        successRate: 0.99, // Would come from actual metrics
      },
      optimization: {
        optimizationCycles: optimizationMetrics?.operations.compressions || 0,
        improvementsApplied: optimizationMetrics?.operations.reads || 0,
        performanceGain: optimizationMetrics?.health.score || 0,
        memoryEfficiency: optimizationMetrics?.memoryUsage.current || 0,
      },
      lifecycle: {
        totalEntries: 0, // Would get from lifecycle manager
        hotEntries: 0,
        warmEntries: 0,
        coldEntries: 0,
        archivedEntries: 0,
        migrationsPerHour: lifecycleMetrics?.migrations || 0,
      },
      performance: {
        responseTime: {
          p50: performanceMetrics?.stabilityScore || 0,
          p95: performanceMetrics?.stabilityScore || 0,
          p99: performanceMetrics?.stabilityScore || 0,
        },
        throughput: 0,
        cacheMetrics: {
          hitRate: 0.85,
          evictionsPerHour: 0,
          compressionRatio: 0.7,
        },
        errorRate: 0.01,
      },
      resources: {
        memory: {
          used: process.memoryUsage().heapUsed,
          available: process.memoryUsage().heapTotal,
          peak: process.memoryUsage().heapUsed,
        },
        storage: {
          used: 0,
          available: 0,
          iops: 0,
        },
        network: {
          bytesIn: 0,
          bytesOut: 0,
          connectionsActive: 0,
        },
      },
    };
  }

  private async initializeCoordination(): Promise<void> {
    this.coordination = new MemoryCoordinationSystem(this.config.coordination);
    await this.coordination.initialize();

    this.components.set('coordination', {
      name: 'coordination',
      instance: this.coordination,
      initialized: true,
      healthy: true,
      lastHealthCheck: Date.now(),
    });

    // Forward coordination events
    this.coordination.on('nodeAdded', (data) => this.emit(' nodeAdded', data));
    this.coordination.on('nodeRemoved', (data) =>
      this.emit('nodeRemoved', data)
    );
    this.coordination.on('nodeUnhealthy', (data) =>
      this.emit('nodeUnhealthy', data)
    );
    this.coordination.on('nodeRecovered', (data) =>
      this.emit('nodeRecovered', data)
    );
  }

  private async initializeOptimization(): Promise<void> {
    if (!this.config.optimization) return;

    this.optimization = new MemoryOptimizationEngine(this.config.optimization);
    await this.optimization.initialize();

    this.components.set('optimization', {
      name: 'optimization',
      instance: this.optimization,
      initialized: true,
      healthy: true,
      lastHealthCheck: Date.now(),
    });

    // Forward optimization events
    this.optimization.on('optimizationCompleted', (data) =>
      this.emit('optimizationCompleted', data)
    );
    this.optimization.on('optimizationApplied', (data) =>
      this.emit('optimizationApplied', data)
    );
  }

  private async initializeLifecycle(): Promise<void> {
    if (!this.config.lifecycle) return;

    this.lifecycle = new DataLifecycleManager(this.config.lifecycle);
    await this.lifecycle.initialize();

    this.components.set('lifecycle', {
      name: 'lifecycle',
      instance: this.lifecycle,
      initialized: true,
      healthy: true,
      lastHealthCheck: Date.now(),
    });

    // Forward lifecycle events
    this.lifecycle.on('dataStored', (data) => this.emit(' dataStored', data));
    this.lifecycle.on('dataMigrated', (data) =>
      this.emit('dataMigrated', data)
    );
    this.lifecycle.on('dataDeleted', (data) => this.emit(' dataDeleted', data));
  }

  private async initializePerformance(): Promise<void> {
    if (!this.config.performance) return;

    this.performance = new PerformanceTuningStrategy(this.config.performance);
    await this.performance.initialize();

    this.components.set('performance', {
      name: 'performance',
      instance: this.performance,
      initialized: true,
      healthy: true,
      lastHealthCheck: Date.now(),
    });

    // Forward performance events
    this.performance.on('tuningApplied', (data) =>
      this.emit('tuningApplied', data)
    );
    this.performance.on('tuningAnalysisCompleted', (data) =>
      this.emit('tuningAnalysisCompleted', data)
    );
  }

  private async initializeCacheEviction(): Promise<void> {
    this.cacheEviction = new CacheEvictionStrategy({
      enabled: true,
      algorithm: 'adaptive',
      maxSize: 10000,
      maxMemory: 100 * 1024 * 1024, // 100MB
      ttl: 300000, // 5 minutes
      cleanupInterval: 60000, // 1 minute
      evictionThreshold: 0.8,
      batchSize: 10,
      preservePriority: true,
    });

    await this.cacheEviction.initialize();

    this.components.set('cacheEviction', {
      name: 'cacheEviction',
      instance: this.cacheEviction,
      initialized: true,
      healthy: true,
      lastHealthCheck: Date.now(),
    });

    // Forward cache events
    this.cacheEviction.on('entryEvicted', (data) =>
      this.emit('entryEvicted', data)
    );
    this.cacheEviction.on('evictionCompleted', (data) =>
      this.emit('evictionCompleted', data)
    );
  }

  private shouldInitializeCacheEviction(): boolean {
    return (
      this.config.coordination.strategy === 'intelligent' ||
      this.config.optimization?.strategies.compression ||
      this.config.performance?.actions.adjustCacheSize ||
      false
    );
  }

  private startMonitoring(): void {
    if (this.config.monitoring.interval > 0) {
      this.monitoringTimer = setInterval(() => {
        this.performMonitoringCycle();
      }, this.config.monitoring.interval);
    }

    if (this.config.monitoring.healthChecks) {
      this.healthCheckTimer = setInterval(
        () => {
          this.performHealthChecks();
        },
        Math.min(this.config.monitoring.interval, 30000)
      );
    }
  }

  private async performMonitoringCycle(): Promise<void> {
    try {
      const status = this.getSystemStatus();
      const metrics = this.getSystemMetrics();

      this.emit('monitoringUpdate', { status, metrics });

      // Record key metrics
      recordMetric('memory_system_health_score', status.health.score, {
        systemName: this.config.name,
      });
      recordMetric('memory_system_nodes_healthy', status.nodes.healthy, {
        systemName: this.config.name,
      });
      recordMetric(
        'memory_system_response_time',
        status.performance.averageResponseTime,
        {
          systemName: this.config.name,
        }
      );
    } catch (error) {
      this.logger.error('Monitoring cycle failed: ', error);
    }
  }

  private async performHealthChecks(): Promise<void> {
    for (const [name, component] of this.components) {
      try {
        // Perform health check if component has one
        if (typeof component.instance.getStats === 'function') {
          const __stats = component.instance.getStats();
          component.healthy = true;
          component.lastHealthCheck = Date.now();
        }
      } catch (error) {
        this.logger.warn(`Health check failed for component ${name}:`, error);
        component.healthy = false;
        component.lastHealthCheck = Date.now();
      }
    }
  }

  private getComponentsHealth(): Map<string, boolean> {
    const health = new Map<string, boolean>();
    for (const [name, component] of this.components) {
      health.set(name, component.healthy);
    }
    return health;
  }

  private calculateOverallStatus(
    componentHealth: Map<string, boolean>
  ): MemorySystemStatus['status'] {
    const healthyCount = Array.from(componentHealth.values()).filter(
      (h) => h
    ).length;
    const totalCount = componentHealth.size;

    if (totalCount === 0) return 'initializing';

    const healthRatio = healthyCount / totalCount;

    if (healthRatio === 1) return 'healthy';
    if (healthRatio >= 0.8) return 'degraded';
    if (healthRatio > 0) return 'unhealthy';

    return 'offline';
  }

  private calculateHealthScore(componentHealth: Map<string, boolean>): number {
    if (componentHealth.size === 0) return 100;

    const healthyCount = Array.from(componentHealth.values()).filter(
      (h) => h
    ).length;
    return Math.round((healthyCount / componentHealth.size) * 100);
  }

  private collectHealthIssues(): string[] {
    const issues: string[] = [];

    for (const [name, component] of this.components) {
      if (!component.healthy) {
        issues.push(`Component '${name}' is unhealthy`);
      }
    }

    return issues;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Add recommendations based on optimization metrics
    if (this.optimization) {
      const metrics = this.optimization.getMetrics();
      if (metrics.health.score < 80) {
        recommendations.push('Consider running optimization cycle');
      }
    }

    // Add recommendations based on component health
    const unhealthyComponents = Array.from(this.components.entries())
      .filter(([, component]) => !component.healthy)
      .map(([name]) => name);

    if (unhealthyComponents.length > 0) {
      recommendations.push(
        `Investigate unhealthy components:${unhealthyComponents.join(',    ')}`
      );
    }

    return recommendations;
  }

  private getAverageResponseTime(): number {
    // Mock implementation - would integrate with actual telemetry
    return Math.random() * 50 + 10;
  }

  private getThroughput(): number {
    // Mock implementation
    return Math.random() * 1000 + 500;
  }

  private getCacheHitRate(): number {
    // Mock implementation
    return Math.random() * 0.3 + 0.7;
  }

  private getErrorRate(): number {
    // Mock implementation
    return Math.random() * 0.02;
  }

  private getStorageUsage(): number {
    // Mock implementation
    return Math.random() * 1000 + 100;
  }

  private getCpuUsage(): number {
    // Mock implementation
    return Math.random() * 0.5 + 0.1;
  }

  private getLastOptimizationTime(): number {
    // Would track from optimization engine
    return Date.now() - 300000; // 5 minutes ago
  }

  // Public methods

  getComponentStatus(componentName: string): ManagedComponent | null {
    return this.components.get(componentName) || null;
  }

  getAllComponents(): Map<string, ManagedComponent> {
    return new Map(this.components);
  }

  async forceOptimization(): Promise<void> {
    if (this.optimization) {
      await this.optimization.forceOptimization();
    }
  }

  async forceTuning(): Promise<void> {
    if (this.performance) {
      await this.performance.forceOptimization();
    }
  }

  updateConfig(newConfig: Partial<MemorySystemConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update component configurations
    if (newConfig.optimization && this.optimization) {
      this.optimization.updateConfig(newConfig.optimization);
    }

    if (newConfig.lifecycle && this.lifecycle) {
      this.lifecycle.updateConfig(newConfig.lifecycle);
    }

    if (newConfig.performance && this.performance) {
      this.performance.updateConfig(newConfig.performance);
    }

    this.logger.info('Memory system configuration updated', newConfig);
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      // Stop monitoring
      if (this.monitoringTimer) {
        clearInterval(this.monitoringTimer);
      }
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
      }

      // Shutdown all components
      for (const [name, component] of this.components) {
        try {
          if (typeof component.instance.shutdown === 'function') {
            await component.instance.shutdown();
          }
        } catch (error) {
          this.logger.error(`Failed to shutdown component ${name}:`, error);
        }
      }

      this.components.clear();
      this.initialized = false;

      this.emit('systemShutdown', { name: this.config.name });
      this.logger.info(`Memory system '${this.config.name}' shut down`);
    } catch (error) {
      this.logger.error(`Error during memory system shutdown:`, error);
      throw error;
    }
  }
}
