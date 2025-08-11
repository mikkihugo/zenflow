/**
 * Memory Domain - Main Export Module
 *
 * @file Central export point for all memory functionality including types,
 * stores, backends, and API controllers. This module serves as the single source
 * of truth for all memory operations and type definitions.
 *
 * Following domain architecture standard with consolidated types.
 */
export * from './types.ts';
/**
 * @deprecated Legacy export structure - use domain types instead
 * @file Memory module legacy exports.
 */
export * from './backends/base-backend.ts';
export * from './backends/factory.ts';
export { MemoryBackendFactory as BackendFactory, memoryBackendFactory, } from './backends/factory.ts';
import type { MemoryCoordinationConfig } from './core/memory-coordinator.ts';
import type { MonitoringConfig } from './monitoring/memory-monitor.ts';
import type { OptimizationConfig } from './optimization/performance-optimizer.ts';
export { type CoordinationDecision, type MemoryCoordinationConfig, MemoryCoordinator, type MemoryNode, } from './core/memory-coordinator.ts';
export { MemoryBackendError, MemoryCoordinationError, MemoryDataError, MemoryError, MemoryErrorClassifier, MemoryErrorCode, type MemoryErrorContext, MemoryPerformanceError, } from './error-handling/memory-errors.ts';
export { type RecoveryContext, type RecoveryResult, type RecoveryStrategy, RecoveryStrategyManager, } from './error-handling/recovery-strategies.ts';
export { memoryDistributeTool, memoryHealthCheckTool, memoryInitTool, memoryMonitorTool, memoryOptimizeTool, memoryTools, } from './mcp/memory-tools.ts';
export { MemoryManager, SessionMemoryStore } from './memory.ts';
export { type MemoryAlert, type MemoryMetrics, MemoryMonitor, type MonitoringConfig, } from './monitoring/memory-monitor.ts';
export { type OptimizationAction, type OptimizationConfig, type PerformanceMetrics, PerformanceOptimizer, } from './optimization/performance-optimizer.ts';
export declare class MemorySystemFactory {
    /**
     * Create a complete memory system with all advanced features.
     *
     * @param config
     * @param config.coordination
     * @param config.optimization
     * @param config.monitoring
     * @param config.backends
     */
    static createAdvancedMemorySystem(config: {
        coordination?: MemoryCoordinationConfig;
        optimization?: OptimizationConfig;
        monitoring?: MonitoringConfig;
        backends?: Array<{
            id: string;
            type: string;
            config: Record<string, unknown>;
        }>;
    }): Promise<{
        coordinator: import("./core/memory-coordinator.ts").MemoryCoordinator | undefined;
        optimizer: import("./optimization/performance-optimizer.ts").PerformanceOptimizer | undefined;
        monitor: import("./monitoring/memory-monitor.ts").MemoryMonitor | undefined;
        recoveryManager: import("./error-handling/recovery-strategies.ts").RecoveryStrategyManager;
        backends: Map<any, any>;
        shutdown(): Promise<void>;
        getHealthReport(): {
            overall: "healthy" | "warning" | "critical";
            score: number;
            details: Record<string, any>;
            recommendations: string[];
        } | {
            overall: "unknown";
            score: number;
            details: {};
            recommendations: never[];
        };
        getStats(): MemoryStats;
    }>;
    /**
     * Create a basic memory system with essential features.
     *
     * @param backends
     */
    static createBasicMemorySystem(backends: Array<{
        id: string;
        type: string;
        config: Record<string, unknown>;
    }>): Promise<{
        coordinator: import("./core/memory-coordinator.ts").MemoryCoordinator | undefined;
        optimizer: import("./optimization/performance-optimizer.ts").PerformanceOptimizer | undefined;
        monitor: import("./monitoring/memory-monitor.ts").MemoryMonitor | undefined;
        recoveryManager: import("./error-handling/recovery-strategies.ts").RecoveryStrategyManager;
        backends: Map<any, any>;
        shutdown(): Promise<void>;
        getHealthReport(): {
            overall: "healthy" | "warning" | "critical";
            score: number;
            details: Record<string, any>;
            recommendations: string[];
        } | {
            overall: "unknown";
            score: number;
            details: {};
            recommendations: never[];
        };
        getStats(): MemoryStats;
    }>;
}
//# sourceMappingURL=index.d.ts.map