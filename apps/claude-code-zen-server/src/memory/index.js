/**
 * Memory Domain - Main Export Module
 *
 * @file Central export point for all memory functionality including types,
 * stores, backends, and API controllers. This module serves as the single source
 * of truth for all memory operations and type definitions.
 *
 * Following domain architecture standard with consolidated types.
 */
// Export all memory types (Single Source of Truth)
export * from './types';
/**
 * @deprecated Legacy export structure - use domain types instead
 * @file Memory module legacy exports.
 */
export * from './backends/base-backend';
export * from './backends/factory';
export { MemoryBackendFactory as BackendFactory, memoryBackendFactory, } from './backends/factory';
// Advanced coordination and optimization
export { MemoryCoordinator, } from './core/memory-coordinator';
// Error handling and recovery
export { MemoryBackendError, MemoryCoordinationError, MemoryDataError, MemoryError, MemoryErrorClassifier, MemoryErrorCode, MemoryPerformanceError, } from './error-handling/memory-errors';
export { RecoveryStrategyManager, } from './error-handling/recovery-strategies';
export { MemoryManager, SessionMemoryStore } from './memory';
// Monitoring and analytics
export { MemoryMonitor, } from './monitoring/memory-monitor';
export { PerformanceOptimizer, } from './optimization/performance-optimizer';
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
    static async createAdvancedMemorySystem(config) {
        // Import directly from source modules instead of circular self-import
        const { MemoryCoordinator } = await import('./core/memory-coordinator');
        const { PerformanceOptimizer } = await import('./optimization/performance-optimizer');
        const { MemoryMonitor } = await import('./monitoring/memory-monitor');
        const { RecoveryStrategyManager } = await import('./error-handling/recovery-strategies');
        const { MemoryBackendFactory } = await import('./backends/factory');
        // Initialize components
        const coordinator = config?.['coordination']
            ? new MemoryCoordinator(config?.['coordination'])
            : undefined;
        const optimizer = config?.['optimization']
            ? new PerformanceOptimizer(config?.['optimization'])
            : undefined;
        const monitor = config?.['monitoring']
            ? new MemoryMonitor(config?.['monitoring'])
            : undefined;
        const recoveryManager = new RecoveryStrategyManager();
        // Initialize backends
        const backends = new Map();
        if (config?.['backends']) {
            for (const backendConfig of config?.['backends']) {
                const backend = await MemoryBackendFactory.createBackend(backendConfig?.type, backendConfig?.config);
                await backend.initialize();
                backends.set(backendConfig?.id, backend);
                // Register with components
                if (coordinator)
                    await coordinator.registerNode(backendConfig?.id, backend);
                if (optimizer)
                    optimizer.registerBackend(backendConfig?.id, backend);
                if (monitor)
                    monitor.registerBackend(backendConfig?.id, backend);
            }
        }
        // Cross-register components
        if (monitor) {
            if (coordinator)
                monitor.registerCoordinator(coordinator);
            if (optimizer)
                monitor.registerOptimizer(optimizer);
        }
        return {
            coordinator,
            optimizer,
            monitor,
            recoveryManager,
            backends,
            // Convenience methods
            async shutdown() {
                if (monitor)
                    monitor.stopCollection();
                for (const backend of backends.values()) {
                    if (backend &&
                        'cleanup' in backend &&
                        typeof backend.cleanup === 'function') {
                        await backend.cleanup();
                    }
                    else if (backend &&
                        'close' in backend &&
                        typeof backend.close === 'function') {
                        await backend.close();
                    }
                }
            },
            getHealthReport() {
                return (monitor?.generateHealthReport() || {
                    overall: 'unknown',
                    score: 0,
                    details: {},
                    recommendations: [],
                });
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
                }; // Properly typed return
            },
        };
    }
    /**
     * Create a basic memory system with essential features.
     *
     * @param backends
     */
    static async createBasicMemorySystem(backends) {
        return MemorySystemFactory.createAdvancedMemorySystem({
            backends,
            coordination: {
                enabled: true,
                consensus: { quorum: 0.67, timeout: 5000, strategy: 'majority' },
                distributed: {
                    replication: 1,
                    consistency: 'eventual',
                    partitioning: 'hash',
                },
                optimization: {
                    autoCompaction: true,
                    cacheEviction: 'adaptive',
                    memoryThreshold: 0.8,
                },
            },
            monitoring: {
                enabled: true,
                collectInterval: 5000,
                retentionPeriod: 300000,
                alerts: {
                    enabled: true,
                    thresholds: {
                        latency: 100,
                        errorRate: 0.05,
                        memoryUsage: 200,
                        cacheHitRate: 0.7,
                    },
                },
                metrics: { detailed: false, histograms: false, percentiles: true },
            },
        });
    }
}
//# sourceMappingURL=index.js.map