export * from './types.ts';
export * from './backends/base-backend.ts';
export * from './backends/factory.ts';
export { MemoryBackendFactory as BackendFactory, memoryBackendFactory, } from './backends/factory.ts';
export { MemoryCoordinator, } from './core/memory-coordinator.ts';
export { MemoryBackendError, MemoryCoordinationError, MemoryDataError, MemoryError, MemoryErrorClassifier, MemoryErrorCode, MemoryPerformanceError, } from './error-handling/memory-errors.ts';
export { RecoveryStrategyManager, } from './error-handling/recovery-strategies.ts';
export { memoryDistributeTool, memoryHealthCheckTool, memoryInitTool, memoryMonitorTool, memoryOptimizeTool, memoryTools, } from './mcp/memory-tools.ts';
export { MemoryManager, SessionMemoryStore } from './memory.ts';
export { MemoryMonitor, } from './monitoring/memory-monitor.ts';
export { PerformanceOptimizer, } from './optimization/performance-optimizer.ts';
export class MemorySystemFactory {
    static async createAdvancedMemorySystem(config) {
        const { MemoryCoordinator } = await import('./core/memory-coordinator.ts');
        const { PerformanceOptimizer } = await import('./optimization/performance-optimizer.ts');
        const { MemoryMonitor } = await import('./monitoring/memory-monitor.ts');
        const { RecoveryStrategyManager } = await import('./error-handling/recovery-strategies.ts');
        const { MemoryBackendFactory } = await import('./backends/factory.ts');
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
        const backends = new Map();
        if (config?.['backends']) {
            for (const backendConfig of config?.['backends']) {
                const backend = await MemoryBackendFactory.createBackend(backendConfig?.type, backendConfig?.config);
                await backend.initialize();
                backends.set(backendConfig?.id, backend);
                if (coordinator)
                    await coordinator.registerNode(backendConfig?.id, backend);
                if (optimizer)
                    optimizer.registerBackend(backendConfig?.id, backend);
                if (monitor)
                    monitor.registerBackend(backendConfig?.id, backend);
            }
        }
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
                    entries: backends.size,
                    size: backends.size,
                    lastModified: Date.now(),
                    namespaces: 1,
                };
            },
        };
    }
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