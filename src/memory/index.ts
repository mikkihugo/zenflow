/**
 * Memory Module - Enhanced Barrel Export.
 *
 * Central export point for advanced memory management functionality.
 * Includes coordination, optimization, monitoring, and MCP integration.
 */

// Core memory functionality
/**
 * @file memory module exports
 */


export * from './backends/base-backend';
export * from './backends/factory';
export { MemoryBackendFactory as BackendFactory, memoryBackendFactory } from './backends/factory';

// Import types directly for use in factory method
import type { MemoryCoordinationConfig } from './core/memory-coordinator';
import type { MonitoringConfig } from './monitoring/memory-monitor';
import type { OptimizationConfig } from './optimization/performance-optimizer';

// Advanced coordination and optimization
export {
  type CoordinationDecision,
  type MemoryCoordinationConfig,
  MemoryCoordinator,
  type MemoryNode,
} from './core/memory-coordinator';
// Error handling and recovery
export {
  MemoryBackendError,
  MemoryCoordinationError,
  MemoryDataError,
  MemoryError,
  MemoryErrorClassifier,
  MemoryErrorCode,
  type MemoryErrorContext,
  MemoryPerformanceError,
} from './error-handling/memory-errors';
export {
  type RecoveryContext,
  type RecoveryResult,
  type RecoveryStrategy,
  RecoveryStrategyManager,
} from './error-handling/recovery-strategies';

// MCP Tools
export {
  memoryDistributeTool,
  memoryHealthCheckTool,
  memoryInitTool,
  memoryMonitorTool,
  memoryOptimizeTool,
  memoryTools,
} from './mcp/memory-tools';
export { MemoryManager, SessionMemoryStore } from './memory';
// Monitoring and analytics
export {
  type MemoryAlert,
  type MemoryMetrics,
  MemoryMonitor,
  type MonitoringConfig,
} from './monitoring/memory-monitor';
export {
  type OptimizationAction,
  type OptimizationConfig,
  type PerformanceMetrics,
  PerformanceOptimizer,
} from './optimization/performance-optimizer';

// Memory system factory for easy initialization
export class MemorySystemFactory {
  /**
   * Create a complete memory system with all advanced features.
   *
   * @param config
   * @param config.coordination
   * @param config.optimization
   * @param config.monitoring
   * @param config.backends
   */
  static async createAdvancedMemorySystem(config: {
    coordination?: MemoryCoordinationConfig;
    optimization?: OptimizationConfig;
    monitoring?: MonitoringConfig;
    backends?: Array<{ id: string; type: string; config: any }>;
  }) {
    // Import directly from source modules instead of circular self-import
    const { MemoryCoordinator } = await import('./core/memory-coordinator');
    const { PerformanceOptimizer } = await import('./optimization/performance-optimizer');
    const { MemoryMonitor } = await import('./monitoring/memory-monitor');
    const { RecoveryStrategyManager } = await import('./error-handling/recovery-strategies');
    const { MemoryBackendFactory } = await import('./backends/factory');

    // Initialize components
    const coordinator = config?.coordination
      ? new MemoryCoordinator(config?.coordination)
      : undefined;
    const optimizer = config?.optimization
      ? new PerformanceOptimizer(config?.optimization)
      : undefined;
    const monitor = config?.monitoring ? new MemoryMonitor(config?.monitoring) : undefined;
    const recoveryManager = new RecoveryStrategyManager();

    // Initialize backends
    const backends = new Map();
    if (config?.backends) {
      for (const backendConfig of config?.backends) {
        const backend = await MemoryBackendFactory.createBackend(
          backendConfig?.type as any,
          backendConfig?.config
        );
        await backend.initialize();
        backends.set(backendConfig?.id, backend);

        // Register with components
        if (coordinator) await coordinator.registerNode(backendConfig?.id, backend);
        if (optimizer) optimizer.registerBackend(backendConfig?.id, backend);
        if (monitor) monitor.registerBackend(backendConfig?.id, backend);
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
          if (backend && 'cleanup' in backend && typeof backend.cleanup === 'function') {
            await backend.cleanup();
          } else if (backend && 'close' in backend && typeof backend.close === 'function') {
            await backend.close();
          }
        }
      },

      getHealthReport() {
        return (
          monitor?.generateHealthReport() || {
            overall: 'unknown',
            score: 0,
            details: {},
            recommendations: [],
          }
        );
      },

      getStats() {
        const coordinatorStats = coordinator?.getStats();
        const optimizerStats = optimizer?.getStats();
        const monitorStats = monitor?.getStats();
        const recoveryStats = recoveryManager?.getStats();

        return {
          coordinator: coordinatorStats || null,
          optimizer: optimizerStats || null,
          monitor: monitorStats || null,
          recovery: recoveryStats || null,
          backends: backends.size,
          // Add any additional stats structure if needed
          entries: backends.size,
          size: backends.size,
          lastModified: Date.now(),
          namespaces: 1,
        } as any; // Allow flexible return type
      },
    };
  }

  /**
   * Create a basic memory system with essential features.
   *
   * @param backends
   */
  static async createBasicMemorySystem(backends: Array<{ id: string; type: string; config: any }>) {
    return MemorySystemFactory.createAdvancedMemorySystem({
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
