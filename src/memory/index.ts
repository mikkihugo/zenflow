/**
 * Memory Module - Enhanced Barrel Export
 *
 * Central export point for advanced memory management functionality
 * Includes coordination, optimization, monitoring, and MCP integration
 */

// Core memory functionality
export * from './backends/base.backend';
export * from './backends/factory';
export { MemoryManager, SessionMemoryStore } from './memory';

// Advanced coordination and optimization
export { MemoryCoordinator, type MemoryCoordinationConfig, type MemoryNode, type CoordinationDecision } from './core/memory-coordinator';
export { PerformanceOptimizer, type OptimizationConfig, type OptimizationAction, type PerformanceMetrics } from './optimization/performance-optimizer';

// MCP Tools
export { memoryTools, memoryInitTool, memoryOptimizeTool, memoryMonitorTool, memoryDistributeTool, memoryHealthCheckTool } from './mcp/memory-tools';

// Error handling and recovery
export {
  MemoryError,
  MemoryErrorCode,
  MemoryCoordinationError,
  MemoryBackendError,
  MemoryDataError,
  MemoryPerformanceError,
  MemoryErrorClassifier,
  type MemoryErrorContext,
} from './error-handling/memory-errors';
export {
  RecoveryStrategyManager,
  type RecoveryStrategy,
  type RecoveryContext,
  type RecoveryResult,
} from './error-handling/recovery-strategies';

// Monitoring and analytics
export {
  MemoryMonitor,
  type MemoryMetrics,
  type MemoryAlert,
  type MonitoringConfig,
} from './monitoring/memory-monitor';

// Memory system factory for easy initialization
export class MemorySystemFactory {
  /**
   * Create a complete memory system with all advanced features
   */
  static async createAdvancedMemorySystem(config: {
    coordination?: MemoryCoordinationConfig;
    optimization?: OptimizationConfig;
    monitoring?: MonitoringConfig;
    backends?: Array<{ id: string; type: string; config: any }>;
  }) {
    const {
      MemoryCoordinator,
      PerformanceOptimizer,
      MemoryMonitor,
      RecoveryStrategyManager,
    } = await import('./index.js');
    const { BackendFactory } = await import('./backends/factory.js');

    // Initialize components
    const coordinator = config.coordination ? new MemoryCoordinator(config.coordination) : undefined;
    const optimizer = config.optimization ? new PerformanceOptimizer(config.optimization) : undefined;
    const monitor = config.monitoring ? new MemoryMonitor(config.monitoring) : undefined;
    const recoveryManager = new RecoveryStrategyManager();

    // Initialize backends
    const backends = new Map();
    if (config.backends) {
      for (const backendConfig of config.backends) {
        const backend = BackendFactory.createBackend(backendConfig.type, backendConfig.config);
        await backend.initialize();
        backends.set(backendConfig.id, backend);

        // Register with components
        if (coordinator) await coordinator.registerNode(backendConfig.id, backend);
        if (optimizer) optimizer.registerBackend(backendConfig.id, backend);
        if (monitor) monitor.registerBackend(backendConfig.id, backend);
      }
    }

    // Cross-register components
    if (monitor) {
      if (coordinator) monitor.registerCoordinator(coordinator);
      if (optimizer) monitor.registerOptimizer(optimizer);
    }

    return {
      coordinator,
      optimizer,
      monitor,
      recoveryManager,
      backends,
      
      // Convenience methods
      async shutdown() {
        if (monitor) monitor.stopCollection();
        for (const backend of backends.values()) {
          await backend.cleanup?.();
        }
      },

      getHealthReport() {
        return monitor?.generateHealthReport() || { overall: 'unknown', score: 0, details: {}, recommendations: [] };
      },

      getStats() {
        return {
          coordinator: coordinator?.getStats(),
          optimizer: optimizer?.getStats(),
          monitor: monitor?.getStats(),
          recovery: recoveryManager?.getStats(),
          backends: backends.size,
        };
      },
    };
  }

  /**
   * Create a basic memory system with essential features
   */
  static async createBasicMemorySystem(backends: Array<{ id: string; type: string; config: any }>) {
    return this.createAdvancedMemorySystem({
      backends,
      coordination: {
        enabled: true,
        consensus: { quorum: 0.67, timeout: 5000, strategy: 'majority' },
        distributed: { replication: 1, consistency: 'eventual', partitioning: 'hash' },
        optimization: { autoCompaction: true, cacheEviction: 'adaptive', memoryThreshold: 0.8 },
      },
      monitoring: {
        enabled: true,
        collectInterval: 5000,
        retentionPeriod: 300000,
        alerts: {
          enabled: true,
          thresholds: { latency: 100, errorRate: 0.05, memoryUsage: 200, cacheHitRate: 0.7 },
        },
        metrics: { detailed: false, histograms: false, percentiles: true },
      },
    });
  }
}
